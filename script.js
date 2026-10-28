(() => {
"use strict";

/* =========================================================
   CONFIG
   ========================================================= */
const COST = 150, START_POINTS = 1000, TIKTOK_REWARD = 500, SPIN_MS = 850;
const TIKTOK_URL = "https://www.tiktok.com/@ryoiko_?is_from_webapp=1&sender_device=pc";
const ADMIN_USERNAMES = ["ryels", "admin"];
const USERNAME_RE = /^[a-z0-9][a-z0-9_. -]{1,17}$/; // wajib diawali huruf/angka (sekaligus menolak "__proto__")
const KEYS = { users: "mysteryBallUsers", session: "mysteryBallSession", lang: "mysteryBallLanguage", legacy: "mysteryBallData" };
const LANGS = { id: { flag: "🇮🇩", label: "Indonesia" }, mak: { flag: "🏴", label: "Makassar" } };
const TIERS = ["common", "uncommon", "rare", "epic", "legendary"];
const DUP_BONUS = 50;                                   // bonus poin jika bola yang didapat sudah dimiliki
const DAILY_BONUS = 200;                                // claim harian
const MATH_REWARD = 100, MATH_DAILY_LIMIT = 20;          // teka-teki matematika: poin & batas percobaan/hari
const GUESS_REWARD = 500, GUESS_PENALTY = 10;           // tebak nama admin (hadiah hanya sekali per akun)
const GUESS_ANSWERS = ["rey", "rei", "rai", "raihan", "raihan al", "raihan al rajab"];
/* Hadiah koleksi (diambil manual lewat tombol AMBIL, sekali per akun) */
const COUNT_REWARDS = [{ n: 3, points: 200 }, { n: 5, points: 400 }, { n: 10, points: 800 }];   // punya N bola berbeda
const TIER_REWARDS = { uncommon: 300, rare: 500, epic: 1000, legendary: 5000 };                  // semua bola 1 rarity lengkap
const GLOBAL_VARS = { cost: COST, points: START_POINTS, bonus: TIKTOK_REWARD, dup: DUP_BONUS, daily: DAILY_BONUS,
  mathReward: MATH_REWARD, mathMax: MATH_DAILY_LIMIT, guessReward: GUESS_REWARD, penalty: GUESS_PENALTY };

/* =========================================================
   DATA: BALLS (tiap bola punya teks per bahasa)
   ========================================================= */
const BALLS = [
  { id: "sunny-smile", tier: "common", weight: 33,
    idn: { title: "SENYUM CERIA", message: "Bola biasa, tapi tetap tersenyum. Tidak ada masalah!" },
    mak: { title: "SENYUM MAKAMMA", message: "Ball biasa, tapi tetap senyumji. Tena masalah!" } },
  { id: "orange-chill", tier: "common", weight: 25,
    idn: { title: "SANTAI SAJA", message: "Santai. Bola ini cuma mau bikin kamu rileks." },
    mak: { title: "SANTAI JI", message: "Maliangko. Ball anne cuma erok bikin rileks." } },
  { id: "gold-glow", tier: "uncommon", weight: 18,
    idn: { title: "MATA BERCAHAYA", message: "Sudah mulai aneh. Matanya sedikit bercahaya." },
    mak: { title: "MATA CAHAYA", message: "Sudah mulai aneh. Matanna sedikit bercahaya." } },
  { id: "crazy-smile", tier: "uncommon", weight: 11,
    idn: { title: "SENYUM GILA", message: "Kenapa senyum bolanya begini? Saya juga tidak tahu." },
    mak: { title: "SENYUM JAIL", message: "Kenapa senyum ballna begini? Tena kuisseng." } },
  { id: "shadow-face", tier: "rare", weight: 7,
    idn: { title: "BOLA BAYANGAN", message: "Warnanya mulai gelap. Jangan dilihat terlalu lama." },
    mak: { title: "BALL BAYANG", message: "Warnana mulai gelap. Jangan diliat lama-lama." } },
  { id: "night-eyes", tier: "rare", weight: 3.8,
    idn: { title: "MATA MALAM", message: "Dua matanya menyala. Bolanya seperti tahu sesuatu." },
    mak: { title: "MATA MALAM", message: "Dua matanna menyala. Ballna kayak tau sesuatu." } },
  { id: "red-monster", tier: "epic", weight: 1.5,
    idn: { title: "BOLA GILA", message: "Wajahnya sudah berubah. Sepertinya bola ini marah." },
    mak: { title: "BALL GILA", message: "Mukana sudah beda. Sepertina ballna marah." } },
  { id: "void-smile", tier: "epic", weight: 0.5,
    idn: { title: "SENYUM KOSONG", message: "Senyumnya ada, tapi matanya tidak. Seram." },
    mak: { title: "SENYUM KOSONG", message: "Senyumna ada, tapi matanna tidak. Seramki." } },
  { id: "abyss", tier: "legendary", weight: 0.16,
    idn: { title: "THE ABYSS", message: "Ini bukan sekadar bola. Jangan tanya dari mana asalnya." },
    mak: { title: "THE ABYSS", message: "Ini bukan sekadar ball. Jangan bertanya dari mana datangnya." } },
  { id: "red-eye-god", tier: "legendary", weight: 0.04,
    idn: { title: "PENUNGGU", message: "Kamu pikir kamu yang menemukan bola ini? Justru bola ini yang mencari." },
    mak: { title: "PENUNGGU", message: "Na'issengko ini? Ballna yang cari. Bukan kita." } }
];
const ALL_IDS = BALLS.map(b => b.id);
const ID_SET = new Set(ALL_IDS);

/* =========================================================
   HADIAH KOLEKSI: daftar hadiah + cara menghitung progress
   ========================================================= */
const REWARDS = [
  ...COUNT_REWARDS.map(r => ({ id: "count" + r.n, type: "count", n: r.n, points: r.points })),
  ...TIERS.filter(tier => TIER_REWARDS[tier]).map(tier => ({ id: "tier-" + tier, type: "tier", tier, points: TIER_REWARDS[tier] }))
];
const REWARD_IDS = new Set(REWARDS.map(r => r.id));

/* ACHIEVEMENT (hadiah poin, diambil manual, sekali per akun)
   stat  = angka yang dihitung game di data akun (spins, dupCount, mathCorrect, dailyCount)
   tiers = cukup punya bola dari rarity tersebut
   need  = target, points = hadiah, cls = warna garis kiri (opsional) */
const ACHIEVEMENTS = [
  { id: "spin5",  icon: "🎯", stat: "spins",       need: 5,  points: 50 },
  { id: "spin10", icon: "🎲", stat: "spins",       need: 10, points: 100 },
  { id: "spin15", icon: "🔥", stat: "spins",       need: 15, points: 150 },
  { id: "spin20", icon: "👑", stat: "spins",       need: 20, points: 200 },
  { id: "spin50", icon: "🏃", stat: "spins",       need: 50, points: 500 },
  { id: "twins",  icon: "👯", stat: "dupCount",    need: 5,  points: 150,  cls: "uncommon" },
  { id: "math",   icon: "🧠", stat: "mathCorrect", need: 5,  points: 150,  cls: "epic" },
  { id: "daily",  icon: "📅", stat: "dailyCount",  need: 3,  points: 200 },
  { id: "rare",   icon: "💜", tiers: ["rare", "epic", "legendary"], need: 1, points: 300,  cls: "rare" },
  { id: "legend", icon: "🌟", tiers: ["legendary"],                 need: 1, points: 1000, cls: "legendary" }
];
const ACH_IDS = new Set(ACHIEVEMENTS.map(a => a.id));
function achProgress(a, v) {
  const have = a.stat ? (v[a.stat] || 0) : BALLS.filter(b => a.tiers.includes(b.tier) && v.collection.includes(b.id)).length;
  return { have: Math.min(have, a.need), need: a.need };
}
function achDone(a, v) { const p = achProgress(a, v); return p.have >= p.need; }
function rewardProgress(r, collection) {
  if (r.type === "count") return { have: Math.min(collection.length, r.n), need: r.n };
  const ids = BALLS.filter(b => b.tier === r.tier).map(b => b.id);
  return { have: ids.filter(id => collection.includes(id)).length, need: ids.length };
}
function rewardReached(r, collection) { const p = rewardProgress(r, collection); return p.have >= p.need; }
const ballText = (b, lang) => (lang === "id" ? b.idn : b.mak);

/* =========================================================
   I18N: satu-satunya sumber teks UI
   ========================================================= */
const I18N = {
  id: {
    "login.eyebrow": "★ MESIN MISTERI ★",
    "login.tagline": "Ada sesuatu yang menunggu di dalam.",
    "login.question": "Siapa namamu?",
    "login.placeholder": "Tulis username kamu...",
    "login.button": "MASUK KE MESIN",
    "login.tiny": "Pemain baru mendapatkan {points} poin.",
    "login.empty": "Tulis username kamu dulu.",
    "login.invalid": "Username 2–18 karakter, diawali huruf/angka (boleh spasi, titik, strip, underscore).",
    "welcome.new": "Selamat datang! +{points} poin.",
    "welcome.back": "Selamat datang kembali.",
    "welcome.admin": "Selamat datang, admin. Poin ∞.",
    "points": "POIN",
    "book.word": "BUKU",
    "book.open": "Buka buku koleksi",
    "book.aria": "Buku koleksi",
    "close": "Tutup",
    "intro.eyebrow": "CARI BOLA",
    "intro.title": "APA<br>YANG ADA?",
    "intro.hint": "Satu putaran = {cost} poin. Dapat bola kembar = +{dup} poin.",
    "machine.label": "SATU PUTARAN • {cost} POIN",
    "spin": "PUTAR",
    "result.label": "HASIL KAMU",
    "result.waitingTitle": "Masih menunggu.",
    "result.waitingMessage": "Tekan PUTAR dan cari tahu bola apa yang muncul.",
    "collection.eyebrow": "BOLA KAMU",
    "collection.title": "KOLEKSI",
    "book.eyebrow": "BUKU MISTERI",
    "book.title": "KOLEKSI BOLA",
    "book.progress": "Bola yang sudah didapat",
    "book.locked": "Belum didapat",
    "book.secret": "RAHASIA",
    "book.lockedFooter": "Bola ini belum didapat. Putar lagi.",
    "spin.newBall": "Bola baru masuk koleksi!",
    "spin.duplicate": "Bola kembar! +{dup} poin.",
    "spin.duplicateAdmin": "Bola itu sudah kamu miliki.",
    "earn.open": "+ POIN",
    "earn.eyebrow": "TAMBAH POIN",
    "earn.title": "Pilih caranya",
    "earn.back": "← KEMBALI",
    "earn.opt.daily.name": "Claim harian",
    "earn.opt.daily.desc": "Ambil +{daily} poin, sekali sehari.",
    "earn.opt.math.name": "Teka-teki matematika",
    "earn.opt.math.desc": "Jawab benar +{mathReward} poin. Maks {mathMax}x per hari.",
    "earn.opt.guess.name": "Tebak nama admin",
    "earn.opt.guess.desc": "Benar +{guessReward} poin, salah -{penalty} poin.",
    "earn.opt.tiktok.name": "Bonus TikTok",
    "earn.opt.tiktok.desc": "Follow akun TikTok untuk +{bonus} poin (sekali).",
    "earn.status.dailyReady": "Siap diklaim",
    "earn.status.dailyDone": "Sudah diklaim hari ini",
    "earn.status.math": "Sisa {n} dari {max} kesempatan hari ini",
    "earn.status.guessOpen": "Belum terjawab",
    "earn.status.guessDone": "Sudah terjawab",
    "earn.status.tiktokOpen": "Tersedia",
    "earn.status.tiktokDone": "Sudah diambil",
    "earn.daily.info": "Datang setiap hari dan ambil bonus gratismu.",
    "earn.daily.claim": "CLAIM +{daily} POIN",
    "earn.daily.done": "SUDAH DIKLAIM HARI INI",
    "earn.daily.success": "Claim harian berhasil! +{daily} poin.",
    "earn.daily.already": "Hari ini sudah diklaim. Kembali besok!",
    "earn.math.prompt": "Hitung dengan teliti:",
    "earn.math.placeholder": "Jawabanmu (angka bulat)",
    "earn.math.submit": "JAWAB",
    "earn.math.left": "Sisa kesempatan hari ini: {n}/{max}",
    "earn.math.right": "Benar! +{n} poin.",
    "earn.math.wrong": "Salah. Jawaban yang benar: {answer}.",
    "earn.math.invalid": "Isi dengan angka bulat.",
    "earn.math.limit": "Kesempatan hari ini habis. Coba lagi besok!",
    "earn.guess.question": "Siapakah orang terkeren dan tersigma sepanjang sejarah?",
    "earn.guess.hint": "Benar: +{guessReward} poin (sekali saja). Salah: -{penalty} poin.",
    "earn.guess.placeholder": "Ketik jawabanmu...",
    "earn.guess.submit": "TEBAK",
    "earn.guess.right": "Benar! +{n} poin.",
    "earn.guess.wrong": "Salah! -{n} poin.",
    "earn.guess.wrongZero": "Salah! Poinmu sudah 0, jadi tidak ada yang dikurangi.",
    "earn.guess.empty": "Tulis jawabanmu dulu.",
    "earn.guess.already": "Pertanyaan ini sudah kamu jawab dengan benar.",
    "reward.eyebrow": "POIN HABIS",
    "reward.title": "Mau tambah poin?",
    "reward.text": "Buka TikTok-ku, follow akun <b>@ryoiko_</b>, lalu kembali ke sini untuk klaim bonus poin.",
    "reward.tiktok": "BUKA TIKTOK",
    "reward.claim": "SUDAH FOLLOW • KLAIM +{bonus}",
    "reward.claimed": "BONUS SUDAH DIAMBIL",
    "reward.note": "Klik di luar kotak untuk menutup. Follow tidak bisa diverifikasi otomatis oleh website, jadi bonus diklaim secara manual.",
    "reward.openTiktok": "Buka TikTok, follow dulu ya!",
    "reward.success": "Berhasil! +{bonus} poin.",
    "reward.already": "Bonusnya sudah pernah diambil.",
    "reward.admin": "Akun admin sudah punya poin ∞.",
    "rename.open": "GANTI",
    "rename.eyebrow": "AKUN",
    "rename.title": "Ganti username",
    "rename.text": "Masukkan username baru (2–18 karakter, diawali huruf/angka; boleh spasi, titik, strip, underscore).",
    "rename.placeholder": "Username baru...",
    "rename.save": "SIMPAN USERNAME",
    "rename.note": "Username khusus akan mengaktifkan mode admin: poin ∞ dan seluruh koleksi bola.",
    "rename.empty": "Username tidak boleh kosong.",
    "rename.same": "Itu sudah username kamu.",
    "rename.invalid": "Username 2–18 karakter, diawali huruf/angka (boleh spasi, titik, strip, underscore).",
    "rename.taken": "Username sudah dipakai pemain lain.",
    "rename.done": "Username diganti menjadi {name}.",
    "rename.adminOn": "Mode admin aktif! Poin ∞ dan semua bola terbuka.",
    "rename.adminOff": "Mode admin dimatikan. Data asli kamu dipulihkan.",
    "colrew.title": "HADIAH KOLEKSI",
    "colrew.hint": "Capai syaratnya, lalu tekan AMBIL untuk menerima poin. Sekali per akun.",
    "colrew.count": "Punya {n} bola",
    "colrew.tier": "Koleksi {rarity} lengkap",
    "tab.collection": "KOLEKSI",
    "tab.rewards": "HADIAH",
    "tab.achievements": "ACHIEVEMENT",
    "claim.button": "AMBIL +{n}",
    "claim.done": "DIAMBIL",
    "claim.success": "Diambil: {name}! +{n} poin.",
    "claim.new": "Ada {n} hadiah yang bisa diambil. Buka BUKU!",
    "ach.title": "ACHIEVEMENT",
    "ach.hint": "Selesaikan tantangan, lalu tekan AMBIL untuk menerima poin. Sekali per akun.",
    "ach.spin5.name": "Pemanasan", "ach.spin5.desc": "Putar mesin 5 kali.",
    "ach.spin10.name": "Mulai Penasaran", "ach.spin10.desc": "Putar mesin 10 kali.",
    "ach.spin15.name": "Ketagihan", "ach.spin15.desc": "Putar mesin 15 kali.",
    "ach.spin20.name": "Raja Mesin", "ach.spin20.desc": "Putar mesin 20 kali.",
    "ach.spin50.name": "Maraton Putar", "ach.spin50.desc": "Putar mesin 50 kali.",
    "ach.twins.name": "Bola Kembar", "ach.twins.desc": "Dapat bola kembar 5 kali.",
    "ach.math.name": "Otak Encer", "ach.math.desc": "Jawab benar 5 teka-teki matematika.",
    "ach.daily.name": "Rajin Berkunjung", "ach.daily.desc": "Claim harian 3 kali.",
    "ach.rare.name": "Pemburu Langka", "ach.rare.desc": "Dapatkan bola Langka atau lebih tinggi.",
    "ach.legend.name": "Sang Penemu", "ach.legend.desc": "Dapatkan bola Legendaris.",
    "rarity.common": "BIASA", "rarity.uncommon": "TIDAK BIASA", "rarity.rare": "LANGKA",
    "rarity.epic": "EPIC", "rarity.legendary": "LEGENDARIS"
  },
  mak: {
    "login.eyebrow": "★ MESING MISTERI ★",
    "login.tagline": "Salamakki battu mae!",
    "login.question": "Nai arenta?",
    "login.placeholder": "Tulis arengta...",
    "login.button": "MASUK RI MESING",
    "login.tiny": "Pemain baru tarimai {points} poin.",
    "login.empty": "Tulis username ta dulu.",
    "login.invalid": "Username 2–18 karakter, diawali huruf/angka (boleh spasi, titik, strip, underscore).",
    "welcome.new": "Salamakki! +{points} poin.",
    "welcome.back": "Salamakki battu mae.",
    "welcome.admin": "Salamakki, admin. Poin ∞.",
    "points": "POIN",
    "book.word": "BUKU",
    "book.open": "Buka buku koleksi",
    "book.aria": "Buku koleksi",
    "close": "Tutup",
    "intro.eyebrow": "CINI'KI APA NA EROI",
    "intro.title": "APA<br>NA NIALLA?",
    "intro.hint": "Se're putaran = {cost} poin. Ball sikamma = +{dup} poin.",
    "machine.label": "SE'RE PUTARAN • {cost} POIN",
    "spin": "PUTAR",
    "result.label": "HASILTA",
    "result.waitingTitle": "Natunggumi.",
    "result.waitingMessage": "Pencet PUTAR, antu na ball na e'rannu.",
    "collection.eyebrow": "BALL-BALLTA",
    "collection.title": "KOLEKSI",
    "book.eyebrow": "BUKU MISTERI",
    "book.title": "KOLEKSI BALL",
    "book.progress": "Ball na sudah nialle",
    "book.locked": "Belum nialle",
    "book.secret": "RAHASIA",
    "book.lockedFooter": "Ballna belum nialle. Putar pole.",
    "spin.newBall": "Ball baru masuk koleksita!",
    "spin.duplicate": "Ball sikamma! +{dup} poin.",
    "spin.duplicateAdmin": "Ballna sudah nipunnai.",
    "earn.open": "+ POIN",
    "earn.eyebrow": "TAMBAH POIN",
    "earn.title": "Pile' caranna",
    "earn.back": "← BALI'",
    "earn.opt.daily.name": "Claim se're allo",
    "earn.opt.daily.desc": "Alle +{daily} poin, se're ri se're allo.",
    "earn.opt.math.name": "Teka-teki matematika",
    "earn.opt.math.desc": "Jawab benarki +{mathReward} poin. Maks {mathMax}x ri se're allo.",
    "earn.opt.guess.name": "Tebak areng admin",
    "earn.opt.guess.desc": "Benar +{guessReward} poin, salah -{penalty} poin.",
    "earn.opt.tiktok.name": "Bonus TikTok",
    "earn.opt.tiktok.desc": "Follow akun TikTok untuk +{bonus} poin (se're).",
    "earn.status.dailyReady": "Siap nialle",
    "earn.status.dailyDone": "Le'ba' nialle ri allo anne",
    "earn.status.math": "Tersisa {n} ri {max} kesempatan ri allo anne",
    "earn.status.guessOpen": "Belum nijawab",
    "earn.status.guessDone": "Le'ba' nijawab",
    "earn.status.tiktokOpen": "Niak",
    "earn.status.tiktokDone": "Le'ba' nialle",
    "earn.daily.info": "Lampa mae ri tiap allo, alle bonus gratista.",
    "earn.daily.claim": "CLAIM +{daily} POIN",
    "earn.daily.done": "LE'BA' NICLAIM RI ALLO ANNE",
    "earn.daily.success": "Tarima! Claim se're allo +{daily} poin.",
    "earn.daily.already": "Le'ba' niclaim ri allo anne. Bali' pa'risiki!",
    "earn.math.prompt": "Itung na bagus-bagus:",
    "earn.math.placeholder": "Jawabanta (angka bulat)",
    "earn.math.submit": "JAWAB",
    "earn.math.left": "Kesempatan tersisa: {n}/{max}",
    "earn.math.right": "Benar! +{n} poin.",
    "earn.math.wrong": "Salah. Jawaban benarna: {answer}.",
    "earn.math.invalid": "Isi angka bulat.",
    "earn.math.limit": "Kesempatan ri allo anne lakbusukmi. Coba pole pa'risiki!",
    "earn.guess.question": "Siapakah orang terkeren dan tersigma sepanjang sejarah?",
    "earn.guess.hint": "Benar: +{guessReward} poin (se're). Salah: -{penalty} poin.",
    "earn.guess.placeholder": "Tulis jawabanta...",
    "earn.guess.submit": "TEBAK",
    "earn.guess.right": "Benar! +{n} poin.",
    "earn.guess.wrong": "Salah! -{n} poin.",
    "earn.guess.wrongZero": "Salah! Poinnu 0 mi, jadi tena nikurang.",
    "earn.guess.empty": "Tulis jawabanta dulu.",
    "earn.guess.already": "Le'ba' nijawab benar pertanyaan anne.",
    "reward.eyebrow": "POINNU LAKBUSUKMI",
    "reward.title": "Erok tambah poin?",
    "reward.text": "Lampa ri TikTok-ku, follow akun <b>@ryoiko_</b>, terus bali' mae ri sini untuk alle bonus poin.",
    "reward.tiktok": "LAMPA RI TIKTOK",
    "reward.claim": "LE'BA' FOLLOW • ALLE +{bonus}",
    "reward.claimed": "BONUSNA LE'BA' NIALLE",
    "reward.note": "Pencet di luar kotak pun bisa untuk tutup. Follow tidak bisa diverifikasi otomatis oleh website, jadi bonus diklaim secara manual.",
    "reward.openTiktok": "Lampa ri TikTok, follow dulu!",
    "reward.success": "Tarima! +{bonus} poin.",
    "reward.already": "Bonusna le'ba' nialle.",
    "reward.admin": "Akun admin sudah punya poin ∞.",
    "rename.open": "GANTI",
    "rename.eyebrow": "AKUN",
    "rename.title": "Ganti username",
    "rename.text": "Tulis username baru (2–18 karakter, diawali huruf/angka; boleh spasi, titik, strip, underscore).",
    "rename.placeholder": "Username baru...",
    "rename.save": "SIMPAN USERNAME",
    "rename.note": "Username khusus na aktifkan mode admin: poin ∞ siagang kamma-kammanna koleksi ball.",
    "rename.empty": "Username tena bulle kosong.",
    "rename.same": "Iami username ta anjo.",
    "rename.invalid": "Username 2–18 karakter, diawali huruf/angka (boleh spasi, titik, strip, underscore).",
    "rename.taken": "Username le'ba' nipake pemain lain.",
    "rename.done": "Username niganti jari {name}.",
    "rename.adminOn": "Mode admin aktif! Poin ∞ siagang kamma-kammanna ball.",
    "rename.adminOff": "Mode admin nimatei. Data asli ta nipulihkan.",
    "colrew.title": "HADIAH KOLEKSI",
    "colrew.hint": "Capai syaratna, terus pencet ALLE untuk tarima poin. Se're ri se're akun.",
    "colrew.count": "Nipunnai {n} ball",
    "colrew.tier": "Koleksi {rarity} lengkapmi",
    "tab.collection": "KOLEKSI",
    "tab.rewards": "HADIAH",
    "tab.achievements": "ACHIEVEMENT",
    "claim.button": "ALLE +{n}",
    "claim.done": "NIALLEMI",
    "claim.success": "Nialle: {name}! +{n} poin.",
    "claim.new": "Niak {n} hadiah na bulle nialle. Buka BUKU!",
    "ach.title": "ACHIEVEMENT",
    "ach.hint": "Tammatkan tantangan, terus pencet ALLE untuk tarima poin. Se're ri se're akun.",
    "ach.spin5.name": "Pemanasan", "ach.spin5.desc": "Putar mesing 5 kali.",
    "ach.spin10.name": "Mulai Penasaran", "ach.spin10.desc": "Putar mesing 10 kali.",
    "ach.spin15.name": "Ketagihanki", "ach.spin15.desc": "Putar mesing 15 kali.",
    "ach.spin20.name": "Raja Mesing", "ach.spin20.desc": "Putar mesing 20 kali.",
    "ach.spin50.name": "Maraton Putar", "ach.spin50.desc": "Putar mesing 50 kali.",
    "ach.twins.name": "Ball Sikamma", "ach.twins.desc": "Alle ball sikamma 5 kali.",
    "ach.math.name": "Otak Encer", "ach.math.desc": "Jawab benar 5 teka-teki matematika.",
    "ach.daily.name": "Rajin Lampa Mae", "ach.daily.desc": "Claim se're allo 3 kali.",
    "ach.rare.name": "Pemburu Langka", "ach.rare.desc": "Alle ball Langka atau lebih tinggi.",
    "ach.legend.name": "Sang Penemu", "ach.legend.desc": "Alle ball Legendari.",
    "rarity.common": "BIASA", "rarity.uncommon": "TENA BIASA", "rarity.rare": "LANGKA",
    "rarity.epic": "EPIC", "rarity.legendary": "LEGENDARI"
  }
};

let lang = "id";
function t(key, vars) {
  let s = (I18N[lang] && I18N[lang][key]) ?? I18N.id[key] ?? key;
  const all = { ...GLOBAL_VARS, ...(vars || {}) };
  return s.replace(/\{(\w+)\}/g, (m, k) => (k in all ? all[k] : m));
}

function applyStaticTexts() {
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-html]").forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); }); // hanya dari kamus internal
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  document.querySelectorAll("[data-i18n-aria]").forEach(el => { el.setAttribute("aria-label", t(el.dataset.i18nAria)); });
  $("language-flag").textContent = LANGS[lang].flag;
  $("language-label").textContent = LANGS[lang].label;
  document.querySelectorAll(".language-choice").forEach(b => b.classList.toggle("active", b.dataset.language === lang));
}

/* =========================================================
   DOM
   ========================================================= */
function $(id) { return document.getElementById(id); }
const loginPage = $("login-page"), gamePage = $("game-page"), nameInput = $("name-input"), loginBtn = $("login-btn");
const spinBtn = $("spin-btn"), pointsEl = $("points"), playerNameEl = $("player-name");
const resultTitle = $("result-title"), resultMessage = $("result-message"), resultBall = $("result-ball"), resultRarity = $("result-rarity");
const collectionCount = $("collection-count"), collectionPreview = $("collection-preview");
const machine = document.querySelector(".machine"), dispense = $("dispense"), toast = $("toast");
const bookBtn = $("book-btn"), bookOverlay = $("book-overlay"), closeBook = $("close-book"), bookGrid = $("book-grid");
const bookCount = $("book-count"), bookProgress = $("book-progress"), rarityGuide = $("rarity-guide"), rewardList = $("reward-list");
const achList = $("ach-list"), dotRewards = $("dot-rewards"), dotAch = $("dot-ach"), bookBadge = $("book-badge");
const rewardOverlay = $("reward-overlay"), closeReward = $("close-reward"), tiktokBtn = $("tiktok-btn"), claimBtn = $("claim-btn");
const renameBtn = $("rename-btn"), renameOverlay = $("rename-overlay"), closeRename = $("close-rename");
const earnBtn = $("earn-btn"), earnOverlay = $("earn-overlay"), closeEarn = $("close-earn");
const renameInput = $("rename-input"), renameSubmit = $("rename-submit"), renameError = $("rename-error");

/* =========================================================
   STORAGE (users[username] = record asli; tampilan admin diturunkan)
   Record: { username, points:number, collection:string[], tiktokRewardClaimed:boolean }
   ========================================================= */
const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
function readJSON(key, fallback) {
  try { const v = JSON.parse(localStorage.getItem(key)); return v && typeof v === "object" ? v : fallback; }
  catch { return fallback; }
}
function writeJSON(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* storage penuh/diblok */ } }
function getUsers() { return readJSON(KEYS.users, {}); }
function saveUsers(u) { writeJSON(KEYS.users, u); }
function getSession() { try { return localStorage.getItem(KEYS.session); } catch { return null; } }
function setSession(u) { try { localStorage.setItem(KEYS.session, u); } catch { /* ignore */ } }

