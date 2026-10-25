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
const GLOBAL_VARS = { cost: COST, points: START_POINTS, bonus: TIKTOK_REWARD };

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
    "intro.hint": "Satu putaran = {cost} poin.",
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
    "spin.duplicate": "Bola itu sudah pernah kamu dapat.",
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
    "intro.hint": "Se're putaran = {cost} poin.",
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
    "spin.duplicate": "Ballna sudah pernah nialle.",
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
const bookCount = $("book-count"), bookProgress = $("book-progress"), rarityGuide = $("rarity-guide");
const rewardOverlay = $("reward-overlay"), closeReward = $("close-reward"), tiktokBtn = $("tiktok-btn"), claimBtn = $("claim-btn");
const renameBtn = $("rename-btn"), renameOverlay = $("rename-overlay"), closeRename = $("close-rename");
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

function sanitize(username, r) {
  r = r && typeof r === "object" ? r : {};
  return {
    username,
    points: Number.isFinite(r.points) ? r.points : START_POINTS,
    collection: [...new Set(Array.isArray(r.collection) ? r.collection : [])].filter(id => ID_SET.has(id)),
    tiktokRewardClaimed: !!r.tiktokRewardClaimed
  };
}
function getRecord() {
  const u = getSession(), users = getUsers();
  return u && hasOwn(users, u) ? sanitize(u, users[u]) : null;
}
function saveRecord(rec) {
  const users = getUsers();
  users[rec.username] = { username: rec.username, points: rec.points, collection: rec.collection, tiktokRewardClaimed: rec.tiktokRewardClaimed };
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
function closeAllOverlays() { closeModal(rewardOverlay); closeModal(renameOverlay); closeBookDrawer(); }

/* =========================================================
   GAME LOGIC
   ========================================================= */
function pickBall() {
  let n = Math.random() * BALLS.reduce((s, b) => s + b.weight, 0);
  for (const b of BALLS) { n -= b.weight; if (n <= 0) return b; }
  return BALLS[0];
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
  if (!v.admin && rec.points < COST) { openReward(); return; }

  // Hasil ditentukan & DISIMPAN sekarang (atomik), animasi hanyalah tampilan.
  const ball = pickBall();
  const isNewBall = !v.collection.includes(ball.id);
  if (!v.admin) rec.points -= COST;
  if (!rec.collection.includes(ball.id)) rec.collection.push(ball.id);
  saveRecord(rec);

  spinning = true;
  spinBtn.disabled = true;
  pointsEl.textContent = v.admin ? "∞" : String(rec.points);
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
    toastMsg(t(isNewBall ? "spin.newBall" : "spin.duplicate"));
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
   EVENTS
   ========================================================= */
loginBtn.addEventListener("click", login);
nameInput.addEventListener("keydown", e => { if (e.key === "Enter") login(); });
spinBtn.addEventListener("click", spin);

bookBtn.addEventListener("click", openBook);
closeBook.addEventListener("click", closeBookDrawer);
bookOverlay.addEventListener("click", e => { if (e.target === bookOverlay) closeBookDrawer(); });

tiktokBtn.addEventListener("click", () => { window.open(TIKTOK_URL, "_blank", "noopener,noreferrer"); toastMsg(t("reward.openTiktok")); });
claimBtn.addEventListener("click", claimBonus);
closeReward.addEventListener("click", () => closeModal(rewardOverlay));
rewardOverlay.addEventListener("click", e => { if (e.target === rewardOverlay) closeModal(rewardOverlay); });

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
