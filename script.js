const enterOverlay = document.getElementById("enterOverlay");
const enterBtn = document.getElementById("enterBtn");

const audio = document.getElementById("bgAudio");
const volumeSlider = document.getElementById("volumeSlider");
const volFill = document.getElementById("volFill");
const volumeUi = document.querySelector(".volume-ui");

const bgVideo = document.getElementById("bgVideo");
const ui = document.getElementById("ui");

/* ---- ENTER ---- */
function enterSite(){
  enterOverlay.classList.add("hidden");
  volumeUi.setAttribute("aria-hidden","false");
  audio.play().catch(()=>{});
  bgVideo.play().catch(()=>{});
}
enterBtn.addEventListener("click", enterSite);
enterOverlay.addEventListener("click", enterSite);

/* ---- VOLUME ---- */
function setVolume(v){
  audio.volume = v;
  volFill.style.transform = `scaleX(${v})`;
}
setVolume(Number(volumeSlider.value));
volumeSlider.addEventListener("input", e => setVolume(Number(e.target.value)));

/* ---- VIEW COUNTER ---- */
const viewsEl = document.getElementById("views");
const key = "bio_views";
const views = Number(localStorage.getItem(key) || 0) + 1;
localStorage.setItem(key, views);
viewsEl.textContent = views.toLocaleString();

/* ---- PARALLAX UI ---- */
window.addEventListener("mousemove", (e) => {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const dx = (e.clientX - cx) / cx;
  const dy = (e.clientY - cy) / cy;
  const strength = 6;
  ui.style.transform = `translate3d(${dx*strength}px, ${dy*strength}px, 0)`;
});

/* ---------- NEIGE ---------- */
const snow = document.getElementById("snowCanvas");
const ctxSnow = snow.getContext("2d");
let w, h, flakes;

function resizeSnow(){
  w = snow.width = window.innerWidth;
  h = snow.height = window.innerHeight;
  const count = Math.round((w * h) / 25000);
  flakes = Array.from({length: count}, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 2.2 + 0.6,
    s: Math.random() * 0.6 + 0.4,
    d: Math.random() * 1.2 + 0.2,
    a: Math.random() * Math.PI * 2
  }));
}

function drawSnow(){
  ctxSnow.clearRect(0,0,w,h);
  ctxSnow.fillStyle = "rgba(255,255,255,0.9)";
  for(const f of flakes){
    ctxSnow.beginPath();
    ctxSnow.arc(f.x, f.y, f.r, 0, Math.PI*2);
    ctxSnow.fill();
    f.y += f.s;
    f.x += Math.sin(f.a) * f.d;
    f.a += 0.01;
    if(f.y > h + 5){ f.y = -5; f.x = Math.random() * w; }
    if(f.x > w + 5) f.x = -5;
    if(f.x < -5) f.x = w + 5;
  }
  requestAnimationFrame(drawSnow);
}
resizeSnow(); drawSnow();
window.addEventListener("resize", resizeSnow);

/* ---------- PARTICULES SOURIS ---------- */
const mouseCanvas = document.getElementById("mouseCanvas");
const ctxMouse = mouseCanvas.getContext("2d");
let mw, mh;
let mouseParticles = [];
let lastMouseTime = 0;
let lastX = null, lastY = null;

function resizeMouseCanvas(){
  mw = mouseCanvas.width = window.innerWidth;
  mh = mouseCanvas.height = window.innerHeight;
}
resizeMouseCanvas();
window.addEventListener("resize", resizeMouseCanvas);

function spawnMouseParticles(x, y){
  const count = 4;
  for(let i=0; i<count; i++){
    mouseParticles.push({
      x: x + (Math.random()*6 - 3),
      y: y + (Math.random()*6 - 3),
      vx: (Math.random()*0.6 - 0.3),
      vy: Math.random()*1.2 + 0.6,
      r: Math.random()*2 + 1,
      life: 1,
      decay: Math.random()*0.02 + 0.015,
      spin: Math.random()*0.2 - 0.1
    });
  }
}

window.addEventListener("mousemove", (e) => {
  const now = performance.now();
  if(now - lastMouseTime < 8) return;
  lastMouseTime = now;
  const x = e.clientX, y = e.clientY;

  if(lastX !== null){
    const speed = Math.min(20, Math.hypot(x-lastX, y-lastY));
    const extra = Math.floor(speed / 4);
    for(let k=0; k<extra; k++) spawnMouseParticles(x, y);
  }
  spawnMouseParticles(x, y);
  lastX=x; lastY=y;
});

