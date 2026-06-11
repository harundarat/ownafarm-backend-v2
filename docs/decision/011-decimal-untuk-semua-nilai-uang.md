Context:
Floating point tidak bisa merepresentasikan `0.1` secara eksak; di sistem ledger/investasi, error pembulatan adalah bug fatal. Ini keputusan paling fintech-relevant di seluruh proyek.

Decision:
Semua kolom amount memakai Decimal `@db.Decimal(36, 18)` (presisi wei-level untuk konteks Web3); tidak pernah `Float`/`Double`. Aritmetika uang di aplikasi memakai tipe `Decimal` Prisma, bukan `number`.

Consequences:
Konsistensi nilai terjamin end-to-end. Trade-off: sedikit lebih lambat dari float dan butuh kehati-hatian saat serialisasi JSON (string, bukan number) — trade-off yang benar untuk domain investasi.
