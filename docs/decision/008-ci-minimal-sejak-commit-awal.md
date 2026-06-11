Context:
Proyek backend monorepo ini dibangun dari nol. Tanpa pagar otomatis, error tipe, lint, dan test yang gagal baru ketahuan jauh setelah ditulis — makin sulit ditelusuri seiring kode bertambah. Lebih murah memasang jaring pengaman sejak fondasi masih kecil.

Decision:
GitHub Actions (install → prisma generate → typecheck → lint → test) dipasang tepat setelah test harness berdiri, sebelum module bisnis pertama.

Consequences:
Commit paling rawan (schema, auth) lahir di bawah pengawasan CI sejak awal. Biaya ~30 menit sekarang vs berjam-jam kalau dirakit belakangan di atas kode yang sudah menumpuk. Setiap perubahan tervalidasi otomatis sebelum digabung, jadi `dev` dan `main` tetap sehat sepanjang pengembangan.
