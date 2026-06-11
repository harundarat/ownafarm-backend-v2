Context:
Auto-increment ID membocorkan informasi (jumlah user, urutan transaksi) dan bisa di-enumerate; UUIDv4 random merusak locality B-tree index MySQL.

Decision:
`@default(uuid(7))` untuk entitas yang terekspos ke API.

Consequences:
Aman dari enumeration dan insert tetap append-mostly di index (UUIDv7 time-ordered). Reasoning dua lapis: keamanan + performance.