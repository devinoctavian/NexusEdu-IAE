# ESB Routing Table

Tabel ini mendefinisikan rute *passthrough* maupun *orchestration/custom patterns* yang di-*handle* oleh ESB Gateway di `localhost:8000`.

| ESB Endpoint (`:8000`) | Target Service | HTTP Method | Pattern Type | Keterangan |
| :--- | :--- | :--- | :--- | :--- |
| `/api/v1/auth/*` | `auth-service:8001` | ALL | Passthrough | Semua request otentikasi. Endpoint `/login` menge-bypass validasi token. |
| `/api/v1/academic/*` | `academic-service:8002` | ALL | Passthrough | Data master akademik, RPS, jadwal. |
| `/api/v1/finance/*` | `finance-service:8003` | ALL | Passthrough | Data SPP, tagihan, beasiswa. |
| `/api/v1/library/*` | `library-service:8004` | ALL | Passthrough | Data buku, peminjaman, denda. |
| `/api/v1/student-affairs/*`| `student-affairs-service:8005` | ALL | Passthrough | Modul REST untuk pelanggaran dan konseling. |
| `/api/v1/student/dashboard`| `academic, finance, library` | GET | **Aggregator** | ESB mem-fan-out request ke 3 service, timeout 800ms, lalu mengembalikan data teragregasi. |
| `/api/v1/academic/enrollments`| `finance, academic` | POST | **Saga** | Mengecek tunggakan SPP ke `finance`. Jika berhasil, dilanjutkan mendaftar kelas ke `academic`. Jika gagal, me-return 403 Forbidden. |
| `/api/v1/student-affairs/attendance`| `student-affairs-service:8005/soap/attendance` | POST | **Bridge (REST-SOAP)** | Mengubah payload JSON menjadi XML/SOAP untuk servis legacy. |

## ESB Middlewares
1. **Correlation ID (`x-correlation-id`)**: Di-*inject* ke setiap *request* yang masuk untuk *distributed tracing*.
2. **Rate Limit**: Max 100 request / 15 menit.
3. **JWT Validator**: Mem-verifikasi JWT di ESB dan melewatkan header `x-user-id` ke service internal.