const normalizeName = s => String(s || "").trim().toLowerCase().replace(/\s+/g, " ");
const isAdminName = u => ADMIN_USERNAMES.includes(normalizeName(u));

const cnt = n => (Number.isInteger(n) && n > 0 ? n : 0);   // angka hitungan: bilangan bulat >= 0
function sanitize(username, r) {
  r = r && typeof r === "object" ? r : {};
  return {
    username,
    points: Number.isFinite(r.points) ? r.points : START_POINTS,
    collection: [...new Set(Array.isArray(r.collection) ? r.collection : [])].filter(id => ID_SET.has(id)),
    tiktokRewardClaimed: !!r.tiktokRewardClaimed,
    lastDaily: typeof r.lastDaily === "string" ? r.lastDaily : null,
    mathDay: typeof r.mathDay === "string" ? r.mathDay : null,
    mathCount: Number.isInteger(r.mathCount) && r.mathCount > 0 ? r.mathCount : 0,
    guessSolved: !!r.guessSolved,
    rewards: [...new Set(Array.isArray(r.rewards) ? r.rewards : [])].filter(id => REWARD_IDS.has(id)),          // hadiah koleksi yang sudah diambil
    achievements: [...new Set(Array.isArray(r.achievements) ? r.achievements : [])].filter(id => ACH_IDS.has(id)), // achievement yang sudah diambil
    spins: cnt(r.spins), dupCount: cnt(r.dupCount), mathCorrect: cnt(r.mathCorrect), dailyCount: cnt(r.dailyCount)
  };
}
function getRecord() {
  const u = getSession(), users = getUsers();
  return u && hasOwn(users, u) ? sanitize(u, users[u]) : null;
}
function saveRecord(rec) {
  const users = getUsers();
  users[rec.username] = { ...rec };
  saveUsers(users);
}
/* Tampilan efektif: admin => poin ∞ + semua koleksi (data asli tidak ditimpa) */
function view(rec) {
  const admin = isAdminName(rec.username);
  return { ...rec, admin, points: admin ? Infinity : rec.points, collection: admin ? ALL_IDS.slice() : rec.collection };
}

