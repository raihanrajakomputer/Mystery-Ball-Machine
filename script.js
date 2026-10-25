const loginPage=document.getElementById("login-page"),gamePage=document.getElementById("game-page"),nameInput=document.getElementById("name-input"),loginBtn=document.getElementById("login-btn"),spinBtn=document.getElementById("spin-btn"),pointsEl=document.getElementById("points"),playerNameEl=document.getElementById("player-name"),resultTitle=document.getElementById("result-title"),resultMessage=document.getElementById("result-message"),resultBall=document.getElementById("result-ball"),resultRarity=document.getElementById("result-rarity"),collectionCount=document.getElementById("collection-count"),collectionPreview=document.getElementById("collection-preview"),machine=document.querySelector(".machine"),dispense=document.getElementById("dispense"),toast=document.getElementById("toast");
const bookBtn=document.getElementById("book-btn"),bookOverlay=document.getElementById("book-overlay"),closeBook=document.getElementById("close-book"),bookGrid=document.getElementById("book-grid"),bookCount=document.getElementById("book-count"),bookProgress=document.getElementById("book-progress"),rarityGuide=document.getElementById("rarity-guide");
const rewardOverlay=document.getElementById("reward-overlay"),closeReward=document.getElementById("close-reward"),tiktokBtn=document.getElementById("tiktok-btn"),claimBtn=document.getElementById("claim-btn");
const COST=150,START_POINTS=1000,TIKTOK_REWARD=500,TIKTOK_URL="https://www.tiktok.com/@ryoiko_?is_from_webapp=1&sender_device=pc";
const balls=[
{id:"sunny-smile",rarity:"BIASA",tier:"common",title:"SENYUM MAKAMMA",message:"Ball biasa, tapi tetap senyumji. Tena masalah!",weight:33},
{id:"orange-chill",rarity:"BIASA",tier:"common",title:"SANTAI JI",message:"Maliangko. Ball anne cuma erok bikin rileks.",weight:25},
{id:"gold-glow",rarity:"TENA BIASA",tier:"uncommon",title:"MATA CAHAYA",message:"Sudah mulai aneh. Matanna sedikit bercahaya.",weight:18},
{id:"crazy-smile",rarity:"TENA BIASA",tier:"uncommon",title:"SENYUM JAIL",message:"Kenapa senyum ballna begini? Tena kuisseng.",weight:11},
{id:"shadow-face",rarity:"LANGKA",tier:"rare",title:"BALL BAYANG",message:"Warnana mulai gelap. Jangan diliat lama-lama.",weight:7},
{id:"night-eyes",rarity:"LANGKA",tier:"rare",title:"MATA MALAM",message:"Dua matanna menyala. Ballna kayak tau sesuatu.",weight:3.8},
{id:"red-monster",rarity:"EPIC",tier:"epic",title:"BALL GILA",message:"Mukana sudah beda. Sepertina ballna marah.",weight:1.5},
{id:"void-smile",rarity:"EPIC",tier:"epic",title:"SENYUM KOSONG",message:"Senyumna ada, tapi matanna tidak. Seramki.",weight:.5},
{id:"abyss",rarity:"LEGENDARI",tier:"legendary",title:"THE ABYSS",message:"Ini bukan sekadar ball. Jangan bertanya dari mana datangnya.",weight:.16},
{id:"red-eye-god",rarity:"LEGENDARI",tier:"legendary",title:"PENUNGGU",message:"Na'issengko ini? Ballna yang cari. Bukan kita.",weight:.04}
];
const rarities=[['common','BIASA'],['uncommon','TENA BIASA'],['rare','LANGKA'],['epic','EPIC'],['legendary','LEGENDARI']];
window.mysteryBallData=balls;


