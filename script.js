const loginPage=document.getElementById("login-page");
const gamePage=document.getElementById("game-page");
const nameInput=document.getElementById("name-input");
const loginBtn=document.getElementById("login-btn");
const spinBtn=document.getElementById("spin-btn");
const pointsEl=document.getElementById("points");
const playerNameEl=document.getElementById("player-name");
const resultTitle=document.getElementById("result-title");
const resultMessage=document.getElementById("result-message");
const resultIcon=document.getElementById("result-icon");
const collectionList=document.getElementById("collection-list");
const collectionCount=document.getElementById("collection-count");
const machine=document.querySelector(".machine");
const toast=document.getElementById("toast");

const COST=150, START_POINTS=1000;

const balls=[
{id:"orange-1",rarity:"COMMON",color:"orange",title:"Not Today.",message:"Whatever you planned... maybe tomorrow.",weight:35},
{id:"orange-2",rarity:"COMMON",color:"orange",title:"Go Outside.",message:"The machine has spoken. Touch some grass.",weight:25},
{id:"yellow-1",rarity:"UNCOMMON",color:"yellow",title:"Plot Twist.",message:"You expected one thing. You got absolutely nothing.",weight:18},
{id:"yellow-2",rarity:"UNCOMMON",color:"yellow",title:"Lucky-ish.",message:"Not exactly lucky. But not bad either.",weight:12},
{id:"orange-3",rarity:"RARE",color:"orange",title:"Main Character.",message:"For the next five minutes, everything is about you.",weight:6},
{id:"yellow-3",rarity:"RARE",color:"yellow",title:"Secret Found.",message:"You found something the machine almost hid.",weight:3},
{id:"orange-4",rarity:"EPIC",color:"orange",title:"???",message:"Even the machine does not understand this one.",weight:.8},
{id:"yellow-4",rarity:"LEGENDARY",color:"yellow",title:"THE ONE.",message:"You actually got it. Don't ask how.",weight:.2}
];

function getData(){return JSON.parse(localStorage.getItem("mysteryBallData"))||null}
function saveData(data){localStorage.setItem("mysteryBallData",JSON.stringify(data))}
function showToast(text){toast.textContent=text;toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),2200)}
function enterGame(data){playerNameEl.textContent=data.name.toUpperCase();pointsEl.textContent=data.points;loginPage.classList.remove("active");gamePage.classList.add("active");renderCollection(data.collection)}

loginBtn.addEventListener("click",()=>{
 const name=nameInput.value.trim();
 if(!name){showToast("Masukkan nama dulu.");nameInput.focus();return}
 let data=getData();
 if(!data){data={name,points:START_POINTS,collection:[]};saveData(data);showToast("Welcome! +1000 points.")}
 else{data.name=name;saveData(data);showToast("Welcome back.")}
 enterGame(data);
});
nameInput.addEventListener("keydown",e=>{if(e.key==="Enter")loginBtn.click()});

function weightedPick(){
 const total=balls.reduce((sum,b)=>sum+b.weight,0);
 let random=Math.random()*total;
 for(const ball of balls){random-=ball.weight;if(random<=0)return ball}
 return balls[0];
}

spinBtn.addEventListener("click",()=>{
 const data=getData();
 if(!data){showToast("Login dulu.");return}
 if(data.points<COST){showToast("Poin lu nggak cukup.");return}
 data.points-=COST;saveData(data);pointsEl.textContent=data.points;
 spinBtn.disabled=true;machine.classList.add("spinning");
 setTimeout(()=>{
  const ball=weightedPick();
  machine.classList.remove("spinning");spinBtn.disabled=false;
  resultIcon.textContent="●";
  resultIcon.style.background=ball.color==="yellow"?"var(--yellow)":"var(--orange)";
  resultTitle.textContent=ball.title;resultMessage.textContent=ball.message;
  if(!data.collection.includes(ball.id)){data.collection.push(ball.id);showToast("New ball added to collection!")}
  else showToast("Duplicate ball.");
  saveData(data);renderCollection(data.collection);
 },650);
});

function renderCollection(ids){
 collectionList.innerHTML="";
 if(ids.length===0){collectionList.innerHTML='<div class="collection-item"><strong>EMPTY</strong><span>Spin the machine.</span></div>'}
 else ids.forEach(id=>{
  const ball=balls.find(item=>item.id===id);if(!ball)return;
  const item=document.createElement("div");item.className="collection-item";
  item.innerHTML=`<div class="collection-ball" style="background:${ball.color==="yellow"?"var(--yellow)":"var(--orange)"}"></div><strong>${ball.title}</strong><span>${ball.rarity}</span>`;
  collectionList.appendChild(item);
 });
 collectionCount.textContent=`${ids.length} / ${balls.length}`;
}

const saved=getData();
if(saved)enterGame(saved);else loginPage.classList.add("active");
