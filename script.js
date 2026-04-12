const enterOverlay = document.getElementById("enterOverlay");
const enterBtn = document.getElementById("enterBtn");

const audio = document.getElementById("bgAudio");
const volumeSlider = document.getElementById("volumeSlider");
const volFill = document.getElementById("volFill");

const bgVideo = document.getElementById("bgVideo");
const ui = document.getElementById("ui");

function enterSite() {
  if (enterOverlay) {
    enterOverlay.classList.add("hidden");
  }
  if (audio) {
    audio.play().catch(() => {});
  }
  if (bgVideo) {
    bgVideo.play().catch(() => {});
  }
}

if (enterBtn) {
  enterBtn.addEventListener("click", enterSite);
}
if (enterOverlay) {
  enterOverlay.addEventListener("click", enterSite);
}

function setVolume(v) {
  if (audio) {
    audio.volume = v;
  }
  if (volFill) {
    volFill.style.transform = `scaleX(${v})`;
  }
}

if (volumeSlider) {
  setVolume(Number(volumeSlider.value));
  volumeSlider.addEventListener("input", (e) => setVolume(Number(e.target.value)));
}

const viewsEl = document.getElementById("views");
const VIEWS_STORAGE_KEY = "fauxrouge_views";
const LOCAL_HOSTS = new Set(["", "localhost", "127.0.0.1", "[::1]"]);