const ADMIN_USERNAMES=["ryels","admin"];
const USERS_KEY="mysteryBallUsers";
const SESSION_KEY="mysteryBallSession";
function isAdminUsername(u){return ADMIN_USERNAMES.includes(String(u||"").trim().toLowerCase())}
function getUsers(){return JSON.parse(localStorage.getItem(USERS_KEY))||{}}
function saveUsers(u){localStorage.setItem(USERS_KEY,JSON.stringify(u))}
function getData(){const u=localStorage.getItem(SESSION_KEY);if(!u)return null;return getUsers()[u]||null}
function saveData(d){if(!d||!d.username)return;const u=getUsers();u[d.username]={...d,points:d.admin?null:d.points};saveUsers(u);localStorage.setItem(SESSION_KEY,d.username)}
function norm(d){d.collection=d.collection||[];d.admin=!!d.admin||isAdminUsername(d.username);if(d.admin)d.points=Infinity;else if(typeof d.points!=="number")d.points=START_POINTS;if(typeof d.tiktokRewardClaimed!=="boolean")d.tiktokRewardClaimed=false;return d}
function pointsText(p){return p===Infinity?"∞":String(p)}
function toastMsg(t){toast.textContent=t;toast.classList.add("show");clearTimeout(toastMsg.t);toastMsg.t=setTimeout(()=>toast.classList.remove("show"),2200)}
function confetti(){for(let i=0;i<18;i++){let e=document.createElement("span");e.className="confetti";e.style.left="50%";e.style.top="47%";e.style.background=i%2?"var(--orange)":"var(--yellow)";e.style.setProperty("--dx",`${Math.random()*420-210}px`);e.style.setProperty("--dy",`${Math.random()*300+40}px`);document.body.appendChild(e);setTimeout(()=>e.remove(),950)}}
function enter(d){d=norm(d);saveData(d);playerNameEl.textContent=(d.admin?"★ ":"")+d.username.toUpperCase();pointsEl.textContent=pointsText(d.points);loginPage.classList.remove("active");gamePage.classList.add("active");renderCollection(d.collection)}
function weighted(){let n=Math.random()*balls.reduce((s,b)=>s+b.weight,0);for(const b of balls){n-=b.weight;if(n<=0)return b}return balls[0]}
function face(){return '<span class="face-eye left"></span><span class="face-eye right"></span><span class="face-mouth"></span>'}
function setResult(b){resultBall.className=`mini-ball result-ball ${b.tier}`;resultBall.innerHTML=face();resultRarity.textContent=b.rarity;resultRarity.className=`rarity-chip ${b.tier}-chip`}
function renderCollection(ids){collectionPreview.innerHTML="";balls.slice(0,6).forEach(b=>{let got=ids.includes(b.id),x=document.createElement("div");x.className=`collection-slot ${got?"":"locked"}`;x.innerHTML=`<div class="collection-ball ${b.tier}"></div><strong>${got?b.title:"???"}</strong><span>${got?b.rarity:"Belum nialle"}</span>`;collectionPreview.appendChild(x)});collectionCount.textContent=`${ids.length} / ${balls.length}`}
function renderBook(ids){bookGrid.innerHTML="";balls.forEach((b,i)=>{let got=ids.includes(b.id),x=document.createElement("article");x.className=`book-card ${got?"":"locked"}`;x.innerHTML=`<div class="book-card-head"><div class="book-card-name">${got?b.title:`RAHASIA #${String(i+1).padStart(2,"0")}`}</div><div class="book-card-rarity ${b.tier}">${got?b.rarity:"???"}</div></div><div class="book-ball ${b.tier}">${got?face():"<span style='position:absolute;inset:0;display:grid;place-items:center;font-family:\"Archivo Black\",Impact,sans-serif;font-size:28px'>?</span>"}</div><div class="book-card-footer">${got?b.message:"Ballna belum nialle. Putar pole."}</div>`;bookGrid.appendChild(x)});bookCount.textContent=`${ids.length} / ${balls.length}`;bookProgress.style.width=`${ids.length/balls.length*100}%`;rarityGuide.innerHTML=rarities.map(r=>`<span class="guide ${r[0]}">${r[1]}</span>`).join("")}
function openBook(){let d=norm(getData());renderBook(d.collection);bookOverlay.classList.add("show");document.body.classList.add("drawer-open")}
function closeBookDrawer(){bookOverlay.classList.remove("show");document.body.classList.remove("drawer-open")}
function openReward(){let d=norm(getData());if(d&&d.admin){toastMsg(currentLanguage==="id"?"Akun admin sudah punya poin ∞.":"Akun admin sudah punya poin ∞.");return}rewardOverlay.classList.add("show");document.body.classList.add("modal-open");if(d.tiktokRewardClaimed){claimBtn.disabled=true;claimBtn.textContent=currentLanguage==="id"?"BONUS SUDAH DIAMBIL":"BONUSNA LE'BA' NIALLE"}else{claimBtn.disabled=false;claimBtn.textContent=`${currentLanguage==="id"?"SUDAH FOLLOW":"LE'BA' FOLLOW"} • ALLE +${TIKTOK_REWARD}`}}
function closeRewardModal(){rewardOverlay.classList.remove("show");document.body.classList.remove("modal-open")}
loginBtn.addEventListener("click",()=>{const username=nameInput.value.trim().toLowerCase();if(!username){toastMsg(currentLanguage==="id"?"Tulis username kamu dulu.":"Tulis username ta dulu.");nameInput.focus();return}const users=getUsers();let d=users[username];if(!d){const admin=isAdminUsername(username);d={username:username,name:username,points:admin?Infinity:START_POINTS,collection:[],tiktokRewardClaimed:false,admin:admin};saveData(d);toastMsg(admin?"Akun admin aktif. Poin ∞.":t("welcome"))}else{d=norm(d);saveData(d);toastMsg(d.admin?(currentLanguage==="id"?"Selamat datang, admin. Poin ∞.":"Salamakki, admin. Poin ∞."):t("welcomeBack"))}enter(d)});
nameInput.addEventListener("keydown",e=>{if(e.key==="Enter")loginBtn.click()});
spinBtn.addEventListener("click",()=>{let d=getData();if(!d){toastMsg("Masukki dulu.");return}d=norm(d);if(!d.admin&&d.points<COST){openReward();return}if(!d.admin)d.points-=COST;else d.points=Infinity;saveData(d);pointsEl.textContent=pointsText(d.points);spinBtn.disabled=true;machine.classList.remove("win");machine.classList.add("spinning");dispense.textContent="●";setTimeout(()=>{let b=weighted();spinBtn.disabled=false;machine.classList.remove("spinning");machine.classList.add("win");setTimeout(()=>machine.classList.remove("win"),700);dispense.textContent="●";setResult(b);resultTitle.textContent=b.title;resultMessage.textContent=b.message;if(!d.collection.includes(b.id)){d.collection.push(b.id);toastMsg(currentLanguage==="id"?"Bola baru masuk koleksi!":"Ball baru masuk koleksita!");confetti()}else toastMsg(currentLanguage==="id"?"Bola itu sudah pernah kamu dapat.":"Ballna sudah pernah nialle.");saveData(d);renderCollection(d.collection)},850)});
bookBtn.addEventListener("click",openBook);closeBook.addEventListener("click",closeBookDrawer);bookOverlay.addEventListener("click",e=>{if(e.target===bookOverlay)closeBookDrawer()});
tiktokBtn.addEventListener("click",()=>{window.open(TIKTOK_URL,"_blank","noopener,noreferrer");toastMsg("Lampa ri TikTok, follow dulu!")});
claimBtn.addEventListener("click",()=>{let d=norm(getData());if(d.admin){toastMsg("Akun admin sudah punya poin ∞.");closeRewardModal();return}if(d.tiktokRewardClaimed){toastMsg(currentLanguage==="id"?"Bonusnya sudah pernah diambil.":"Bonusna le'ba' nialle.");return}d.points+=TIKTOK_REWARD;d.tiktokRewardClaimed=true;saveData(d);pointsEl.textContent=pointsText(d.points);claimBtn.disabled=true;claimBtn.textContent=currentLanguage==="id"?"BONUS SUDAH DIAMBIL":"BONUSNA LE'BA' NIALLE";toastMsg(currentLanguage==="id"?`Berhasil! +${TIKTOK_REWARD} poin.`:`Tarima! +${TIKTOK_REWARD} poin.`);confetti();setTimeout(closeRewardModal,600)});
closeReward.addEventListener("click",closeRewardModal);rewardOverlay.addEventListener("click",e=>{if(e.target===rewardOverlay)closeRewardModal()});document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeRewardModal();closeBookDrawer()}});
function migrateOldPlayer(){const old=JSON.parse(localStorage.getItem("mysteryBallData")||"null");if(!old||!old.name)return;const u=old.name.trim().toLowerCase();const users=getUsers();if(!users[u]){users[u]={username:u,name:old.name,points:old.points,collection:old.collection||[],tiktokRewardClaimed:old.tiktokRewardClaimed||false,admin:isAdminUsername(u)};saveUsers(users)}}
migrateOldPlayer();
let saved=getData();if(saved)enter(saved);else loginPage.classList.add("active");