function drawMouseParticles(){
  ctxMouse.clearRect(0,0,mw,mh);
  for(let i=mouseParticles.length-1; i>=0; i--){
    const p = mouseParticles[i];
    p.x += p.vx; p.y += p.vy; p.vx += p.spin*0.01; p.life -= p.decay;
    ctxMouse.beginPath();
    ctxMouse.fillStyle = `rgba(255,255,255,${p.life})`;
    ctxMouse.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctxMouse.fill();
    if(p.life <= 0 || p.y > mh + 10) mouseParticles.splice(i,1);
  }
  requestAnimationFrame(drawMouseParticles);
}
drawMouseParticles();

/* ---------- TYPEWRITER SUBTITLE INFINI ---------- */
const subtitleEl = document.getElementById("subtitle");
const subtitleText = `code "fauxrouge" on stake.com`;
const typeSpeed = 55, eraseSpeed = 35, holdAfterType = 1200, holdAfterErase = 400;
let subIndex = 0, subIsErasing = false;

function loopSubtitle() {
  if (!subtitleEl) return;
  if (!subIsErasing) {
    subtitleEl.textContent = subtitleText.slice(0, subIndex + 1);
    subIndex++;
    if (subIndex === subtitleText.length) {
      subIsErasing = true;
      setTimeout(loopSubtitle, holdAfterType);
      return;
    }
    setTimeout(loopSubtitle, typeSpeed);
  } else {
    subtitleEl.textContent = subtitleText.slice(0, subIndex - 1);
    subIndex--;
    if (subIndex === 0) {
      subIsErasing = false;
      setTimeout(loopSubtitle, holdAfterErase);
      return;
    }
    setTimeout(loopSubtitle, eraseSpeed);
  }
}
loopSubtitle();

/* ================= DISCORD (LANYARD) ================= */
const DISCORD_ID = "977237185969410078";
const discordNameEl = document.getElementById("discordName");
const discordLineEl = document.getElementById("discordLine");
const discordAvatarEl = document.getElementById("discordAvatar");
const discordDotEl = document.getElementById("discordDot");

function statusColor(s){
  if(s === "online") return "#3ba55d";
  if(s === "idle")   return "#faa61a";
  if(s === "dnd")    return "#ed4245";
  return "#747f8d";
}

async function fetchDiscordPresence(){
  try{
    const res = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
    const json = await res.json();
    const data = json.data;

    discordNameEl.textContent = data.discord_user.username;

    const { id, avatar } = data.discord_user;
    discordAvatarEl.src = avatar
      ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.png?size=128`
      : `https://cdn.discordapp.com/embed/avatars/0.png`;

    discordDotEl.style.background = statusColor(data.discord_status);

    if(data.listening_to_spotify && data.spotify){
      discordLineEl.textContent = `${data.spotify.song} — ${data.spotify.artist}`;
      return;
    }

    const act = data.activities?.find(a => a.type === 0 && a.name !== "Custom Status");
    discordLineEl.textContent = act?.details || act?.state || data.discord_status;

  }catch(e){
    discordNameEl.textContent = "Discord";
    discordLineEl.textContent = "offline";
    discordDotEl.style.background = statusColor("offline");
  }
}
fetchDiscordPresence();
setInterval(fetchDiscordPresence, 8000);


/* ================= YOUTUBE (SUBS ONLY) =================
   REMPLACE par tes valeurs :
*/
const YT_CHANNEL_ID = "UCd9ThgV9m9ksRpLVit9JS3w";
const YT_API_KEY    = "AIzaSyDlFPONXd4cweFfuG5nz2xNLxS0ApYFx9c";

const ytSubsEl = document.getElementById("ytSubs");
const ytBtnEl  = document.getElementById("ytBtn");

function niceNumber(n){ return Number(n).toLocaleString(); }

async function fetchYoutubeSubs(){
  try{
    const url =
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${YT_CHANNEL_ID}&key=${YT_API_KEY}`;
    const res = await fetch(url);
    const json = await res.json();
    const subs = json.items?.[0]?.statistics?.subscriberCount;

    ytSubsEl.textContent = subs
      ? `${niceNumber(subs)} subscribers`
      : "subscribers hidden";

    ytBtnEl.href = `https://www.youtube.com/channel/${YT_CHANNEL_ID}`;

  }catch(e){
    ytSubsEl.textContent = "offline / no data";
    ytBtnEl.href = `https://www.youtube.com/channel/${YT_CHANNEL_ID}`;
  }
}
fetchYoutubeSubs();
setInterval(fetchYoutubeSubs, 120000);
