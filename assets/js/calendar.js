(() => {
  const grid = document.getElementById("calGrid");
  if (!grid) return;
  const title = document.getElementById("calTitle"), list = document.getElementById("calList"), dayTitle = document.getElementById("dayTitle");
  const events = [...(window.SP_EVENTS || [])].sort((a, b) => a.date.localeCompare(b.date));
  const byDay = {};
  events.forEach((e) => (byDay[e.date] = byDay[e.date] || []).push(e));
  const today = SP.today();
  let view = new Date(today.getFullYear(), today.getMonth(), 1), selected = null;

  function showList() {
    if (selected) {
      const d = SP.parse(selected);
      dayTitle.textContent = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
      const evs = byDay[selected] || [];
      list.innerHTML = evs.length ? evs.map(SP.event).join("") : '<li class="empty">Nothing planned this day.</li>';
    } else {
      dayTitle.textContent = "Upcoming events";
      const up = SP.upcoming(6);
      list.innerHTML = up.length ? up.map(SP.event).join("") : '<li class="empty">Nothing on the calendar yet.</li>';
    }
  }
  function draw() {
    title.textContent = view.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const start = new Date(view.getFullYear(), view.getMonth(), 1 - view.getDay());
    let html = "";
    for (let i = 0; i < 42; i++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const k = SP.key(d), evs = byDay[k] || [];
      const cls = ["day", d.getMonth() !== view.getMonth() ? "out" : "", +d === +today ? "today" : "", k === selected ? "sel" : ""].join(" ");
      const label = d.toLocaleDateString("en-US", { month: "long", day: "numeric" }) + (evs.length ? `, ${evs.length} event${evs.length > 1 ? "s" : ""}` : "");
      html += `<button type="button" class="${cls}" data-k="${k}" aria-label="${label}"${k === selected ? ' aria-pressed="true"' : ""}><span>${d.getDate()}</span><span class="dots">${evs.map((e) => `<i class="dot ${SP.esc(e.kind || "social")}"></i>`).join("")}</span></button>`;
      if (i === 34 && d.getMonth() !== view.getMonth()) break;
    }
    grid.innerHTML = html;
  }
  grid.addEventListener("click", (e) => {
    const b = e.target.closest(".day");
    if (!b) return;
    selected = selected === b.dataset.k ? null : b.dataset.k;
    draw(); showList();
  });
  document.getElementById("calPrev").onclick = () => { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); draw(); };
  document.getElementById("calNext").onclick = () => { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); draw(); };
  draw(); showList();
})();