/* =========================
   LANGUAGE SWITCHER
   ========================= */

const mysteryLanguages = {
  id: {
    label: "Indonesia",
    flag: "🇮🇩",
    texts: {
      ".eyebrow:first-of-type": "★ MYSTERY MACHINE ★",
    },
    static: {
      ".login-card .tagline": "Ada sesuatu yang menunggu di dalam.",
      ".login-card .login-question": "Siapa namamu?",
      "#name-input": "Tulis nama kamu...",
      "#login-btn": "MASUK KE MESIN",
      ".login-card .tiny": "Pemain baru mendapatkan 1000 poin.",
      ".points-badge": "POIN",
      ".book-word": "BUKU",
      ".intro .eyebrow": "CARI BOLA",
      ".intro h2": "APA<br>YANG ADA?",
      ".intro .hint": "Satu putaran = 150 poin.",
      ".machine-label": "SATU PUTARAN • 150 POIN",
      ".spin-btn": "PUTAR ↻",
      ".result-label": "HASIL KAMU",
      ".collection-strip .eyebrow": "BOLA KAMU",
      ".collection-strip h2": "KOLEKSI",
      ".book-header .eyebrow": "BUKU MISTERI",
      ".book-header h2": "KOLEKSI BALL",
      ".book-progress-head span": "Bola yang sudah didapat",
      ".reward-modal .eyebrow": "POIN HABIS",
      ".reward-modal h2": "Mau tambah poin?",
      ".reward-modal > p:not(.eyebrow):not(.modal-note)": "Follow akun TikTok-ku dulu, lalu kembali ke sini untuk klaim bonus poin.",
      "#tiktok-btn": "BUKA TIKTOK",
      ".modal-note": "Follow tidak bisa diverifikasi otomatis oleh website, jadi bonus diklaim secara manual."
    },
    rarity: {
      common: "BIASA",
      uncommon: "TIDAK BIASA",
      rare: "LANGKA",
      epic: "EPIC",
      legendary: "LEGENDARIS"
    }
  },

  mak: {
    label: "Makassar",
    flag: "🏴",
    texts: {},
    static: {
      ".login-card .tagline": "Niak anu natunggu ri lalang.",
      ".login-card .login-question": "Nai arenta?",
      "#name-input": "Tulis arengta...",
      "#login-btn": "MASUK RI MESING",
      ".login-card .tiny": "Pemain baru tarimai 1000 poin.",
      ".points-badge": "POIN",
      ".book-word": "BUKU",
      ".intro .eyebrow": "CARI BALLTA",
      ".intro h2": "APA<br>NA ADA?",
      ".intro .hint": "Se're putaran = 150 poin.",
      ".machine-label": "SE'RE PUTARAN • 150 POIN",
      ".spin-btn": "PUTAR ↻",
      ".result-label": "HASILTA",
      ".collection-strip .eyebrow": "BALL-BALLTA",
      ".collection-strip h2": "KOLEKSI",
      ".book-header .eyebrow": "BUKU MISTERI",
      ".book-header h2": "KOLEKSI BALL",
      ".book-progress-head span": "Ball na sudah nialle",
      ".reward-modal .eyebrow": "POINNU HABIS",
      ".reward-modal h2": "Erok tambah poin?",
      ".reward-modal > p:not(.eyebrow):not(.modal-note)": "Lampa ri TikTok-ku, follow dulu, terus bali' mae ri sini untuk alle bonus poin.",
      "#tiktok-btn": "LAMPA RI TIKTOK",
      ".modal-note": "Follow tidak bisa dicek otomatis ri web, jadi bonusna di-claim manual."
    },
    rarity: {
      common: "BIASA",
      uncommon: "TENA BIASA",
      rare: "LANGKA",
      epic: "EPIC",
      legendary: "LEGENDARI"
    }
  }
};

