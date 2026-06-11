Context:
`ownafarm_chain_events` baru dipakai di Phase 2, tapi boundary database adalah aturan arsitektur inti (tidak ada cross-database read).

Decision:
Init script MySQL membuat `ownafarm_core` dan `ownafarm_chain_events` sejak compose pertama.

Consequences:
Biaya nol sekarang; disiplin boundary dipaksa sejak awal — apps/api secara fisik tidak pernah bisa "tidak sengaja" query tabel chain-events.
