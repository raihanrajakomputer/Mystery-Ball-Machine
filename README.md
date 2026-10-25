# Mystery Ball — Mangkasara Rarity Edition

Mini-game vending machine berbasis HTML, CSS, dan Vanilla JavaScript.

Fitur utama:
- Login nama + 1000 poin pemain baru
- Spin 150 poin
- Popup tambah poin via TikTok +500
- Buku koleksi di sisi kanan
- 10 ball dengan 5 rarity: Biasa, Tena Biasa, Langka, Epic, Legendari
- Ball makin gelap, glowing, dan menyeramkan sesuai rarity
- Ball belum didapat tampil sebagai rahasia
- Progress koleksi
- Animasi spin + confetti
- localStorage
- Responsive

Jalankan dengan membuka `index.html`.

Reset data:
`localStorage.removeItem("mysteryBallData")`

Catatan: Follow TikTok tidak dapat diverifikasi otomatis oleh frontend statis; bonus menggunakan klaim manual.


## Fitur pilihan bahasa
- Dropdown bahasa di pojok kanan atas.
- 🇮🇩 Indonesia
- 🏴 Makassar
- Bahasa yang dipilih disimpan di localStorage.
- Teks halaman, popup poin, hasil spin, dan buku koleksi mengikuti bahasa yang dipilih.

## Login Username + Admin
- Username admin: `ryels` dan `admin`.
- Admin memiliki poin tak terbatas (∞), spin tidak mengurangi poin dan tidak perlu bonus TikTok.
- Username biasa mendapatkan 1000 poin saat pertama kali dibuat.
- Data per-user disimpan di localStorage.
- Ini frontend/demo, bukan autentikasi aman produksi.