function mysteryCurrentLang(){
  return localStorage.getItem("mysteryBallLanguage") || "id";
}

function mysteryText(key){
  const lang = mysteryCurrentLang();
  const dict = {
    id: {
      waitingTitle:"Masih menunggu.",
      waitingMessage:"Tekan PUTAR dan cari tahu bola apa yang muncul.",
      newBall:"Bola baru masuk koleksi!",
      duplicate:"Bola itu sudah pernah kamu dapat.",
      enterName:"Tulis namamu dulu.",
      welcome:"Selamat datang! +1000 poin.",
      welcomeBack:"Selamat datang kembali.",
      loginFirst:"Masuk dulu.",
      notEnough:"Poin kamu tidak cukup.",
      followFirst:"Buka TikTok dan follow dulu.",
      bonusReceived:"Berhasil! +500 poin.",
      bonusAlready:"Bonusnya sudah pernah diambil."
    },
    mak: {
      waitingTitle:"Natunggumi.",
      waitingMessage:"Pencet PUTAR, cari ball apa na keluar.",
      newBall:"Ball baru masuk koleksita!",
      duplicate:"Ballna sudah pernah nialle.",
      enterName:"Tulis arengta dulu.",
      welcome:"Salamakki! +1000 poin.",
      welcomeBack:"Salamakki battu mae.",
      loginFirst:"Masukki dulu.",
      notEnough:"Poinnu tena cukup.",
      followFirst:"Lampa ri TikTok, follow dulu!",
      bonusReceived:"Tarima! +500 poin.",
      bonusAlready:"Bonusna le'ba' nialle."
    }
  };
  return dict[lang][key] || dict.id[key] || key;
}

