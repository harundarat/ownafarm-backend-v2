Context:
Module wallet menautkan address blockchain ke akun user. Address yang sekadar diketik tidak bisa dipercaya, siapa pun bisa mengklaim address milik orang lain. Kepemilikan wallet harus dibuktikan.

Decision:
Buktikan kepemilikan secara kriptografis dengan pola challenge–response:

1. Backend membuat pesan berisi nonce unik (endpoint `challenge`).
2. User menandatangani pesan itu dengan private key wallet-nya (EIP-191 `personal_sign`, via MetaMask di frontend).
3. Backend memverifikasi tanda tangan memang berasal dari address tersebut (`viem.verifyMessage`) sebelum menyimpan baris `wallets`.

Baris `wallets` hanya lahir setelah verifikasi sukses; `verifiedAt` selalu terisi saat itu.

Consequences:
- Kepemilikan terbukti tanpa user pernah membagikan private key.
- `viem.verifyMessage` menangani EOA murni tanpa koneksi jaringan, jadi verifikasi deterministik dan mudah dites.
- Dukungan smart-contract wallet (EIP-1271) butuh public client dan koneksi RPC — sengaja ditunda, bisa ditambahkan nanti tanpa mengubah alur.
- Kolom `verifiedAt` dibuat `nullable` untuk mengakomodasi kebutuhan Phase 2 (address on-chain tak-terklaim), meski di Phase 1 selalu terisi.
