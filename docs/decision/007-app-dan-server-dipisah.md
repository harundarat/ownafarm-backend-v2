Context:
Integration test via Supertest dan graceful shutdown butuh pemisahan antara definisi app dan lifecycle proses.

Decision:
`app.ts` mengekspor Express app tanpa `listen()`; `server.ts` yang boot, menangkap SIGTERM/SIGINT, dan menutup koneksi (HTTP server, Prisma, dan Redis).

Consequences:
Test menyentuh `app` langsung tanpa buka port (cepat dan tidak rapuh). Pola shutdown (stop terima kerja -> drain -> timeout) sama persis dengan yang akan dipakai worker Go di Phase 2.
