Context:
bcrypt masih umum, tapi bukan state-of-the-art; password user adalah aset paling sensitif di sistem.

Decision:
argon2id (default library `argon2`).

Consequences:
argon2id adalah memory-hard, jauh lebih mahal diserang GPU/ASIC dibanding bcrypt. Pemenang Password Hashing Competition; rekomendasi OWASP saat ini.
