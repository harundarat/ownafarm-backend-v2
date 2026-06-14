Context:
Verifikasi kepemilikan wallet (ADR-013) menghasilkan pesan challenge berisi nonce yang harus ditandatangani user. Pesan ini berumur pendek dan sekali pakai: hanya valid sampai user menandatanganinya, dan tidak boleh dipakai ulang setelah verifikasi (replay).

Decision:
- Simpan pesan challenge utuh di Redis (`node-redis` v5), bukan di MySQL:
- Key `wallet:challenge:<chainId>:<address>`, TTL 5 menit (`SET ... EX 300`).
- Simpan string pesan persis yang harus ditandatangani — bukan merekonstruksinya saat verify, agar byte yang diverifikasi identik dengan yang ditandatangani.
- `DEL` segera setelah verifikasi sukses, sehingga satu tanda tangan tidak bisa diputar ulang.

Client `node-redis` butuh `connect()` eksplisit; koneksi dikelola di `server.ts` (connect saat boot, `quit()` saat shutdown), dan event `'error'` wajib punya listener.

Consequences:
- Data efemeral auto-expire lewat TTL — tidak perlu cron pembersih seperti jika ditaruh di MySQL.
- Menjadi pemakaian Redis pertama yang nyata di proyek; menegaskan prinsip "right tool for the job".
- Replay tertutup oleh kombinasi TTL + `DEL` sekali pakai.
- Pesan tersimpan menambah sedikit beban memori Redis, tapi dibatasi TTL pendek — trade-off yang dapat diterima.