function applyMysteryLanguage(){
  const lang = mysteryCurrentLang();
  const cfg = mysteryLanguages[lang];

  Object.entries(cfg.static).forEach(([selector,value])=>{
    document.querySelectorAll(selector).forEach(el=>{
      if(selector === ".points-badge"){
        const strong = el.querySelector("strong");
        if(strong){
          el.innerHTML = "● <strong>" + strong.textContent + "</strong> " + value;
        }
      }else{
        el.innerHTML = value;
      }
    });
  });

  const saved = JSON.parse(localStorage.getItem("mysteryBallData") || "null");
  if(saved){
    document.querySelectorAll("#collection-preview .collection-slot span").forEach(el=>{
      if(el.textContent.includes("Belum") || el.textContent.includes("nialle")){
        el.textContent = lang === "id" ? "Belum didapat" : "Belum nialle";
      }
    });
  }

  const resultTitle = document.getElementById("result-title");
  const resultMessage = document.getElementById("result-message");

  if(resultTitle && !resultTitle.dataset.ballId){
    resultTitle.textContent = mysteryText("waitingTitle");
    resultMessage.textContent = mysteryText("waitingMessage");
  }

  const currentBall = resultTitle && resultTitle.dataset.ballId;
  if(currentBall){
    const ball = window.mysteryBallData.find(b => b.id === currentBall);
    if(ball){
      resultTitle.textContent = ball.title;
      resultMessage.textContent = ball.message[lang];
    }
  }

  document.querySelectorAll(".book-card-rarity,.rarity-chip").forEach(el=>{
    const tierClass = ["common","uncommon","rare","epic","legendary"].find(t=>el.classList.contains(t));
    if(tierClass){
      el.textContent = cfg.rarity[tierClass];
    }
  });

  const flag = document.getElementById("language-flag");
  const label = document.getElementById("language-label");
  if(flag) flag.textContent = cfg.flag;
  if(label) label.textContent = cfg.label;

  document.querySelectorAll(".language-choice").forEach(btn=>{
    btn.classList.toggle("active", btn.dataset.language === lang);
  });
}

