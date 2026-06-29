# ARCHITECTURE.md — Full Technical Specification

## Stack

| Layer | Technology |
|-------|-----------|
| ESB Pattern | Apache Camel (conceptual) / WSO2 ESB |
| Transport | HTTP/HTTPS · AMQP (async notifications) |
| Protocols | REST (primary) · SOAP 1.2 (student-affairs legacy) |
| Serialization | JSON (internal) · XML (SOAP contracts) |
| Auth | JWT Bearer (REST) · WS-Security UsernameToken (SOAP) |
| API Docs | OpenAPI 3.1 YAML · WSDL 2.0 |
| Versioning | URI: `/api/v1/` |

---

## Architecture Decision Records

### ADR-001 — ESB as Single External Entry Point
**Decision:** All external traffic routes through ESB `:8000`. Service ports are internal-only.
**Rationale:** Centralizes auth enforcement, rate limiting, logging, and transformation.
Prevents tight coupling between consumers and service internals.
**Consequence:** ESB is a single point of failure — mitigated with clustering in prod.

### ADR-002 — REST Primary, SOAP Only for Legacy
**Decision:** REST/JSON for 5 services. SOAP only for student-affairs (simulates legacy system).
**Rationale:** Assignment requires at least one SOAP integration. Student-affairs is isolated enough
that SOAP doesn't infect other services. ESB handles the bridge transparently.
**Consequence:** ESB must maintain XSLT transformation mappings for student-affairs.

### ADR-003 — Notification Service is Async-Only
**Decision:** No synchronous calls to notification-service. ESB publishes to AMQP queue.
**Rationale:** Notifications are non-critical for main workflow. Sync calls add latency and
create failure dependency. DLQ handles retries without blocking enrollment/payment flows.
**Consequence:** Notification delivery is eventually consistent, not immediate.

### ADR-004 — Aggregator Pattern for Student Dashboard
**Decision:** `/api/v1/student/dashboard` is an ESB-owned aggregation endpoint.
**Rationale:** Avoids chatty client (3 separate calls) without creating a service for a single UI need.
ESB is the right place for this fan-out since it already orchestrates inter-service calls.
**Consequence:** ESB timeout (800ms) governs dashboard SLA. Partial data returned on timeout.

### ADR-005 — Saga for Enrollment Workflow
**Decision:** Enrollment is a multi-step saga with compensation.
Steps: check finance → check prerequisite → create enrollment → notify.
**Rationale:** Enrollment touches two services (finance + academic). Distributed transaction
without 2PC. Compensation on step 2 failure = skip enrollment, return error.
**Consequence:** No rollback needed for step 3 failure (notification is fire-and-forget).

---

## Service Catalog

### auth-service · `:8001`
SSO gateway. Issues JWT. Validates every inbound request at ESB level.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /auth/login | None | Credential → JWT |
| POST | /auth/refresh | Refresh token | Rotate access token |
| POST | /auth/logout | Bearer | Invalidate refresh token |
| GET | /auth/validate | Bearer | Token introspection |
| GET | /auth/me | Bearer | Current user profile |

JWT payload:
```json
{
  "sub": "1234567890",
  "nim": "1301210XXX",
  "role": "student",
  "scope": ["academic:read", "finance:read", "library:read"],
  "exp": 1751385600,
  "iss": "nexusedu-auth-service"
}
```

---

### academic-service · `:8002`
Core academic domain. Read-heavy. Most list endpoints support ETags.

| Method | Endpoint | Scope | Description |
|--------|----------|-------|-------------|
| GET | /academic/courses | academic:read | List mata kuliah (paginated) |
| GET | /academic/courses/{courseId} | academic:read | Detail + prasyarat |
| GET | /academic/schedule | academic:read | Jadwal semester aktif |
| POST | /academic/enrollments | academic:write | Ambil KRS |
| GET | /academic/enrollments | academic:read | KRS aktif mahasiswa |
| DELETE | /academic/enrollments/{id} | academic:write | Drop mata kuliah |
| GET | /academic/grades | academic:read | Nilai semester aktif |
| GET | /academic/transcript | academic:read | Transkrip lengkap |

---

### finance-service · `:8003`
Billing domain. All write ops require `finance:write` scope.

