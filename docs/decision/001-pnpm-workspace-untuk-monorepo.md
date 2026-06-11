Context: 
Repo berisi banyak package TS (apps/*, packages/*) dan 2 service Go; butuh package manager yang sehat untuk monorepo.

Decision: 
pnpm dengan `pnpm-workspace.yaml`.

Consequences: 
Strict `node_modules` mencegah phantom dependencies (dependency yang tidak dideklarasikan akan error, bukan diam-diam jalan); hemat disk via content-addressable store; `--filter` memudahkan menjalankan script per-app.
