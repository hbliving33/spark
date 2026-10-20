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
  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  let seen = false; try { seen = localStorage.getItem("sp-install-tip") === "1"; } catch (e) {}
  if (standalone || seen) return;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  let deferred = null;
  const show = (html, onGo) => {
    const tip = document.createElement("div");
    tip.className = "install-tip";
    tip.innerHTML = `<img src="assets/img/icon-192.png" alt="" width="40" height="40"><p>${html}</p>${onGo ? '<button type="button" class="btn btn-red it-go">Install</button>' : ""}<button type="button" class="it-x" aria-label="Close">&times;</button>`;
    document.body.appendChild(tip);
    const close = () => { tip.remove(); try { localStorage.setItem("sp-install-tip", "1"); } catch (e) {} };
    tip.querySelector(".it-x").onclick = close;
    if (onGo) tip.querySelector(".it-go").onclick = () => { onGo(); close(); };
  };
  addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferred = e; show("<b>Get the Suburbia Park app</b> on your Home Screen.", () => deferred.prompt()); });
  if (ios && matchMedia("(max-width: 820px)").matches) setTimeout(() => show("<b>Get the app on your iPhone</b><br>1. Tap <b>&middot;&middot;&middot;</b> next to the web address at the bottom<br>2. Tap <b>Share</b><br>3. Scroll down, tap <b>Add to Home Screen</b>, then <b>Add</b>"), 2000);
})();
