# CONVENTIONS.md — API Standards & Rules

## URL Structure
```
/api/v1/{service}/{resource}/{id?}/{sub-resource?}
```
Plural nouns. No verbs. Action lives in HTTP method.

| ❌ Wrong | ✓ Right |
|---------|--------|
| POST /academic/submitEnrollment | POST /academic/enrollments |
| GET /finance/getInvoiceById/5 | GET /finance/invoices/5 |
| POST /library/doReturn/12 | PATCH /library/loans/12/return |
| GET /auth/checkToken | GET /auth/validate |

---

## HTTP Methods

| Intent | Method | Body | Success Code | Notes |
|--------|--------|------|-------------|-------|
| List | GET | — | 200 | Paginated by default |
| Fetch one | GET | — | 200 | 404 if not found |
| Create | POST | JSON | 201 + Location header | |
| Full replace | PUT | JSON | 200 | 404 if not exists |
| Partial update | PATCH | JSON (diff only) | 200 | |
| State transition | PATCH | JSON | 200 | e.g. /loans/{id}/return |
| Delete | DELETE | — | 204 | Soft delete preferred |

---

## Response Envelope

All responses (200–5xx) use this structure:

```json
{
  "status": "success | error",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "hasNext": true,
    "timestamp": "2025-07-01T08:00:00+07:00"
  },
  "errors": []
}
```

- `data` is `null` on error responses.
- `meta` always includes `timestamp`. Pagination fields only on list responses.
- `errors` is `[]` on success.

---

## Error Response

```json
{
  "status": "error",
  "data": null,
  "meta": { "timestamp": "2025-07-01T08:00:00+07:00" },
  "errors": [
    {
      "code": "PREREQUISITE_NOT_MET",
      "field": "courseId",
      "message": "Mata kuliah Algoritma belum lulus."
    }
  ]
}
```

### Error Code Format
`SCREAMING_SNAKE_CASE` string. Describes the problem, not the location.

| Code | HTTP | When |
|------|------|------|
| `VALIDATION_ERROR` | 400 | Input doesn't match schema |
| `INVALID_FORMAT` | 400 | Wrong type, malformed UUID, etc. |
| `UNAUTHORIZED` | 401 | Missing or expired JWT |
| `FORBIDDEN` | 403 | Valid JWT, insufficient scope |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `CONFLICT` | 409 | Duplicate enrollment, active loan exists |
| `PREREQUISITE_NOT_MET` | 422 | Business rule: prasyarat belum lulus |
| `CAPACITY_FULL` | 422 | Kelas penuh |
| `UNPAID_INVOICE` | 422 | Tunggakan SPP memblokir KRS |
| `BOOK_UNAVAILABLE` | 422 | Semua stok dipinjam |
| `BELOW_ATTENDANCE_THRESHOLD` | 422 | Kehadiran < 75%, tidak bisa daftar ujian |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `SERVICE_UNAVAILABLE` | 503 | Downstream timeout / ESB cannot reach service |

Multiple errors are allowed in `errors[]` (useful for batch validation).
Never expose stack traces. Never return `500` with error detail beyond a generic message.

---

## Authentication

Every endpoint except `POST /auth/login` requires:
```
Authorization: Bearer <access_token>
```

Scope enforcement:
- ESB validates JWT signature.
- Each service validates scope claims for write operations.
- ESB forwards user identity in `X-User-Id` and `X-User-Role` headers to services.

SOAP endpoints (student-affairs): `WS-Security UsernameToken` in SOAP header.
ESB translates Bearer JWT → WS-Security internally. Client never sees SOAP.

---

## Idempotency

POST endpoints that can be retried must support `Idempotency-Key` header:
```
Idempotency-Key: <uuid-v4>
```
Applies to: `POST /finance/payments`, `POST /library/loans`, `POST /academic/enrollments`.
Same key within 24h → return cached response, no duplicate action.

---

## Deprecation

When breaking change required → introduce `/api/v2/`. Keep v1 alive 6 months minimum.
Deprecated endpoints must return:
```
Deprecation: true
Sunset: Sat, 01 Jan 2026 00:00:00 GMT
Link: <https://api.nexusedu.id/api/v2/academic>; rel="successor-version"
```

---

## Dates
ISO 8601 with timezone. Always. No epoch. No relative strings.
```
✓  "2025-07-01T08:00:00+07:00"
✗  1751385600
✗  "next Monday"
✗  "2025-07-01"  (omit time only if genuinely date-only context)
```