function migrateLegacy() {
  const old = readJSON(KEYS.legacy, null);
  if (!old || !old.name) return;
  const u = normalizeName(old.name);
  if (!u) return;
  const users = getUsers();
  if (!hasOwn(users, u)) { users[u] = sanitize(u, old); saveUsers(users); }
}

/* =========================================================
   STATE UI
   ========================================================= */
let lastBallId = null;
let spinning = false;

/* =========================================================
   RENDER
   ========================================================= */
const face = () => '<span class="face-eye left"></span><span class="face-eye right"></span><span class="face-mouth"></span>';

function renderHeader(v) {
  playerNameEl.textContent = (v.admin ? "★ " : "") + v.username.toUpperCase();
  pointsEl.textContent = v.admin ? "∞" : String(v.points);
}
function renderResult() {
  const b = lastBallId && BALLS.find(x => x.id === lastBallId);
  if (!b) {
    resultBall.className = "mini-ball result-ball common";
    resultBall.innerHTML = face();
    resultRarity.hidden = true;
    resultTitle.textContent = t("result.waitingTitle");
    resultMessage.textContent = t("result.waitingMessage");
    return;
  }
  const bt = ballText(b, lang);
  resultBall.className = `mini-ball result-ball ${b.tier}`;
  resultBall.innerHTML = face();
  resultRarity.hidden = false;
  resultRarity.className = `rarity-chip ${b.tier}-chip`;
  resultRarity.textContent = t("rarity." + b.tier);
  resultTitle.textContent = bt.title;
  resultMessage.textContent = bt.message;
}
function renderCollection(v) {
  collectionPreview.innerHTML = "";
  BALLS.forEach(b => {
    const got = v.collection.includes(b.id);
    const x = document.createElement("div");
    x.className = "collection-slot" + (got ? "" : " locked");
    x.innerHTML = `<div class="collection-ball ${b.tier}"></div><strong></strong><span></span>`;
    x.querySelector("strong").textContent = got ? ballText(b, lang).title : "???";
    x.querySelector("span").textContent = got ? t("rarity." + b.tier) : t("book.locked");
    collectionPreview.appendChild(x);
  });
  collectionCount.textContent = `${v.collection.length} / ${BALLS.length}`;
}
function renderBook(v) {
  bookGrid.innerHTML = "";
  BALLS.forEach((b, i) => {
    const got = v.collection.includes(b.id), bt = ballText(b, lang);
    const x = document.createElement("article");
    x.className = "book-card" + (got ? "" : " locked");
    x.innerHTML = `<div class="book-card-head"><div class="book-card-name"></div><div class="book-card-rarity ${b.tier}"></div></div>` +
      `<div class="book-ball ${b.tier}">${got ? face() : '<span class="book-q">?</span>'}</div><div class="book-card-footer"></div>`;
    x.querySelector(".book-card-name").textContent = got ? bt.title : `${t("book.secret")} #${String(i + 1).padStart(2, "0")}`;
    x.querySelector(".book-card-rarity").textContent = got ? t("rarity." + b.tier) : "???";
    x.querySelector(".book-card-footer").textContent = got ? bt.message : t("book.lockedFooter");
    bookGrid.appendChild(x);
  });
  bookCount.textContent = `${v.collection.length} / ${BALLS.length}`;
  bookProgress.style.width = `${v.collection.length / BALLS.length * 100}%`;
  rarityGuide.innerHTML = TIERS.map(r => `<span class="guide ${r}">${t("rarity." + r)}</span>`).join("");
  renderRewards(v);
  renderAchievements(v);
  renderBadges(v);
}
const rewardName = r => (r.type === "count" ? t("colrew.count", { n: r.n }) : t("colrew.tier", { rarity: t("rarity." + r.tier) }));
const achName = a => t("ach." + a.id + ".name");
const achDesc = a => t("ach." + a.id + ".desc");