async function updateViewCounter() {
  if (!viewsEl) return;

  const cached = localStorage.getItem(VIEWS_STORAGE_KEY);
  if (cached) {
    viewsEl.textContent = Number(cached).toLocaleString("fr-FR");
  }

  const host = window.location.hostname.toLowerCase();
  const isLocal = LOCAL_HOSTS.has(host);
  const endpoint = isLocal
    ? "https://abacus.jasoncameron.dev/get/fauxrouge.info/views"
    : "https://abacus.jasoncameron.dev/hit/fauxrouge.info/views";

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(endpoint, {
      signal: controller.signal,
      cache: "no-store"
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Counter request failed with ${response.status}`);
    }

    const data = await response.json();
    const count = Number(data.value ?? 0);
    viewsEl.textContent = count.toLocaleString("fr-FR");
    localStorage.setItem(VIEWS_STORAGE_KEY, String(count));
  } catch (error) {
    console.error("View counter unavailable:", error);
  }
}

updateViewCounter();

window.addEventListener("mousemove", (e) => {
  if (!ui) return;
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const dx = (e.clientX - cx) / cx;
  const dy = (e.clientY - cy) / cy;
  const strength = 6;
  ui.style.transform = `translate3d(${dx * strength}px, ${dy * strength}px, 0)`;
});

const snow = document.getElementById("snowCanvas");
const ctxSnow = snow ? snow.getContext("2d") : null;
let w;
let h;
let flakes;

function resizeSnow() {
  if (!snow) return;
  w = snow.width = window.innerWidth;
  h = snow.height = window.innerHeight;
  const count = Math.round((w * h) / 25000);
  flakes = Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 2.2 + 0.6,
    s: Math.random() * 0.6 + 0.4,
    d: Math.random() * 1.2 + 0.2,
    a: Math.random() * Math.PI * 2
  }));
}

function drawSnow() {
  if (!ctxSnow || !w || !h || !flakes) return;
  ctxSnow.clearRect(0, 0, w, h);
  ctxSnow.fillStyle = "rgba(255,255,255,0.9)";

  for (const f of flakes) {
    ctxSnow.beginPath();
    ctxSnow.arc(f.x, f.y, f.r, 0, Math.PI * 2);
    ctxSnow.fill();
    f.y += f.s;
    f.x += Math.sin(f.a) * f.d;
    f.a += 0.01;

    if (f.y > h + 5) {
      f.y = -5;
      f.x = Math.random() * w;
    }
    if (f.x > w + 5) f.x = -5;
    if (f.x < -5) f.x = w + 5;
  }

  requestAnimationFrame(drawSnow);
}

if (snow && ctxSnow) {
  resizeSnow();
  drawSnow();
  window.addEventListener("resize", resizeSnow);
}

const mouseCanvas = document.getElementById("mouseCanvas");
const ctxMouse = mouseCanvas ? mouseCanvas.getContext("2d") : null;
let mw;
let mh;
let mouseParticles = [];
let lastMouseTime = 0;
let lastX = null;
let lastY = null;

function resizeMouseCanvas() {
  if (!mouseCanvas) return;
  mw = mouseCanvas.width = window.innerWidth;
  mh = mouseCanvas.height = window.innerHeight;
}

function spawnMouseParticles(x, y) {
  const count = 4;
  for (let i = 0; i < count; i++) {
    mouseParticles.push({
      x: x + (Math.random() * 6 - 3),
      y: y + (Math.random() * 6 - 3),
      vx: Math.random() * 0.6 - 0.3,
      vy: Math.random() * 1.2 + 0.6,
      r: Math.random() * 2 + 1,
      life: 1,
      decay: Math.random() * 0.02 + 0.015,
      spin: Math.random() * 0.2 - 0.1
    });
  }
}

function drawMouseParticles() {
  if (!ctxMouse || !mw || !mh) return;
  ctxMouse.clearRect(0, 0, mw, mh);

  for (let i = mouseParticles.length - 1; i >= 0; i--) {
    const p = mouseParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vx += p.spin * 0.01;
    p.life -= p.decay;

    ctxMouse.beginPath();
    ctxMouse.fillStyle = `rgba(255,255,255,${p.life})`;
    ctxMouse.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctxMouse.fill();

    if (p.life <= 0 || p.y > mh + 10) {
      mouseParticles.splice(i, 1);
    }
  }

  requestAnimationFrame(drawMouseParticles);
}

if (mouseCanvas && ctxMouse) {
  resizeMouseCanvas();
  window.addEventListener("resize", resizeMouseCanvas);

  window.addEventListener("mousemove", (e) => {
    const now = performance.now();
    if (now - lastMouseTime < 8) return;
    lastMouseTime = now;

    const x = e.clientX;
    const y = e.clientY;

    if (lastX !== null && lastY !== null) {
      const speed = Math.min(20, Math.hypot(x - lastX, y - lastY));
      const extra = Math.floor(speed / 4);
      for (let k = 0; k < extra; k++) {
        spawnMouseParticles(x, y);
      }
    }

    spawnMouseParticles(x, y);
    lastX = x;
    lastY = y;
  });

  drawMouseParticles();
}

const subtitleEl = document.getElementById("subtitle");
const subtitleTexts = [
  'code "fauxrouge" on stake.com',
  "best discord shop /synapsis",
  "discord.gg/synapsis"
];
const typeSpeed = 55;
const eraseSpeed = 35;
const holdAfterType = 1200;
const holdAfterErase = 400;
let subIndex = 0;
let subTextIndex = 0;
let subIsErasing = false;

function loopSubtitle() {
  if (!subtitleEl) return;
  const currentText = subtitleTexts[subTextIndex];

  if (!subIsErasing) {
    subtitleEl.textContent = currentText.slice(0, subIndex + 1);
    subIndex += 1;

    if (subIndex === currentText.length) {
      subIsErasing = true;
      setTimeout(loopSubtitle, holdAfterType);
      return;
    }

    setTimeout(loopSubtitle, typeSpeed);
    return;
  }

  subtitleEl.textContent = currentText.slice(0, subIndex - 1);
  subIndex -= 1;

  if (subIndex === 0) {
    subIsErasing = false;
    subTextIndex = (subTextIndex + 1) % subtitleTexts.length;
    setTimeout(loopSubtitle, holdAfterErase);
    return;
  }

  setTimeout(loopSubtitle, eraseSpeed);
}

loopSubtitle();

const DISCORD_ID = "977237185969410078";
const discordNameEl = document.getElementById("discordName");
const discordLineEl = document.getElementById("discordLine");
const discordAvatarEl = document.getElementById("discordAvatar");
const discordDotEl = document.getElementById("discordDot");

function statusColor(s) {
  if (s === "online") return "#3ba55d";
  if (s === "idle") return "#faa61a";
  if (s === "dnd") return "#ed4245";
  return "#747f8d";
}

async function fetchDiscordPresence() {
  if (!discordNameEl || !discordLineEl || !discordAvatarEl || !discordDotEl) return;

  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`, { cache: "no-store" });
    const json = await res.json();
    const data = json.data;

    discordNameEl.textContent = data.discord_user.username;

    const { id, avatar } = data.discord_user;
    discordAvatarEl.src = avatar
      ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.png?size=128`
      : "https://cdn.discordapp.com/embed/avatars/0.png";

    discordDotEl.style.background = statusColor(data.discord_status);

    if (data.listening_to_spotify && data.spotify) {
      discordLineEl.textContent = `${data.spotify.song} - ${data.spotify.artist}`;
      return;
    }

    const act = data.activities?.find((a) => a.type === 0 && a.name !== "Custom Status");
    discordLineEl.textContent = act?.details || act?.state || data.discord_status;
  } catch (e) {
    discordNameEl.textContent = "Discord";
    discordLineEl.textContent = "offline";
    discordDotEl.style.background = statusColor("offline");
  }
}

fetchDiscordPresence();
setInterval(fetchDiscordPresence, 8000);

const YT_CHANNEL_ID = "UCd9ThgV9m9ksRpLVit9JS3w";
const YT_CHANNEL_URL = `https://www.youtube.com/channel/${YT_CHANNEL_ID}`;

const YT_SUBS_ENDPOINT =
  typeof window.__YT_SUBS_ENDPOINT__ === "string" && window.__YT_SUBS_ENDPOINT__.trim()
    ? window.__YT_SUBS_ENDPOINT__.trim()
    : "./data/youtube-subs.json";

const ytSubsEl = document.getElementById("ytSubs");
const ytBtnEl = document.getElementById("ytBtn");

function niceNumber(n) {
  return Number(n).toLocaleString("en-US");
}

async function fetchYoutubeSubs() {
  if (!ytSubsEl || !ytBtnEl) return;

  ytBtnEl.href = YT_CHANNEL_URL;

  try {
    const endpointUrl = YT_SUBS_ENDPOINT.includes("?")
      ? `${YT_SUBS_ENDPOINT}&t=${Date.now()}`
      : `${YT_SUBS_ENDPOINT}?t=${Date.now()}`;
    const res = await fetch(endpointUrl, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`YouTube endpoint returned ${res.status}`);
    }

    const data = await res.json();
    const subs = Number(data.subscriberCount ?? data.subs ?? data.count);

    ytSubsEl.textContent = Number.isFinite(subs) && subs >= 0
      ? `${niceNumber(subs)} subscribers`
      : "subscribers hidden";
  } catch (e) {
    ytSubsEl.textContent = "live stats unavailable";
  }
}

fetchYoutubeSubs();
setInterval(fetchYoutubeSubs, 120000);
