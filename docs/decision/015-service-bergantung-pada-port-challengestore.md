Context:
`WalletService` membutuhkan penyimpanan nonce challenge (set/get/del). Menggantung langsung pada tipe client Redis (mis. `ioredis` atau `node-redis`) mengunci business logic ke satu library dan menyulitkan pengujian. Saat berpindah dari `ioredis` ke `node-redis`, terlihat berapa besar coupling yang sebenarnya tidak perlu.

Decision:
Definisikan interface sempit `ChallengeStore` (`set`, `get`, `del`) di dalam module wallet. `WalletService` bergantung pada interface ini, bukan pada client Redis konkret. Composition root mengoper client `node-redis` asli (yang memenuhi interface secara struktural); test mengoper fake in-memory.

Consequences:
* Mengganti implementasi cache hanya menyentuh `redis.ts` (infra) + composition root — business logic nol perubahan. Perpindahan `ioredis` → `node-redis` membuktikan ini: satu baris infra berubah.
* Unit test berjalan tanpa Redis nyata, memakai fake in-memory.
* Penerapan konkret Dependency Inversion Principle (SOLID) — talking point interview yang kuat.
* Sedikit kode tambahan (definisi interface), tapi sepadan dengan decoupling yang didapat.
