# CONTEXT.md — Academic & Project Context

## Course
**Mata Kuliah:** Integrasi Aplikasi Enterprise (IAE)
**Tugas:** 2 — Perancangan API Berbasis SOA + Enterprise Service Bus
**Institusi:** Telkom University — Program Studi Sistem Informasi
**Semester:** Aktif

## Scope Tugas (Dinilai)

Mempraktikkan dan mendokumentasikan perancangan API dengan arsitektur SOA berbasis web
yang diintegrasikan melalui Enterprise Service Bus (ESB).

Untuk **penilaian tugas**, deliverable minimum adalah **desain dan dokumentasi API**:
- OpenAPI 3.1 YAML per service
- WSDL untuk legacy SOAP service
- ESB routing table dan transformation rules
- Architecture diagrams dan sequence diagrams

## Scope Project (Tujuan Devin, Melebihi Minimum Tugas)

Project ini dibangun **sampai ke implementasi kode dan database yang benar-benar jalan**, bukan
cuma dokumentasi di atas kertas. Ini keputusan sadar untuk menjadikan NexusEdu sebagai portfolio
project, bukan sekadar artefak yang dikumpulkan lalu tidak pernah dipakai lagi.

Konsekuensi praktis: semua dokumen scope-related di project ini (AGENTS.md, ARCHITECTURE.md,
DESIGN.md) ditulis dengan asumsi kode akan benar-benar di-build — bukan cuma didiagramkan.
Lihat ADR-009 di `docs/ARCHITECTURE.md` untuk rationale lengkap.

**Yang tidak berubah:** deliverable yang dinilai dosen tetap 12 item di atas (dokumentasi/desain).
Implementasi kode adalah tambahan di luar rubrik penilaian, dikerjakan karena nilai jangka panjang
buat Devin sendiri, bukan syarat kelulusan tugas ini.

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

An endpoint is fully **implemented** (beyond just documented) when it additionally has:
1. Prisma model + migration applied for any new data it reads/writes
2. Zod validation schema matching the documented request body
3. Controller returns the exact envelope shape from CONVENTIONS.md — no shortcuts during dev
4. At least one happy-path test and one error-path test (Vitest + Supertest)
5. Manually verified through the ESB gateway, not just by hitting the service port directly

## Out of Scope

Tetap di luar scope (baik untuk penilaian maupun untuk project penuh — tidak relevan untuk skala ini):
- CI/CD pipeline otomatis (GitHub Actions, dst.)
- Container orchestration produksi (Kubernetes) — `docker-compose.yml` untuk Postgres+RabbitMQ
  lokal SUDAH dalam scope (lihat ARCHITECTURE.md → Repository Structure), tapi orkestrasi skala
  produksi tidak
- Load balancing / service discovery otomatis (Consul, etc.) — tidak relevan di skala ~10rb user
  akademik yang disimulasikan untuk tugas ini
- Deployment ke cloud production (Railway/Vercel/AWS) — local dev environment sudah cukup untuk
  tujuan tugas + portfolio; deploy publik adalah keputusan terpisah kalau Devin mau lanjut nanti

**Catatan:** "Database schema design" dan "Actual code implementation" SEBELUMNYA tercantum di sini
sebagai out-of-scope. Itu sudah tidak berlaku — lihat "Scope Project" di atas. Keduanya sekarang
in-scope karena keputusan untuk membangun NexusEdu sampai implementasi penuh.