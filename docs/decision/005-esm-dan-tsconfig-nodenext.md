Context:
Campuran CJS/ESM adalah sumber penyakit klasik proyek Node; keputusan ini mahal kalau diubah di tengah jalan.

Decision:
Full ESM sejak awal; module: NodeNext; relative import wajib berekstensi .js.

Consequences:
Searah dengan ekosistem Node modern dan disyaratkan oleh generator client Prisma 7 yang ESM-first — keputusan ini terbukti tepat setelah Prisma 7 masuk. Trade-off: disiplin ekstensi .js di import terasa aneh di awal.