| Method | Endpoint | Scope | Description |
|--------|----------|-------|-------------|
| GET | /finance/invoices | finance:read | List tagihan (filter: status) |
| GET | /finance/invoices/{id} | finance:read | Detail tagihan |
| POST | /finance/payments | finance:write | Submit pembayaran |
| GET | /finance/payments/{id} | finance:read | Status pembayaran |
| GET | /finance/scholarships | finance:read | List beasiswa aktif |
| POST | /finance/scholarships/apply | finance:write | Ajukan beasiswa |

---

### library-service · `:8004`
Collection and loan management.

| Method | Endpoint | Scope | Description |
|--------|----------|-------|-------------|
| GET | /library/catalog | library:read | Cari koleksi (q, genre, available) |
| GET | /library/catalog/{bookId} | library:read | Detail + stok tersedia |
| POST | /library/loans | library:write | Pinjam buku |
| GET | /library/loans | library:read | Pinjaman aktif |
| PATCH | /library/loans/{id}/return | library:write | Kembalikan buku |
| GET | /library/fines | library:read | Denda aktif |

---

### student-affairs-service · `:8005`
Attendance and counseling. **SOAP bridge active.**
ESB translates REST → SOAP (via XSLT) before forwarding. Client always sees REST/JSON.

| Method | Endpoint | Scope | Description |
|--------|----------|-------|-------------|
| GET | /student-affairs/attendance | affairs:read | Rekap kehadiran per matkul |
| POST | /student-affairs/counseling/sessions | affairs:write | Buat jadwal konseling |
| GET | /student-affairs/counseling/sessions | affairs:read | List sesi konseling |
| GET | /student-affairs/violations | affairs:read | Riwayat pelanggaran |

SOAP Operations (internal, ESB-facing):
- `GetAttendanceDetail(nim, courseId, semester)`
- `SubmitAttendanceBatch(records[])`
- `GetViolationHistory(nim)`

WSDL: `docs/wsdl/StudentAttendanceLegacyService.wsdl`

---

### notification-service · `:8006`
**Async consumer only.** No REST endpoints exposed externally.
Consumes from AMQP queue `nexusedu.notifications`.

AMQP message schema:
```json
{
  "recipient": "mahasiswa@student.telkomuniversity.ac.id",
  "channel": "email | sms | push",
  "template": "ENROLLMENT_CONFIRMED | PAYMENT_RECEIVED | FINE_OVERDUE | EXAM_REMINDER",
  "payload": {},
  "priority": "high | normal | low",
  "idempotencyKey": "uuid-v4"
}
```

Retry: 3 attempts with exponential backoff (1s, 4s, 16s).
On exhaustion: route to DLQ `nexusedu.notifications.dlq`, emit structured log + ops alert.

---

## ESB Routing Table

| Route Pattern | Target Service | ESB Pattern | Notes |
|---------------|---------------|-------------|-------|
| /api/v1/auth/** | auth-service:8001 | Passthrough | No auth check (IS auth) |
| /api/v1/academic/** | academic-service:8002 | Passthrough | JWT validated first |
| /api/v1/finance/** | finance-service:8003 | Passthrough | Scope check: finance:read/write |
| /api/v1/library/** | library-service:8004 | Passthrough | JWT validated first |
| /api/v1/student-affairs/** | student-affairs:8005 | Content Router + XSLT | REST→SOAP bridge |
| /api/v1/student/dashboard | academic + finance + library | Aggregator | Fan-out, 800ms timeout |
| POST /api/v1/academic/enrollments | finance + academic + queue | Saga | Compensating transaction |

Health endpoints (bypass ESB — direct to service):
`GET /{service-host}/health` → `{ "status": "ok", "uptime": 12345, "version": "1.0.0" }`

---

## Shared Data Models

### Pagination (all list responses)
```json
"meta": {
  "page": 1,
  "limit": 20,
  "total": 150,
  "hasNext": true,
  "timestamp": "2025-07-01T08:00:00+07:00"
}
```
Query params: `?page=1&limit=20&sort=created_at:desc` · Max limit: 100

### User Identity (embedded in auth context)
```json
{
  "id": "uuid-v4",
  "nim": "1301210XXX",
  "name": "Nama Lengkap",
  "email": "nim@student.telkomuniversity.ac.id",
  "role": "student | lecturer | staff | admin",
  "faculty": "FIT",
  "major": "Sistem Informasi"
}
```

### Course Object
```json
{
  "id": "uuid-v4",
  "code": "MKB3G4",
  "name": "Integrasi Aplikasi Enterprise",
  "credits": 3,
  "semester": 5,
  "prerequisites": ["uuid-of-prerequisite"],
  "capacity": 40,
  "enrolled": 32
}
```