Context:
Fitur autentikasi membutuhkan pengiriman kode OTP via email. Pada tahap ini sudah ada Redis, tapi belum ada sistem message queue. Membangun queue hanya untuk kebutuhan email di tahap awal terlalu prematur — menambah infrastruktur yang belum dibutuhkan, memperlambat iterasi, dan meningkatkan kompleksitas deployment.

Decision:
Kirim email langsung via SMTP (Nodemailer) dari `shared/mailer/` di service API utama. Interface dibuat sesempit mungkin — satu fungsi `sendMail({ to, subject, html, text })` — sehingga implementasi di baliknya bisa diganti tanpa menyentuh caller.

Ini adalah keputusan sementara yang disadari. Rencana migrasi:
- Ketika sistem message queue sudah dibangun, pengiriman email dipindahkan: caller tetap memanggil `sendMail()`, tapi implementasinya berubah menjadi `queue.push(emailJob)` alih-alih memanggil SMTP langsung.
- Worker terpisah mengonsumsi job dari queue dan melakukan pengiriman SMTP yang sebenarnya.
- Service lain (non-Node.js) akan menggunakan queue yang sama, bukan mengimpor `shared/mailer/`.

Consequences:
- Pengiriman email blocking (synchronous dalam request cycle) — bisa memperlambat response jika SMTP lambat. Diterima untuk saat ini karena traffic masih rendah.
- Jika SMTP gagal, request gagal langsung — tidak ada retry otomatis. Mitigasi: Nodemailer transporter di-verify saat startup, error segera terdeteksi.
- Migrasi ke queue nantinya terlokalisir di satu file (`shared/mailer/mailer.ts`) — caller di `modules/auth/` dan modul lain tidak perlu diubah, selama interface `sendMail()` dipertahankan.
- Service lain yang berbeda bahasa belum bisa berbagi infrastruktur mailer ini — mereka harus menunggu queue, atau sementara memakai SDK email (Resend/Mailgun) masing-masing.