function initMysteryLanguage(){
  window.mysteryBallData = window.mysteryBallData || [];

  const toggle = document.getElementById("language-toggle");
  const dropdown = document.getElementById("language-dropdown");

  if(!toggle || !dropdown) return;

  toggle.addEventListener("click",(e)=>{
    e.stopPropagation();
    dropdown.classList.toggle("show");
  });

  document.querySelectorAll(".language-choice").forEach(choice=>{
    choice.addEventListener("click",()=>{
      localStorage.setItem("mysteryBallLanguage", choice.dataset.language);
      dropdown.classList.remove("show");
      applyMysteryLanguage();

      const data = JSON.parse(localStorage.getItem("mysteryBallData") || "null");
      if(data && typeof renderCollection === "function"){
        renderCollection(data.collection || []);
      }
      if(data && typeof renderBook === "function" && document.getElementById("book-overlay")?.classList.contains("show")){
        renderBook(data.collection || []);
      }
    });
  });

  document.addEventListener("click",()=>{
    dropdown.classList.remove("show");
  });

  applyMysteryLanguage();
}

const originalShowToast = window.showToast;
if(typeof originalShowToast === "function"){
  window.showToast = function(text){
    originalShowToast(text);
  };
}

document.addEventListener("DOMContentLoaded",()=>{
  initMysteryLanguage();
});


/* Bilingual message overrides for the existing rarity dataset */
window.mysteryBilingualMessages = {
  "sunny-smile": {
    id:"Bola biasa, tapi tetap senyum. Nggak ada masalah!",
    mak:"Ball biasa, tapi tetap senyumji. Tena masalah!"
  },
  "orange-chill": {
    id:"Santai. Ball ini cuma mau bikin kamu rileks.",
    mak:"Maliangko. Ball anne cuma erok bikin rileks."
  },
  "gold-glow": {
    id:"Sudah mulai aneh. Matanya sedikit bercahaya.",
    mak:"Sudah mulai aneh. Matanna sedikit bercahaya."
  },
  "crazy-smile": {
    id:"Kenapa senyum bolanya begini? Saya juga tidak tahu.",
    mak:"Kenapa senyum ballna begini? Tena kuisseng."
  },
  "shadow-face": {
    id:"Warnanya mulai gelap. Jangan dilihat terlalu lama.",
    mak:"Warnana mulai gelap. Jangan diliat lama-lama."
  },
  "night-eyes": {
    id:"Dua matanya menyala. Bolanya seperti tahu sesuatu.",
    mak:"Dua matanna menyala. Ballna kayak tau sesuatu."
  },
  "red-monster": {
    id:"Wajahnya sudah berubah. Sepertinya bola ini marah.",
    mak:"Mukana sudah beda. Sepertina ballna marah."
  },
  "void-smile": {
    id:"Senyumnya ada, tapi matanya tidak. Seram.",
    mak:"Senyumna ada, tapi matanna tidak. Seramki."
  },
  "abyss": {
    id:"Ini bukan sekadar bola. Jangan tanya dari mana asalnya.",
    mak:"Ini bukan sekadar ball. Jangan bertanya dari mana datangnya."
  },
  "red-eye-god": {
    id:"Kamu pikir kamu yang menemukan bola ini? Justru bola ini yang mencari.",
    mak:"Na'issengko ini? Ballna yang cari. Bukan kita."
  }
};


/* Keep visible result/book messages synchronized with language */
(function(){
  function syncVisibleLanguage(){
    const lang = localStorage.getItem("mysteryBallLanguage") || "id";
    const resultTitle = document.getElementById("result-title");
    const resultMessage = document.getElementById("result-message");

    if(resultTitle && resultTitle.dataset.ballId){
      const id = resultTitle.dataset.ballId;
      const msg = window.mysteryBilingualMessages && window.mysteryBilingualMessages[id];
      if(msg){
        resultMessage.textContent = msg[lang];
      }
    }

    document.querySelectorAll(".book-card").forEach(card=>{
      const name = card.querySelector(".book-card-name");
      const foot = card.querySelector(".book-card-footer");
      if(!name || !foot) return;

      const title = name.textContent.trim();
      const ball = (window.mysteryBallData || []).find(b=>b.title === title);
      if(ball && window.mysteryBilingualMessages[ball.id]){
        foot.textContent = window.mysteryBilingualMessages[ball.id][lang];
      }
    });
  }

  const observer = new MutationObserver(syncVisibleLanguage);
  observer.observe(document.body,{childList:true,subtree:true});
  setInterval(syncVisibleLanguage,300);
})();

if(document.readyState !== "loading"){
  initMysteryLanguage();
}
