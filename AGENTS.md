# AGENTS.md — NexusEdu Integration Platform
> IAE Assignment 2 (graded: design + docs) · Built through to full implementation as a portfolio
> project (Devin's choice, beyond the assignment minimum — see ADR-009) · SOA Web-Based + ESB ·
> Telkom University

---

## Read First (in order)

| File | Purpose |
|------|---------|
| `docs/CONTEXT.md` | Academic brief, constraints, grading rubric, deadlines |
| `docs/ARCHITECTURE.md` | Full service specs, ESB routing, data models, stack, ADRs |
| `docs/CONVENTIONS.md` | API standards, error codes, HTTP rules, pagination |
| `DESIGN.md` | Visual identity — colors, typography, components (frontend only) |
| `vault/000-INDEX.md` | Obsidian second brain structure for this project |

If you're in a backend coding session: read ARCHITECTURE.md + CONVENTIONS.md.
If you're in a frontend/UI session: read DESIGN.md. Don't load it for backend-only work.
If you're writing documentation: read CONVENTIONS.md.
If you're designing a new endpoint: read CONTEXT, ARCHITECTURE, CONVENTIONS (not DESIGN.md).

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

**Application stack:** Node.js/Express (backend, identical across all 6 services) · Prisma + PostgreSQL
(Supabase, one schema per service) · React/Vite + Tailwind CSS (frontend) · RabbitMQ (AMQP, async notifications only). Full rationale in ARCHITECTURE.md ADR-006.

**Repo layout:** Monorepo, npm workspaces (`esb-gateway/`, `services/{name}/`, `frontend/`).
Full tree + rationale in ARCHITECTURE.md → Repository Structure (ADR-008). Don't guess paths — they're already defined there.

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

**Implementation** (ADR-009 — portfolio scope, not graded but real)
- Prisma is the ORM, no exceptions per service (ADR-006). `prisma migrate dev` before writing routes.
- Validate every request body with Zod before it touches a controller.
- Controllers return the exact envelope shape from CONVENTIONS.md — never a raw Prisma object.
- Test the happy path AND at least one error path before considering an endpoint done.
- Don't hand-test against a service port directly once the ESB gateway exists — go through it.

---

## Vault (Second Brain)

Project knowledge lives in: `C:/second_brain/Projects/NexusEdu-IAE/`

When you learn something about this project (a decision, a constraint, a pattern), write it there.
When you need context about a past decision, read there first.

See `vault/000-INDEX.md` for the full vault structure and note templates.

---

## Deliverables Checklist (Graded — Assignment Minimum)

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

## Implementation Checklist (Not Graded — Portfolio Scope, ADR-009)

```
□ Repo scaffolded per ARCHITECTURE.md → Repository Structure (npm workspaces)
□ docker-compose.yml — Postgres + RabbitMQ running locally
□ Prisma schema + migration per service (auth, academic, finance, library, student-affairs)
□ Express skeleton + health check per service
□ ESB gateway: routing, JWT validation, correlation ID middleware
□ ESB gateway: Aggregator pattern (/student/dashboard)
□ ESB gateway: Saga pattern (enrollment)
□ ESB gateway: SOAP bridge (student-affairs, strong-soap + XSLT-equivalent transform)
□ notification-service: AMQP consumer + DLQ
□ Frontend scaffold (Vite + Tailwind, tokens from DESIGN.md)
□ Frontend: auth flow (login, protected routes)
□ Frontend: dashboard page (consumes aggregator endpoint)
```

Order matters less for the Deliverables checklist (docs can be written in any order) but matters a lot for Implementation — auth-service should be built and runnable before anything that depends on its JWT validation.