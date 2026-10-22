// Shared helpers and the phone menu.
(() => {
  const btn = document.querySelector(".menu-btn"), nav = document.getElementById("nav");
  if (btn && nav) btn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", open);
  });
})();

window.SP = {
  esc: (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])),
  parse: (d) => { const [y, m, dd] = d.split("-").map(Number); return new Date(y, m - 1, dd); },
  key: (dt) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`,
  today: () => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()); },
  event(e) {
    const d = SP.parse(e.date);
    const mon = d.toLocaleDateString("en-US", { month: "short" });
    const wd = d.toLocaleDateString("en-US", { weekday: "long" });
    return `<li class="ev" data-k="${SP.esc(e.kind || "social")}">
      <div class="ev-date"><span>${mon}</span><b>${d.getDate()}</b></div>
      <div><h4>${SP.esc(e.title)}${e.sample ? '<span class="tag">Example</span>' : ""}</h4>${e.author_name ? `<p class="by">Posted by ${SP.esc(e.author_name)}</p>` : ""}
      <p><span class="when">${wd}${e.time ? ", " + SP.esc(e.time) : ""}</span>${e.place ? " &middot; " + SP.esc(e.place) : ""}</p>
      ${e.note ? `<p>${SP.esc(e.note)}</p>` : ""}</div></li>`;
  },
  upcoming(n, list) {
    const t = SP.today();
    return (list || window.SP_EVENTS || []).filter((e) => SP.parse(e.date) >= t).sort((a, b) => a.date.localeCompare(b.date)).slice(0, n);
  },
  gate(title, text) {
    return `<div class="card-form gate"><h2>${title}</h2><p class="fine">${text}</p><div class="cta-row"><a class="btn btn-red" href="account.html">Sign in</a><a class="btn btn-white" href="account.html#join">Join as a neighbor</a></div></div>`;
  },
  pending() {
    return `<div class="card-form gate"><h2>Almost there</h2><p class="fine">Your account is waiting for a neighbor to approve it.  We check every address so the app stays just for Suburbia Park.  You'll be able to post as soon as you're approved.</p></div>`;
  },
  kinds: { news: "News", lost: "Lost and found", sale: "For sale", free: "Free", recommend: "Recommendation", help: "Help wanted" }
};

// A menu link to the page you're already on scrolls back to the top instead of doing nothing.
(() => {
  const here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll('a[href="index.html"], a[href="calendar.html"], a[href="board.html"], a[href="suggestions.html"]').forEach((a) => {
    if (a.getAttribute("href") !== here) return;
    a.addEventListener("click", (e) => {
      e.preventDefault();
      scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      const nav = document.getElementById("nav"), btn = document.querySelector(".menu-btn");
      if (nav && nav.classList.contains("open")) { nav.classList.remove("open"); if (btn) btn.setAttribute("aria-expanded", "false"); }
    });
  });
})();

// Install as an app: offline support, and a one-time tip for adding to the Home Screen.
(() => {
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    // When a new version is published, switch to it right away instead of showing the saved copy
    let reloaded = false;
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener("controllerchange", () => { if (hadController && !reloaded) { reloaded = true; location.reload(); } });
    navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).then((reg) => {
      const check = () => reg.update().catch(() => {});
      document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") check(); });
    }).catch(() => {});
  }
  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  if (standalone) return;
  let seen = false; try { seen = localStorage.getItem("sp-install-tip") === "1"; } catch (e) {}
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  let deferred = null;
  const show = (html, onGo, remember = true) => {
    document.querySelectorAll(".install-tip").forEach((t) => t.remove());
    const tip = document.createElement("div");
    tip.className = "install-tip";
    tip.innerHTML = `<img src="assets/img/icon-192.png" alt="" width="40" height="40"><p>${html}</p>${onGo ? '<button type="button" class="btn btn-red it-go">Install</button>' : ""}<button type="button" class="it-x" aria-label="Close">&times;</button>`;
    document.body.appendChild(tip);
    const close = () => { tip.remove(); if (remember) try { localStorage.setItem("sp-install-tip", "1"); } catch (e) {} };
    tip.querySelector(".it-x").onclick = close;
    if (onGo) tip.querySelector(".it-go").onclick = () => { onGo(); close(); };
  };
  // Instructions for when the browser won't show its own install box
  const steps = () => {
    const ua = navigator.userAgent;
    if (ios) return "<b>Get the app on your iPhone</b><br>1. Tap <b>Share</b><br>2. Tap <b>Add to Home Screen</b>, then <b>Add</b>";
    if (/Edg\//.test(ua)) return "<b>Install in Edge</b><br>Click the <b>app icon</b> at the right end of the address bar, or open the <b>&middot;&middot;&middot;</b> menu, then <b>Apps</b>, then <b>Install this site as an app</b>.";
    if (/Chrome\//.test(ua) && !/Android/.test(ua)) return "<b>Install in Chrome</b><br>Click the <b>install icon</b> at the right end of the address bar, or open the <b>&#8942;</b> menu, then <b>Cast, save, and share</b>, then <b>Install page as app</b>.";
    if (/Android/.test(ua)) return "<b>Get the app</b><br>Open the browser menu <b>&#8942;</b>, then tap <b>Add to Home screen</b> or <b>Install app</b>.";
    if (/Macintosh/.test(ua) && /Safari\//.test(ua) && !/Chrome|Firefox/.test(ua)) return "<b>Install in Safari</b><br>Open the <b>File</b> menu, then <b>Add to Dock</b>.";
    return "<b>Get the app</b><br>Open this site in <b>Chrome</b>, <b>Edge</b> or <b>Safari</b> to install it.";
  };
  const install = () => { if (deferred) { const d = deferred; deferred = null; d.prompt(); } else show(steps(), null, false); };
  // A Get the app button that is always there, in the footer
  const foot = document.querySelector(".foot-in");
  if (foot) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "btn btn-red get-app";
    b.innerHTML = '<img src="assets/img/icon-192.png" alt="" width="22" height="22"> Get the app';
    b.onclick = install; foot.appendChild(b);
    addEventListener("appinstalled", () => b.remove());
  }
  addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferred = e; if (!seen) show("<b>Get the Suburbia Park app</b> on your Home Screen.", install); });
  if (seen) return;
  if (ios && matchMedia("(max-width: 820px)").matches) setTimeout(() => show("<b>Get the app on your iPhone</b><br>1. Tap <b>&middot;&middot;&middot;</b> next to the web address at the bottom<br>2. Tap <b>Share</b><br>3. Scroll down, tap <b>Add to Home Screen</b>, then <b>Add</b>"), 2000);
})();

// Phones: the banner camera follows the riders, so they never leave the screen and it holds on the beach during their stop
(() => {
  const wrap = document.querySelector(".hero-home .scene-wrap") || document.querySelector(".scene-wrap");
  if (!wrap) return;
  const svg = wrap.querySelector("svg.scene"), lead = svg && svg.querySelector(".fam.f-mom");
  if (!svg || !lead) return;
  const mq = matchMedia("(max-width: 700px)");
  let x = null;
  function frame() {
    if (mq.matches) {
      svg.style.animation = "none";
      const vw = wrap.clientWidth, w = svg.getBoundingClientRect().width;
      const r = lead.getBoundingClientRect(), s = svg.getBoundingClientRect();
      const riderX = r.left + r.width / 2 - s.left;              // rider position inside the picture
      const target = Math.max(vw - w, Math.min(0, vw * 0.42 - riderX));
      x = x === null ? target : x + (target - x) * 0.08;         // smooth follow
      svg.style.transform = `translateX(${x.toFixed(1)}px)`;
    } else if (x !== null) { svg.style.transform = ""; svg.style.animation = ""; x = null; }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

// Date, time and weather bar at the top of every page (Huntington Beach local time).
(() => {
  const dEl = document.getElementById("nbDate"), wEl = document.getElementById("nbWx");
  if (!dEl) return;
  const TZ = "America/Los_Angeles";
  const fmt = new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  const tick = () => { dEl.textContent = fmt.format(new Date()).replace(/, (\d{1,2}:)/, "  ·  $1"); };
  tick(); setInterval(tick, 15000);

  // Weather codes (WMO), as used by Open-Meteo
  const WX = [[0, "☀️", "Clear"], [1, "🌤️", "Mostly clear"], [2, "⛅", "Partly cloudy"], [3, "☁️", "Cloudy"], [48, "🌫️", "Fog"],
    [57, "🌦️", "Drizzle"], [67, "🌧️", "Rain"], [77, "🌨️", "Snow"], [82, "🌧️", "Showers"], [86, "🌨️", "Snow showers"], [99, "⛈️", "Thunderstorms"]];
  const look = (c) => WX.find(([max]) => c <= max) || [0, "", ""];
  const URL = "https://api.open-meteo.com/v1/forecast?latitude=33.6637&longitude=-117.9532&current=temperature_2m,weather_code,is_day" +
    "&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=America%2FLos_Angeles&forecast_days=1";
  const KEY = "sp-wx", FRESH = 15 * 60 * 1000;
  function paint(w) {
    if (!w || !w.current) return;
    let [, ico, label] = look(w.current.weather_code);
    if (w.current.weather_code <= 1 && !w.current.is_day) ico = "🌙";
    const hi = Math.round(w.daily.temperature_2m_max[0]), lo = Math.round(w.daily.temperature_2m_min[0]);
    wEl.innerHTML = `<span aria-hidden="true">${ico}</span> <b>${Math.round(w.current.temperature_2m)}°</b> ${label}<span class="nb-hl">  ·  H ${hi}°  L ${lo}°</span>`;
    wEl.title = `Huntington Beach weather: ${Math.round(w.current.temperature_2m)} degrees, ${label}.  High ${hi}, low ${lo}.`;
    wEl.hidden = false;
  }
  async function load() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
    if (saved && Date.now() - saved.t < FRESH) { paint(saved.w); return; }
    if (saved) paint(saved.w);
    try {
      const r = await fetch(URL); if (!r.ok) return;
      const w = await r.json(); paint(w);
      try { localStorage.setItem(KEY, JSON.stringify({ t: Date.now(), w })); } catch (e) {}
    } catch (e) { /* offline: keep whatever is showing */ }
  }
  load(); setInterval(load, FRESH);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) { tick(); load(); } });
})();
