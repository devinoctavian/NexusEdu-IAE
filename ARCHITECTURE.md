# ARCHITECTURE.md — Full Technical Specification

## Stack

### Architecture / Protocol Layer

| Layer | Technology |
|-------|-----------|
| ESB Pattern | Apache Camel (conceptual) / WSO2 ESB |
| Transport | HTTP/HTTPS · AMQP (async notifications) |
| Protocols | REST (primary) · SOAP 1.2 (student-affairs legacy) |
| Serialization | JSON (internal) · XML (SOAP contracts) |
| Auth | JWT Bearer (REST) · WS-Security UsernameToken (SOAP) |
| API Docs | OpenAPI 3.1 YAML · WSDL 2.0 |
| Versioning | URI: `/api/v1/` |

### Application Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Backend Runtime | Node.js (LTS) + Express | Used identically across all 6 services |
| Frontend | React (Vite) | Same toolchain as GymTrack Dashboard |
| Styling | Tailwind CSS | Tokens sourced from `DESIGN.md` — see [[DESIGN]] |
| Database | PostgreSQL | Hosted via Supabase, one logical `schema` per service |
| ORM | Prisma | See ADR-006 for rationale vs Drizzle |
| Message Broker | RabbitMQ (AMQP) | Used only by notification-service consumer + ESB producer |

### Backend Toolkit (per-service dependencies)

| Concern | Package | Used in |
|---------|---------|---------|
| Validation | `zod` | All services — validate request body before hitting Prisma |
| Auth (issue/verify) | `jsonwebtoken`, `bcrypt` | auth-service primarily; `jsonwebtoken` verify also at ESB |
| Security middleware | `helmet`, `cors`, `express-rate-limit` | ESB gateway layer |
| SOAP server | `strong-soap` | student-affairs-service only |
| XML↔JSON transform | `xml2js` or `fast-xml-parser` | ESB transformation layer |
| AMQP client | `amqplib` | ESB (producer) + notification-service (consumer) |
| Logging | `pino` + `pino-http` | All services — structured logs, correlation ID support |
| Env management | `dotenv` | All services (ESM import pattern, per GymTrack precedent) |
| Testing | `vitest` + `supertest` | All services |
| API doc serving (optional) | `swagger-ui-express` | ESB gateway, serves merged OpenAPI specs |

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
**Rationale:** Avoids chatty client (3 separate calls) without creating a service for a single UI need. ESB is the right place for this fan-out since it already orchestrates inter-service calls.
**Consequence:** ESB timeout (800ms) governs dashboard SLA. Partial data returned on timeout.

### ADR-005 — Saga for Enrollment Workflow
**Decision:** Enrollment is a multi-step saga with compensation. Steps: check finance → check prerequisite → create enrollment → notify.
**Rationale:** Enrollment touches two services (finance + academic). Distributed transaction
without 2PC. Compensation on step 2 failure = skip enrollment, return error.
**Consequence:** No rollback needed for step 3 failure (notification is fire-and-forget).

### ADR-006 — Prisma over Drizzle for ORM
**Decision:** Use Prisma as the ORM across all 5 REST services (notification-service has no DB).
**Rationale:** Both Prisma and Drizzle are production-grade in 2026. Drizzle wins for edge/serverless deployment (Cloudflare Workers, Bun) thanks to near-zero bundle size. Prisma wins for classic Node.js + PostgreSQL backends due to ecosystem maturity, documentation depth, and lower onboarding cost — exactly NexusEdu's situation, since deployment target is traditional Node/Express, not edge runtime. As an academic deliverable under deadline pressure, Prisma's larger community (tutorials, Stack Overflow coverage, Prisma Studio for visual debugging) reduces time lost to tooling friction. Drizzle's main advantage — SQL-first control for teams with strong SQL fluency optimizing at scale — isn't the priority here.
**Consequences:** Slightly larger bundle/cold-start than Drizzle (irrelevant — no edge deployment planned).`prisma generate` adds a build step but is a one-time cost per schema change, not per request.

