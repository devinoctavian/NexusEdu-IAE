# AGENTS.md — NexusEdu Integration Platform
> IAE Assignment 2 · SOA Web-Based + ESB · Telkom University

---

## Read First (in order)

| File | Purpose |
|------|---------|
| `docs/CONTEXT.md` | Academic brief, constraints, grading rubric, deadlines |
| `docs/ARCHITECTURE.md` | Full service specs, ESB routing, data models, ADRs |
| `docs/CONVENTIONS.md` | API standards, error codes, HTTP rules, pagination |
| `vault/000-INDEX.md` | Obsidian second brain structure for this project |

If you're in a coding session: read ARCHITECTURE.md.
If you're writing documentation: read CONVENTIONS.md.
If you're designing a new endpoint: read all four.

---

## Project in 60 Seconds

Six services. One ESB gateway. All external traffic enters via `:8000/api/v1/`.
No service talks directly to another service — ever. ESB routes, transforms, orchestrates.

```
Client → ESB (:8000)
           ├── auth-service        (:8001) — JWT SSO
           ├── academic-service    (:8002) — KRS, nilai, jadwal, transkrip
           ├── finance-service     (:8003) — SPP, tagihan, beasiswa
           ├── library-service     (:8004) — katalog, pinjam, denda
           ├── student-affairs     (:8005) — absensi, konseling [SOAP bridge]
           └── notification-svc    (:8006) — email/SMS/push [async only]
```

Three ESB patterns in use: **Passthrough** (most routes), **Aggregator** (`/student/dashboard`),
**Saga** (enrollment workflow with compensation).

---

## Non-Negotiable Rules

**Architecture**
- ESB is the ONLY entry point. Never expose service ports externally.
- No service-to-service calls. ESB mediates everything.
- No business logic in ESB. ESB = route + transform only.
- notification-service is ALWAYS async. Never block on it.

**API Design**
- No verbs in URLs. HTTP method carries the action.
- All responses use the standard envelope: `{ status, data, meta, errors }`.
- Error `code` is `SCREAMING_SNAKE_CASE`. No custom prefix formats.
- ISO 8601 dates. No epoch. No exceptions.
- 200 OK is never returned for an error. Ever.
- `/api/v1/` versioning prefix on every route from day one.

**Documentation**
- Every endpoint must have: description, auth requirement, request schema, response schema, all error codes.
- OpenAPI spec references ESB gateway URL, not direct service URL.
- Sequence diagrams are required for all orchestration patterns (not passthrough).

---

## Vault (Second Brain)

Project knowledge lives in: `C:/second_brain/Projects/NexusEdu-IAE/`

When you learn something about this project (a decision, a constraint, a pattern), write it there.
When you need context about a past decision, read there first.

See `vault/000-INDEX.md` for the full vault structure and note templates.

---

## Deliverables Checklist

```
□ docs/openapi/auth-service.yaml
□ docs/openapi/academic-service.yaml
□ docs/openapi/finance-service.yaml
□ docs/openapi/library-service.yaml
□ docs/openapi/student-affairs-service.yaml
□ docs/wsdl/StudentAttendanceLegacyService.wsdl
□ docs/esb-routing-table.md
□ docs/sequence-enrollment-saga.png
□ docs/sequence-dashboard-aggregator.png
□ docs/sequence-rest-soap-bridge.png
□ docs/soa-architecture-overview.png
```