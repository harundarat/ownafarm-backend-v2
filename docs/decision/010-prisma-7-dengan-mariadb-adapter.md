Context:
Prisma 7 mengubah arsitektur ORM: query engine Rust diganti query compiler TypeScript, driver adapter wajib untuk semua database, konfigurasi CLI pindah ke `prisma.config.ts`, client di-generate ESM-first ke source tree.

Decision:
Ikuti pola Prisma 7 penuh: `@prisma/adapter-mariadb`, `prisma.config.ts` dengan dotenv/config eksplisit, `generator prisma-client` dengan output `src/generated/prisma` (di-gitignore, di-generate di CI), `connectionLimit` di-set eksplisit.

Consequences:
Binary lebih ramping, dan connection pool dikontrol langsung lewat driver `mariadb` — bukan default ORM. Trade-off: setup lebih banyak langkah daripada tutorial Prisma klasik; CI wajib menjalankan `prisma generate`.
