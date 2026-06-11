Context:
Dev loop butuh hot-reload cepat dan debugging mudah; infra butuh reproducible.

Decision:
MySQL + Redis via Docker Compose; API jalan di host dengan `tsx watch`. Dockerfile API tetap dibuat untuk verifikasi parity, bukan dev loop harian.

Consequences:
Iterasi cepat tanpa rebuild container, infra tetap identik antar mesin. Trade-off: parity dev-vs-container harus diverifikasi berkala lewat Dockerfile.
