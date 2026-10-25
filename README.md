# Mystery Ball — Mangkasara Rarity Edition

Mini-game vending machine berbasis HTML, CSS, dan Vanilla JavaScript.
Jalankan dengan membuka `index.html`.

## Fitur
- Login username + 1000 poin untuk pemain baru
- Spin 150 poin, 10 bola, 5 rarity (Biasa → Legendari)
- **Bola kembar** (sudah dimiliki) = **+50 poin**
- **Tombol + POIN** (pojok kanan atas), pilihan cara tambah poin:
  1. Claim harian: +200 poin, sekali per hari (tanggal lokal)
  2. Teka-teki matematika menengah: benar +100 poin, maks 5 percobaan/hari (salah tanpa penalti)
  3. Tebak nama admin: benar +500 poin (sekali per akun), salah -10 poin (tidak bisa di bawah 0)
  4. Bonus TikTok +500 (klaim manual, sekali)
- Buku koleksi + preview 10 slot, animasi spin + confetti, responsive
- Bahasa: 🇮🇩 Indonesia /  Makassar
- Ganti username (✎ GANTI)

Angka bonus ada di bagian atas `script.js` (`DUP_BONUS`, `DAILY_BONUS`, `MATH_REWARD`, `MATH_DAILY_LIMIT`, `GUESS_REWARD`, `GUESS_PENALTY`, `GUESS_ANSWERS`).

## Admin
- Username khusus: `ryels` dan `admin` (saat login maupun ganti username): poin ∞, spin gratis, 10/10 koleksi.
- Admin diturunkan dari username; data asli tidak ditimpa, jadi kembali ke username biasa memulihkan data asli.

## Test
`node tests/run-tests.js` (tanpa dependensi, 32 tes: spin/koleksi, bonus kembar, harian, matematika, tebak, rename/admin, i18n).

## Catatan keamanan
Ini frontend/demo: semua data di localStorage, jawaban tebakan terlihat di source, dan claim harian
mengikuti jam perangkat. Tidak aman untuk produksi; untuk poin sungguhan butuh validasi di server.
@ryoiko_