### ADR-007 — DESIGN.md as Separate File from ARCHITECTURE.md
**Decision:** Visual design tokens and UI rationale live in root-level `DESIGN.md` (Google's open DESIGN.md spec), not inside ARCHITECTURE.md or CONVENTIONS.md. **Rationale:** Design tokens and architecture decisions have different audiences (frontend session vs backend/API session) and different update cadences (a color change shouldn't touch architecture docs, and vice versa). DESIGN.md is an emerging open standard (Apache 2.0, Google Labs) with its own tooling (lint, export to Tailwind config) that only works if the file is structured per spec and named `DESIGN.md`. Mixing it into another file would break that tooling compatibility and bloat context for agents that don't need design tokens for their current task. **Consequence:** Two top-level reference files exist (`AGENTS.md` for conventions, `DESIGN.md` for visual identity) instead of one. AGENTS.md's "Read First" table routes agents to the correct one.

### ADR-008 — Monorepo with npm Workspaces
**Decision:** Single repository, npm workspaces (`services/*`, `esb-gateway`, `frontend`), not
separate repos per service.
**Rationale:** This is a single-developer academic deliverable, not a multi-team production system.
Six+ separate repos would mean six+ sets of CI config, six places to sync shared conventions, and a
much harder submission/grading experience. A monorepo with workspaces keeps shared tooling (eslint,
prettier, vitest config) defined once at the root while still letting each service have its own
`package.json` and dependencies — the npm workspaces feature exists precisely for this shape.
**Consequence:** `npm install` at the root installs all services' dependencies. Running a single
service for local dev requires `npm run dev --workspace=services/auth-service` (or equivalent script).
**Alternatives rejected:** Separate git repos per service — correct for a real multi-team
organization, overkill and actively harmful to deliverable clarity for this assignment. Full repo
tree is documented under Repository Structure below.