/* Satu baris hadiah/achievement.
   status: "locked" = belum tercapai, "ready" = tombol AMBIL, "claimed" = sudah diambil (centang hijau) */
function buildRewardItem({ kind, id, cls, icon, name, sub, points, status }) {
  const x = document.createElement("div");
  x.className = `reward-item ${cls} ${status}`;
  x.innerHTML = '<span class="reward-state"></span><div class="reward-info"><span class="reward-name"></span><span class="reward-progress"></span></div><div class="reward-action"></div>';
  x.querySelector(".reward-state").textContent = status === "claimed" ? "✓" : icon;
  x.querySelector(".reward-name").textContent = name;
  x.querySelector(".reward-progress").textContent = sub;
  const act = x.querySelector(".reward-action");
  if (status === "ready") {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "claim-mini";
    b.dataset.claim = kind + ":" + id;
    b.textContent = t("claim.button", { n: points });
    act.appendChild(b);
  } else {
    const tag = document.createElement("span");
    tag.className = status === "claimed" ? "claimed-tag" : "reward-pts";
    tag.textContent = status === "claimed" ? "✓ " + t("claim.done") : "+" + points;
    act.appendChild(tag);
  }
  return x;
}
const itemStatus = (claimed, reached) => (claimed ? "claimed" : reached ? "ready" : "locked");

