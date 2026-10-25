# Mystery Ball — Mangkasara Rarity Edition

Mini-game vending machine berbasis HTML, CSS, dan Vanilla JavaScript.
Jalankan dengan membuka `index.html`.

## Fitur
- Login username + 1000 poin untuk pemain baru
- Spin 150 poin, 10 ball dengan 5 rarity (Biasa → Legendari)
- Popup tambah poin via TikTok +500 (klaim manual, tidak bisa diverifikasi frontend statis)
- Buku koleksi + preview koleksi (semua 10 slot, yang belum didapat tampil sebagai rahasia)
- Animasi spin + confetti, responsive
- Pilihan bahasa: 🇮🇩 Indonesia / 🏴 Makassar (disimpan di localStorage)
- **Ganti username** (tombol ✎ GANTI di pojok kanan atas)

## Admin
- Username khusus: `ryels` dan `admin` (baik saat login maupun saat ganti username).
- Admin: poin ∞, spin tanpa mengurangi poin, semua 10 koleksi terbuka.
- Admin dihitung dari username (bukan flag tersimpan). Data asli (poin/koleksi) tidak ditimpa,
  jadi kalau admin ganti ke username biasa, data aslinya kembali.
- Jika record admin sudah ada di browser, ganti username ke nama admin akan berpindah ke akun admin itu
  (akun lama tetap tersimpan).

## Struktur kode (script.js)
- `BALLS` — data bola, teks per bahasa. `I18N` — satu-satunya sumber teks UI (`t(key)`).
- HTML memakai `data-i18n`, `data-i18n-html`, `data-i18n-placeholder`, `data-i18n-aria`.
- Storage: `mysteryBallUsers` (record per user), `mysteryBallSession`, `mysteryBallLanguage`.
- Semua tampilan lewat `renderAll()`, jadi ganti bahasa/username/spin selalu konsisten.

Reset data: `localStorage.clear()` di console.
Catatan: ini frontend/demo, bukan autentikasi aman untuk produksi.
