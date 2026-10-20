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
      <div><h4>${SP.esc(e.title)}${e.sample ? '<span class="tag">Example</span>' : ""}</h4>
      <p><span class="when">${wd}${e.time ? ", " + SP.esc(e.time) : ""}</span>${e.place ? " &middot; " + SP.esc(e.place) : ""}</p>
      ${e.note ? `<p>${SP.esc(e.note)}</p>` : ""}</div></li>`;
  },
  upcoming(n) {
    const t = SP.today();
    return (window.SP_EVENTS || []).filter((e) => SP.parse(e.date) >= t).sort((a, b) => a.date.localeCompare(b.date)).slice(0, n);
  },
  kinds: { news: "News", lost: "Lost and found", sale: "For sale", free: "Free", recommend: "Recommendation", help: "Help wanted" }
};