function renderRewards(v) {
  rewardList.innerHTML = "";
  REWARDS.forEach(r => {
    const p = rewardProgress(r, v.collection);
    const status = itemStatus(v.admin || v.rewards.includes(r.id), p.have >= p.need);
    rewardList.appendChild(buildRewardItem({ kind: "reward", id: r.id, cls: r.type === "tier" ? r.tier : "count", icon: "○",
      name: rewardName(r), sub: `${p.have} / ${p.need}`, points: r.points, status }));
  });
}
function renderAchievements(v) {
  achList.innerHTML = "";
  ACHIEVEMENTS.forEach(a => {
    const p = v.admin ? { have: a.need, need: a.need } : achProgress(a, v);
    const status = itemStatus(v.admin || v.achievements.includes(a.id), p.have >= p.need);
    achList.appendChild(buildRewardItem({ kind: "ach", id: a.id, cls: a.cls || "count", icon: a.icon,
      name: achName(a), sub: `${achDesc(a)} (${p.have} / ${p.need})`, points: a.points, status }));
  });
}

/* Titik merah di tab + angka di tombol BUKU = jumlah hadiah yang siap diambil */
function claimableCount(v) {
  if (v.admin) return { r: 0, a: 0 };
  return {
    r: REWARDS.filter(r => !v.rewards.includes(r.id) && rewardReached(r, v.collection)).length,
    a: ACHIEVEMENTS.filter(a => !v.achievements.includes(a.id) && achDone(a, v)).length
  };
}
let knownClaimable = 0;
function renderBadges(v) {
  const c = claimableCount(v), total = c.r + c.a;
  dotRewards.hidden = !c.r;
  dotAch.hidden = !c.a;
  bookBadge.hidden = !total;
  bookBadge.textContent = String(total);
  if (total > knownClaimable) setTimeout(() => toastMsg(t("claim.new", { n: total })), 2500);   // setelah toast lain selesai
  knownClaimable = total;
}
function renderReward() {
  const rec = getRecord();
  if (rec && rec.tiktokRewardClaimed) { claimBtn.disabled = true; claimBtn.textContent = t("reward.claimed"); }
  else { claimBtn.disabled = false; claimBtn.textContent = t("reward.claim"); }
}
function renderAll() {
  const rec = getRecord();
  if (!rec) return;
  const v = view(rec);
  renderHeader(v);
  renderResult();
  renderCollection(v);
  renderBook(v);
  renderReward();
  renderEarn();
}