### ADR-009 — Scope Extended to Full Implementation Beyond Assignment Minimum
**Decision:** NexusEdu is built through to working code and a running database, not stopped at the
design/documentation deliverables the assignment grades on.
**Context:** The IAE Assignment 2 brief (see `docs/CONTEXT.md` and vault `Brief.md`) only requires
design and documentation — 12 specific deliverables (OpenAPI specs, WSDL, ESB routing/transformation
docs, diagrams). No working backend was required. Earlier versions of this AGENTS.md system reflected
that minimum scope, which created a real contradiction once a concrete stack (Node/Express/Prisma/
PostgreSQL/React) and repo structure were defined — those only make sense if code actually gets built.
**Rationale:** Devin wants NexusEdu to function as a portfolio-quality project, not just a graded
artifact that's abandoned after submission. The 12 graded deliverables remain unchanged and are
still the priority for grading purposes, but every document in this system should now be written
assuming the code will actually run, not merely be diagrammed.
**Consequence:** `docs/CONTEXT.md`'s "Out of Scope" section was revised — database schema design and
code implementation are no longer excluded. `vault/Progress.md` now tracks a separate "Implementation"
checklist alongside the original "Deliverables" checklist, since these are two distinct tracks with
different stakes (one is graded, one isn't).
**Alternatives rejected:** Keep documentation-only scope and treat the stack/repo-structure decisions
as purely aspirational/unbuilt — rejected because it leaves the AGENTS.md system internally
contradictory (defining an ORM and folder structure nobody intends to use is worse than not defining
one at all).

---

## Database Schema Isolation

Single PostgreSQL instance (Supabase), but every service owns its own `schema` namespace.
No service queries another service's schema directly — this is what makes "zero shared database"
enforceable in practice without provisioning 5 separate database clusters (overkill for this assignment).

| Service | Schema | Prisma `schema.prisma` location |
|---------|--------|----------------------------------|
| auth-service | `auth` | `services/auth-service/prisma/schema.prisma` |
| academic-service | `academic` | `services/academic-service/prisma/schema.prisma` |
| finance-service | `finance` | `services/finance-service/prisma/schema.prisma` |
| library-service | `library` | `services/library-service/prisma/schema.prisma` |
| student-affairs-service | `student_affairs` | `services/student-affairs-service/prisma/schema.prisma` |
| notification-service | — (no DB; queue-only) | — |

Each service has its own `DATABASE_URL` env var pointing to the same Postgres instance but scoped
to its schema via `?schema=` connection parameter. This is a pragmatic middle ground: enforces
logical isolation (the SOA principle the assignment grades on) without the infrastructure overhead
of 5 separate database servers.

---

## Repository Structure

**Monorepo, npm workspaces.** Not 6 separate repos — single-developer academic project, and a
single repo is far simpler to submit/grade than coordinating 6+ repos. Each service is still
independently deployable in principle (per ADR-001), the monorepo is purely a development/grading
convenience and does not violate service isolation.

```
nexusedu-iae/
├── AGENTS.md
├── DESIGN.md
├── package.json                  ← workspace root (npm workspaces: "services/*", "esb-gateway", "frontend")
├── docker-compose.yml            ← local Postgres + RabbitMQ for dev
├── .env.example
│
├── docs/
│   ├── CONTEXT.md
│   ├── ARCHITECTURE.md
│   ├── CONVENTIONS.md
│   ├── openapi/
│   │   ├── auth-service.yaml
│   │   ├── academic-service.yaml
│   │   ├── finance-service.yaml
│   │   ├── library-service.yaml
│   │   └── student-affairs-service.yaml
│   └── wsdl/
│       └── StudentAttendanceLegacyService.wsdl
│
├── esb-gateway/                  ← :8000, the only externally-exposed entry point
│   ├── src/
│   │   ├── routes/               ← one file per service prefix (auth.routes.js, academic.routes.js, ...)
│   │   ├── transformers/         ← XSLT-equivalent JSON↔XML mapping for student-affairs bridge
│   │   ├── patterns/             ← aggregator.js (dashboard fan-out), saga.js (enrollment orchestration)
│   │   ├── middleware/           ← auth-validate.js, rate-limit.js, correlation-id.js
│   │   └── index.js
│   └── package.json
│
├── services/
│   ├── auth-service/             ← :8001
│   │   ├── prisma/schema.prisma
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── controllers/
│   │   │   ├── services/         ← business logic, separate from controllers
│   │   │   └── index.js
│   │   └── package.json
│   ├── academic-service/         ← :8002 (same internal shape as auth-service)
│   ├── finance-service/          ← :8003
│   ├── library-service/          ← :8004
│   ├── student-affairs-service/  ← :8005, includes src/soap/ for SOAP server (strong-soap)
│   └── notification-service/     ← :8006, no prisma/ (queue-only)
│       ├── src/
│       │   ├── consumers/        ← AMQP queue consumer
│       │   └── templates/        ← email/sms/push template renderers
│       └── package.json
│
└── frontend/                     ← React + Vite + Tailwind
    ├── tailwind.config.js        ← tokens manually synced from DESIGN.md (or via `design.md export`)
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── hooks/
    │   ├── lib/                  ← API client, calls ESB gateway only — never a service port directly
    │   └── App.jsx
    └── package.json
```

**Note on the vault:** the Obsidian second brain (`vault/` as referenced throughout this doc) is
**not part of this repository**. It lives separately at `C:/second_brain/Projects/NexusEdu-IAE/`,
matching the existing GymTrack convention of keeping the second brain outside the projects directory.
Don't expect to find a `vault/` folder inside `nexusedu-iae/` — it's an external knowledge base, not
a deliverable folder.

Rationale for monorepo + npm workspaces over separate repos per service: see ADR-008 in
Architecture Decision Records above.

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