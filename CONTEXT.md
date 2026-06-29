# CONTEXT.md — Academic & Project Context

## Course
**Mata Kuliah:** Integrasi Aplikasi Enterprise (IAE)
**Tugas:** 2 — Perancangan API Berbasis SOA + Enterprise Service Bus
**Institusi:** Telkom University — Program Studi Sistem Informasi
**Semester:** Aktif

## Scope Tugas
Mempraktikkan dan mendokumentasikan perancangan API dengan arsitektur SOA berbasis web
yang diintegrasikan melalui Enterprise Service Bus (ESB).

Tidak diperlukan implementasi backend yang berjalan. Deliverable adalah **desain dan dokumentasi API**:
- OpenAPI 3.1 YAML per service
- WSDL untuk legacy SOAP service
- ESB routing table dan transformation rules
- Architecture diagrams dan sequence diagrams

## Constraints

| Parameter | Nilai |
|-----------|-------|
| Skala sistem | Medium enterprise (universitas, ~10k pengguna) |
| Protocol wajib | REST (primary) + SOAP (minimal 1 service) |
| ESB pattern wajib | Minimal 2 dari: Passthrough, Router, Aggregator, Saga |
| Jumlah service | Minimal 4 bounded services |
| Dokumentasi API | OpenAPI 3.1 YAML (bukan Swagger 2.0) |
| Auth | JWT Bearer untuk REST, WS-Security untuk SOAP |

## Domain Glossary
Untuk AI agent yang tidak familiar dengan konteks universitas Indonesia:

| Term | Definisi |
|------|---------|
| KRS | Kartu Rencana Studi — pendaftaran mata kuliah per semester |
| SPP | Sumbangan Pembinaan Pendidikan — biaya kuliah per semester |
| NIM | Nomor Induk Mahasiswa — student ID |
| NIDN | Nomor Induk Dosen Nasional — lecturer ID |
| SKS | Satuan Kredit Semester — credit hours |
| Prasyarat | Prerequisite mata kuliah |
| Transkrip | Academic transcript |
| Beasiswa | Scholarship |
| Konseling | Academic/personal counseling |
| Absensi / Kehadiran | Attendance |

## Dependency Map (Inter-Service)

ESB orchestrates — services themselves have no knowledge of each other.

```
auth-service         ← called by ESB on every request (token validation)
academic-service     ← reads from: none. Written to by: enrollment saga
finance-service      ← reads from: none. Checked by: enrollment saga (prerequisite)
library-service      ← reads from: none. Independent domain.
student-affairs      ← reads from: none. Legacy SOAP bridge via ESB.
notification-svc     ← receives from: ESB async queue (after enrollment, payment, etc.)
```

No circular dependencies. Each service is a leaf node.

## What "Done" Looks Like

An endpoint is fully documented when it has:
1. HTTP method + URL
2. Authentication requirement (scope needed)
3. Path/query/body parameters with types and validation rules
4. Success response schema with example
5. All possible error responses with `code` and `message`
6. Notes on idempotency (for POST/PUT/PATCH)

A sequence diagram is acceptable if it shows:
- Actor labels (Client, ESB, ServiceName)
- Arrows with method + endpoint labels
- Conditional branches (success/failure)
- Async arrows for queue publish

## Out of Scope
- Database schema design (services are black boxes)
- CI/CD pipeline
- Containerization (Docker/K8s)
- Load balancing / service discovery
- Actual code implementation