/* =========================================================
   UI helpers
   ========================================================= */
function toastMsg(text) {
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(toastMsg.timer);
  toastMsg.timer = setTimeout(() => toast.classList.remove("show"), 2400);
}
function confetti() {
  for (let i = 0; i < 18; i++) {
    const e = document.createElement("span");
    e.className = "confetti";
    e.style.left = "50%"; e.style.top = "47%";
    e.style.background = i % 2 ? "var(--orange)" : "var(--yellow)";
    e.style.setProperty("--dx", `${Math.random() * 420 - 210}px`);
    e.style.setProperty("--dy", `${Math.random() * 300 + 40}px`);
    document.body.appendChild(e);
    setTimeout(() => e.remove(), 950);
  }
}
function openModal(overlay) { overlay.classList.add("show"); overlay.setAttribute("aria-hidden", "false"); document.body.classList.add("modal-open"); }
function closeModal(overlay) { overlay.classList.remove("show"); overlay.setAttribute("aria-hidden", "true"); if (!document.querySelector(".modal-overlay.show")) document.body.classList.remove("modal-open"); }
function openBook() { const r = getRecord(); if (r) renderBook(view(r)); bookOverlay.classList.add("show"); bookOverlay.setAttribute("aria-hidden", "false"); document.body.classList.add("drawer-open"); }
function closeBookDrawer() { bookOverlay.classList.remove("show"); bookOverlay.setAttribute("aria-hidden", "true"); document.body.classList.remove("drawer-open"); }
function closeAllOverlays() { closeModal(earnOverlay); closeModal(rewardOverlay); closeModal(renameOverlay); closeBookDrawer(); }

/* =========================================================
   GAME LOGIC
   ========================================================= */
function pickBall() {
  let n = Math.random() * BALLS.reduce((s, b) => s + b.weight, 0);
  for (const b of BALLS) { n -= b.weight; if (n <= 0) return b; }
  return BALLS[0];
}

/* Ambil hadiah koleksi / achievement (manual, sekali per akun, syarat dicek ulang di sini) */
function claimReward(id) {
  const rec = getRecord(), r = REWARDS.find(x => x.id === id);
  if (!rec || !r || isAdminName(rec.username)) return;
  if (rec.rewards.includes(id) || !rewardReached(r, rec.collection)) return;
  rec.rewards.push(id);
  rec.points += r.points;
  afterClaim(rec, rewardName(r), r.points);
}
function claimAchievement(id) {
  const rec = getRecord(), a = ACHIEVEMENTS.find(x => x.id === id);
  if (!rec || !a || isAdminName(rec.username)) return;
  if (rec.achievements.includes(id) || !achDone(a, rec)) return;
  rec.achievements.push(id);
  rec.points += a.points;
  afterClaim(rec, achName(a), a.points);
}
function afterClaim(rec, name, points) {
  saveRecord(rec);
  const v = view(rec);
  renderHeader(v);
  renderBook(v);
  toastMsg(t("claim.success", { name, n: points }));
  confetti();
}
function onClaimClick(e) {
  const b = e.target.closest("[data-claim]");
  if (!b) return;
  const [kind, id] = b.dataset.claim.split(":");
  if (kind === "reward") claimReward(id); else claimAchievement(id);
}
function setBookTab(name) {
  document.querySelectorAll(".drawer-tab").forEach(b => b.classList.toggle("active", b.dataset.tab === name));
  document.querySelectorAll(".book-panel").forEach(p => p.classList.toggle("active", p.dataset.panel === name));
  const drawer = document.querySelector(".book-drawer");
  if (drawer) drawer.scrollTop = 0;
}

function enterGame() {
  loginPage.classList.remove("active");
  gamePage.classList.add("active");
  renderAll();
}

function login() {
  const name = normalizeName(nameInput.value);
  if (!name) { toastMsg(t("login.empty")); nameInput.focus(); return; }
  const users = getUsers();
  const isNew = !hasOwn(users, name);
  if (isNew) {
    if (!USERNAME_RE.test(name)) { toastMsg(t("login.invalid")); return; }
    users[name] = sanitize(name, {});
    saveUsers(users);
  }
  setSession(name);
  enterGame();
  toastMsg(isAdminName(name) ? t("welcome.admin") : t(isNew ? "welcome.new" : "welcome.back"));
}

function spin() {
  if (spinning) return;
  const rec = getRecord();
  if (!rec) return;
  const v = view(rec);
  if (!v.admin && rec.points < COST) { openEarn(); return; }

  // Hasil ditentukan & DISIMPAN sekarang (atomik), animasi hanyalah tampilan.
  const ball = pickBall();
  const isNewBall = !v.collection.includes(ball.id);
  const dupBonus = !v.admin && !isNewBall ? DUP_BONUS : 0;
  if (!v.admin) rec.points = rec.points - COST + dupBonus;
  if (!rec.collection.includes(ball.id)) rec.collection.push(ball.id);
  if (!v.admin) { rec.spins += 1; if (!isNewBall) rec.dupCount += 1; }   // hitungan untuk achievement
  saveRecord(rec);

  spinning = true;
  spinBtn.disabled = true;
  pointsEl.textContent = v.admin ? "∞" : String(rec.points - dupBonus);   // bonus bola kembar muncul saat hasil terbuka
  machine.classList.remove("win");
  machine.classList.add("spinning");
  dispense.textContent = "●";

  setTimeout(() => {
    machine.classList.remove("spinning");
    machine.classList.add("win");
    setTimeout(() => machine.classList.remove("win"), 700);
    lastBallId = ball.id;
    const now = getRecord();
    if (now) { const nv = view(now); renderResult(); renderCollection(nv); renderBook(nv); }
    if (now) renderHeader(view(now));
    toastMsg(t(isNewBall ? "spin.newBall" : (v.admin ? "spin.duplicateAdmin" : "spin.duplicate")));
    if (isNewBall) confetti();
    spinning = false;
    spinBtn.disabled = false;
  }, SPIN_MS);
}

