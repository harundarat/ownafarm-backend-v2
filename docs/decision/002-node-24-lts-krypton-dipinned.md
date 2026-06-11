Context:
Tanpa pinning, bisa kejadian "works on my machine" saat dev lain clone repo. Saat memilih versi, ada tiga kandidat di pertengahan 2026: Node 22 (Maintenance LTS), Node 24 (Active LTS), Node 26 (Current, belum LTS sampai Okt 2026).

Decision:
Node 24 LTS (codename Krypton), dipinned di `.nvmrc` + `package.json > engines (>=24)`, dan disamakan dengan base image Dockerfile (`node:24-alpine`).

Consequences:
Active LTS sampai April 2028 — jendela dukungan paling panjang di antara LTS yang ada, dan rekomendasi resmi untuk proyek baru. Sengaja tidak pakai Node 26 karena masih Current track (belum LTS); aturan produksi: hanya Active/Maintenance LTS. Lingkungan dev <-> CI <-> container konsisten. Catatan teknis Node 24: OpenSSL 3.5 menaikkan default security level (menolak kunci RSA < 2048-bit) — tidak berdampak ke proyek ini karena argon2/JWT memakai kunci yang memenuhi syarat.
