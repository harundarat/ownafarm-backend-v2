Context:
KYC wajib untuk platform investasi yang menyimpan dana user (AML/CFT, OJK/Bappebti). Skema `UserDocument` sudah punya `DocumentStatus { pending, approved, rejected }`, `reviewedAt`, dan `rejectReason` — desain ini secara implisit mengasumsikan ada reviewer yang menggerakkan `pending → approved/rejected`. Tapi belum ada entitas operator internal (`UserRole` hanya `investor`/`farmer`), dan belum ada jejak siapa yang me-review sebuah dokumen.

Decision:
Operator internal dimodelkan sebagai tabel `Staff` terpisah dengan `StaffRole { admin, kyc_reviewer }` (least-privilege), BUKAN menambah `admin` ke `UserRole`. Tambah `reviewedById` (FK nullable ke `Staff`, `onDelete: SetNull`) di `UserDocument` untuk mencatat siapa yang me-review.

Alasan tabel terpisah: memisahkan auth boundary pengguna-akhir dari operator internal. Bila tabel `users` bocor, akun staf tidak ikut terekspos (blast radius lebih kecil); mencegah privilege escalation lewat satu enum bersama; flow auth staf berbeda (email+password, tanpa OTP/wallet). Status KYC tetap per-dokumen — tidak ada field agregat di `User`; status keseluruhan user diturunkan via query agregat.

Review dilakukan manual oleh staf untuk saat ini. Desain dibuat provider-agnostic: bila nanti pindah ke KYC provider otomatis (Verihubs/Sumsub/dll), webhook provider cukup menulis ke kolom `status`/`reviewedAt`/`rejectReason` yang sama tanpa mengubah skema.

Consequences:
- Auth boundary staf terpisah: butuh module `staff` sendiri (login, hashing argon2id per ADR-012) dan middleware auth staf terpisah dari `require-auth` user — pekerjaan lanjutan.
- Jejak audit tersedia: setiap keputusan approve/reject bisa dilacak ke staf yang melakukannya. Staf dinonaktifkan via `isActive = false` (soft-delete), bukan dihapus, agar audit tetap utuh; `onDelete: SetNull` hanya pengaman bila staf benar-benar dihapus.
- Migrasi ke KYC otomatis terlokalisir di penulis status — caller pembaca status tidak perlu berubah.
- Trade-off: review manual tidak scalable di volume tinggi. Diterima untuk tahap awal; hybrid (auto-verify + staf sebagai fallback) menjadi arah jangka menengah.