function openReward() {
  const rec = getRecord();
  if (rec && isAdminName(rec.username)) { toastMsg(t("reward.admin")); return; }
  renderReward();
  openModal(rewardOverlay);
}
function claimBonus() {
  const rec = getRecord();
  if (!rec) return;
  if (isAdminName(rec.username)) { toastMsg(t("reward.admin")); closeModal(rewardOverlay); return; }
  if (rec.tiktokRewardClaimed) { toastMsg(t("reward.already")); return; }
  rec.points += TIKTOK_REWARD;
  rec.tiktokRewardClaimed = true;
  saveRecord(rec);
  renderHeader(view(rec));
  renderReward();
  toastMsg(t("reward.success"));
  confetti();
  setTimeout(() => closeModal(rewardOverlay), 600);
}

/* =========================================================
   GANTI USERNAME
   - Nama biasa  : record dipindah ke key baru (poin & koleksi ikut).
   - Nama admin  : poin ∞ + semua koleksi (diturunkan di view()).
                   Jika record admin tsb sudah ada, sesi pindah ke sana
                   (akun lama tidak dihapus, tidak ada data hilang).
   - Admin -> biasa: data asli (poin/koleksi sebelum jadi admin) kembali.
   ========================================================= */
function renameCurrent(raw) {
  const name = normalizeName(raw);
  const cur = getSession();
  if (!name) return { ok: false, key: "rename.empty" };
  if (name === cur) return { ok: false, key: "rename.same" };
  const users = getUsers();
  const toAdmin = isAdminName(name), fromAdmin = isAdminName(cur);

  if (hasOwn(users, name)) {
    if (!toAdmin) return { ok: false, key: "rename.taken" };
    setSession(name);                                // pindah ke akun admin yang sudah ada
    return { ok: true, key: "rename.adminOn" };
  }
  if (!USERNAME_RE.test(name)) return { ok: false, key: "rename.invalid" };
  if (!hasOwn(users, cur)) return { ok: false, key: "rename.invalid" };

  const rec = sanitize(name, users[cur]);
  delete users[cur];
  users[name] = rec;
  saveUsers(users);
  setSession(name);
  if (toAdmin) return { ok: true, key: "rename.adminOn" };
  if (fromAdmin) return { ok: true, key: "rename.adminOff" };
  return { ok: true, key: "rename.done", vars: { name: name.toUpperCase() } };
}
function openRename() {
  renameError.hidden = true;
  renameInput.value = getSession() || "";
  openModal(renameOverlay);
  setTimeout(() => { renameInput.focus(); renameInput.select(); }, 50);
}
function submitRename() {
  const res = renameCurrent(renameInput.value);
  if (!res.ok) { renameError.textContent = t(res.key); renameError.hidden = false; return; }
  closeModal(renameOverlay);
  renderAll();
  toastMsg(t(res.key, res.vars));
  if (res.key === "rename.adminOn") confetti();
}

/* =========================================================
   TAMBAH POIN (menu: claim harian, teka-teki matematika, tebak nama admin, TikTok)
   Batas anti-farming (semua per akun, disimpan di record):
   - Harian : sekali per tanggal lokal (lastDaily)
   - Matematika: maks MATH_DAILY_LIMIT percobaan per hari (benar/salah sama-sama dihitung)
   - Tebak   : hadiah hanya sekali (guessSolved); salah = -GUESS_PENALTY (tidak bisa < 0)
   ========================================================= */
const EARN_VIEWS = ["menu", "daily", "math", "guess"];
const feedback = { math: null, guess: null };
let mathQ = null;

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
const mathUsed = rec => (rec.mathDay === todayKey() ? rec.mathCount : 0);

/* Soal tingkat menengah: 2 langkah hitung, hasil selalu bilangan bulat positif */
function makeMathQuestion() {
  const r = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  switch (r(0, 3)) {
    case 0: { const a = r(12, 29), b = r(3, 9), c = r(10, 60); return { text: `${a} × ${b} + ${c}`, answer: a * b + c }; }
    case 1: { const a = r(15, 40), b = r(3, 9), c = r(5, 40); return { text: `${a} × ${b} − ${c}`, answer: a * b - c }; }
    case 2: { const a = r(11, 35), b = r(11, 35), c = r(3, 9); return { text: `(${a} + ${b}) × ${c}`, answer: (a + b) * c }; }
    default: { const q = r(12, 40), d = r(3, 9), c = r(5, 30); return { text: `${q * d} ÷ ${d} + ${c} × 2`, answer: q + c * 2 }; }
  }
}

function setFeedback(kind, key, vars, ok) { feedback[kind] = { key, vars, ok }; renderFeedback(kind); }
function renderFeedback(kind) {
  const el = $("earn-" + kind + "-feedback"), f = feedback[kind];
  if (!f) { el.hidden = true; return; }
  el.hidden = false;
  el.textContent = t(f.key, f.vars);
  el.className = "earn-feedback " + (f.ok ? "ok" : "bad");
}
function showEarnView(name) {
  EARN_VIEWS.forEach(v => { $("earn-" + v).hidden = v !== name; });
  if (name === "math" && !mathQ) mathQ = makeMathQuestion();
  renderEarn();
}
function renderEarn() {
  const rec = getRecord();
  if (!rec) return;
  const today = todayKey(), left = Math.max(0, MATH_DAILY_LIMIT - mathUsed(rec));
  const dailyDone = rec.lastDaily === today;

  $("earn-opt-daily").disabled = dailyDone;
  $("earn-status-daily").textContent = t(dailyDone ? "earn.status.dailyDone" : "earn.status.dailyReady");
  $("earn-opt-math").disabled = left === 0;
  $("earn-status-math").textContent = t("earn.status.math", { n: left, max: MATH_DAILY_LIMIT });
  $("earn-opt-guess").disabled = rec.guessSolved;
  $("earn-status-guess").textContent = t(rec.guessSolved ? "earn.status.guessDone" : "earn.status.guessOpen");
  $("earn-opt-tiktok").disabled = rec.tiktokRewardClaimed;
  $("earn-status-tiktok").textContent = t(rec.tiktokRewardClaimed ? "earn.status.tiktokDone" : "earn.status.tiktokOpen");

  $("earn-daily-claim").disabled = dailyDone;
  $("earn-daily-claim").textContent = t(dailyDone ? "earn.daily.done" : "earn.daily.claim");

  $("earn-math-question").textContent = mathQ ? mathQ.text + " = ?" : "";
  $("earn-math-left").textContent = t("earn.math.left", { n: left, max: MATH_DAILY_LIMIT });
  $("earn-math-submit").disabled = left === 0;
  $("earn-guess-submit").disabled = rec.guessSolved;
  renderFeedback("math");
  renderFeedback("guess");
}
function openEarn() {
  const rec = getRecord();
  if (rec && isAdminName(rec.username)) { toastMsg(t("reward.admin")); return; }
  feedback.math = feedback.guess = null;
  showEarnView("menu");
  openModal(earnOverlay);
}
function afterEarn(rec) { saveRecord(rec); renderHeader(view(rec)); renderEarn(); renderBook(view(rec)); }

function claimDaily() {
  const rec = getRecord();
  if (!rec || isAdminName(rec.username)) return;
  if (rec.lastDaily === todayKey()) { toastMsg(t("earn.daily.already")); return; }
  rec.points += DAILY_BONUS;
  rec.lastDaily = todayKey();
  rec.dailyCount += 1;
  afterEarn(rec);
  toastMsg(t("earn.daily.success"));
  confetti();
}
function submitMath() {
  const rec = getRecord();
  if (!rec || isAdminName(rec.username)) return;
  const today = todayKey();
  if (rec.mathDay !== today) { rec.mathDay = today; rec.mathCount = 0; }
  if (rec.mathCount >= MATH_DAILY_LIMIT) { setFeedback("math", "earn.math.limit", {}, false); renderEarn(); return; }
  const input = $("earn-math-input"), raw = input.value.trim();
  if (!/^-?\d+$/.test(raw)) { setFeedback("math", "earn.math.invalid", {}, false); return; }   // input tak valid tidak memakai kesempatan
  if (!mathQ) mathQ = makeMathQuestion();
  const correct = Number(raw) === mathQ.answer;
  rec.mathCount += 1;
  if (correct) { rec.points += MATH_REWARD; rec.mathCorrect += 1; setFeedback("math", "earn.math.right", { n: MATH_REWARD }, true); confetti(); }
  else setFeedback("math", "earn.math.wrong", { answer: mathQ.answer }, false);
  mathQ = makeMathQuestion();
  input.value = "";
  afterEarn(rec);
}
function submitGuess() {
  const rec = getRecord();
  if (!rec || isAdminName(rec.username)) return;
  const input = $("earn-guess-input"), ans = normalizeName(input.value);
  if (rec.guessSolved) { setFeedback("guess", "earn.guess.already", {}, false); return; }
  if (!ans) { setFeedback("guess", "earn.guess.empty", {}, false); return; }                 // kosong tidak kena penalti
  if (GUESS_ANSWERS.includes(ans)) {
    rec.points += GUESS_REWARD;
    rec.guessSolved = true;
    setFeedback("guess", "earn.guess.right", { n: GUESS_REWARD }, true);
    confetti();
  } else {
    const loss = Math.min(GUESS_PENALTY, rec.points);
    rec.points -= loss;
    setFeedback("guess", loss > 0 ? "earn.guess.wrong" : "earn.guess.wrongZero", { n: loss }, false);
  }
  input.value = "";
  afterEarn(rec);
}

/* =========================================================
   EVENTS
   ========================================================= */
loginBtn.addEventListener("click", login);
nameInput.addEventListener("keydown", e => { if (e.key === "Enter") login(); });
spinBtn.addEventListener("click", spin);

bookBtn.addEventListener("click", openBook);
closeBook.addEventListener("click", closeBookDrawer);
bookOverlay.addEventListener("click", e => { if (e.target === bookOverlay) closeBookDrawer(); });
document.querySelectorAll(".drawer-tab").forEach(btn => btn.addEventListener("click", () => setBookTab(btn.dataset.tab)));
rewardList.addEventListener("click", onClaimClick);
achList.addEventListener("click", onClaimClick);

tiktokBtn.addEventListener("click", () => { window.open(TIKTOK_URL, "_blank", "noopener,noreferrer"); toastMsg(t("reward.openTiktok")); });
claimBtn.addEventListener("click", claimBonus);
closeReward.addEventListener("click", () => closeModal(rewardOverlay));
rewardOverlay.addEventListener("click", e => { if (e.target === rewardOverlay) closeModal(rewardOverlay); });

earnBtn.addEventListener("click", openEarn);
closeEarn.addEventListener("click", () => closeModal(earnOverlay));
earnOverlay.addEventListener("click", e => { if (e.target === earnOverlay) closeModal(earnOverlay); });
$("earn-opt-daily").addEventListener("click", () => showEarnView("daily"));
$("earn-opt-math").addEventListener("click", () => { feedback.math = null; showEarnView("math"); $("earn-math-input").focus(); });
$("earn-opt-guess").addEventListener("click", () => { feedback.guess = null; showEarnView("guess"); $("earn-guess-input").focus(); });
$("earn-opt-tiktok").addEventListener("click", () => { closeModal(earnOverlay); openReward(); });
["daily", "math", "guess"].forEach(v => $("earn-back-" + v).addEventListener("click", () => showEarnView("menu")));
$("earn-daily-claim").addEventListener("click", claimDaily);
$("earn-math-submit").addEventListener("click", submitMath);
$("earn-math-input").addEventListener("keydown", e => { if (e.key === "Enter") submitMath(); });
$("earn-guess-submit").addEventListener("click", submitGuess);
$("earn-guess-input").addEventListener("keydown", e => { if (e.key === "Enter") submitGuess(); });
renameBtn.addEventListener("click", openRename);
renameSubmit.addEventListener("click", submitRename);
renameInput.addEventListener("keydown", e => { if (e.key === "Enter") submitRename(); });
renameInput.addEventListener("input", () => { renameError.hidden = true; });
closeRename.addEventListener("click", () => closeModal(renameOverlay));
renameOverlay.addEventListener("click", e => { if (e.target === renameOverlay) closeModal(renameOverlay); });

document.addEventListener("keydown", e => { if (e.key === "Escape") closeAllOverlays(); });

/* Bahasa */
const langToggle = $("language-toggle"), langDropdown = $("language-dropdown");
function setLanguage(l) {
  if (!LANGS[l]) l = "id";
  lang = l;
  try { localStorage.setItem(KEYS.lang, l); } catch { /* ignore */ }
  applyStaticTexts();
  renderAll();
}
langToggle.addEventListener("click", e => {
  e.stopPropagation();
  const open = langDropdown.classList.toggle("show");
  langToggle.setAttribute("aria-expanded", String(open));
});
document.querySelectorAll(".language-choice").forEach(btn => btn.addEventListener("click", () => {
  setLanguage(btn.dataset.language);
  langDropdown.classList.remove("show");
  langToggle.setAttribute("aria-expanded", "false");
}));
document.addEventListener("click", () => { langDropdown.classList.remove("show"); langToggle.setAttribute("aria-expanded", "false"); });

/* =========================================================
   INIT
   ========================================================= */
if (typeof window !== "undefined" && window.__MB_TEST__) {   // hook untuk tests/run-tests.js saja
  window.__MB__ = { I18N, BALLS, GUESS_ANSWERS, REWARDS, ACHIEVEMENTS, claimReward, claimAchievement, achProgress, getRecord, makeMathQuestion, view, sanitize, setLanguage: l => setLanguage(l) };
}

(function init() {
  let stored = null;
  try { stored = localStorage.getItem(KEYS.lang); } catch { /* ignore */ }
  lang = LANGS[stored] ? stored : "id";
  applyStaticTexts();
  migrateLegacy();
  if (getRecord()) enterGame(); else loginPage.classList.add("active");
  renderResult();
})();

})();
