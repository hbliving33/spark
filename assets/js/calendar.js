(() => {
  const grid = document.getElementById("calGrid");
  if (!grid) return;
  const title = document.getElementById("calTitle"), list = document.getElementById("calList"), dayTitle = document.getElementById("dayTitle");
  let all = [], events = [], byDay = {};
  let view2 = "local";
  try { if (location.hash === "#city" || localStorage.getItem("sp-calview") === "city") view2 = "city"; } catch (e) { if (location.hash === "#city") view2 = "city"; }
  // Neighborhood view: community events plus city holiday notices.  City view: everything from the city.
  function pick() { events = all.filter((e) => view2 === "city" ? e.city : (!e.city || !e.repeat)); index(); }
  function paintViews() {
    document.querySelectorAll(".cv").forEach((b) => b.setAttribute("aria-pressed", b.dataset.view === view2));
    document.querySelectorAll(".legend[data-for]").forEach((l) => (l.hidden = l.dataset.for !== view2));
  }
  document.querySelectorAll(".cv").forEach((b) => b.addEventListener("click", () => {
    view2 = b.dataset.view;
    try { localStorage.setItem("sp-calview", view2); } catch (e) {}
    paintViews(); pick(); draw(); showList();
  }));
  paintViews();
  function index() { byDay = {}; events.sort((a, b) => a.date.localeCompare(b.date)).forEach((e) => (byDay[e.date] = byDay[e.date] || []).push(e)); }
  const today = SP.today();
  let view = new Date(today.getFullYear(), today.getMonth(), 1), selected = null;

  function showList() {
    if (selected) {
      const d = SP.parse(selected);
      dayTitle.textContent = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
      const evs = byDay[selected] || [];
      list.innerHTML = evs.length ? evs.map(SP.event).join("") : '<li class="empty">Nothing planned this day.</li>';
    } else {
      dayTitle.textContent = view2 === "city" ? "Coming up from the city" : "Upcoming events";
      const up = SP.upcoming(6, view2 === "city" ? events : events.filter((e) => !e.repeat));
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
  async function load() {
    try { events = await SPC.events(); } catch (e) { console.warn(e); events = []; }
    all = events.concat(window.SP_CITY_EVENTS || []);
    pick(); draw(); showList();
  }
  load();

  // Add-event area: live form for approved neighbors, sign-in prompt for everyone else
  const area = document.getElementById("addArea");
  function paintArea() {
    if (!area || !SPC.live) return;
    if (!SPC.me()) { area.innerHTML = SP.gate("Add an event", "Sign in to add events to the calendar.  Only verified Suburbia Park neighbors can post."); return; }
    if (!SPC.approved()) { area.innerHTML = SP.pending(); return; }
    area.innerHTML = `<form class="card-form" id="liveEvent"><h2>Add an event</h2>
      <p class="fine">Your event goes on the calendar right away, signed with your first name and last initial.</p>
      <div class="row"><label>Event name<input name="title" required minlength="3" maxlength="80"></label><label>Date<input type="date" name="date" required></label></div>
      <div class="row"><label>Start time<input name="time" placeholder="6:00 PM" maxlength="20"></label><label>Where<input name="place" placeholder="Seaview fields entrance" maxlength="80"></label></div>
      <div class="row"><label>Type<select name="kind"><option value="social">Social</option><option value="volunteer">Volunteer</option><option value="market">Market</option><option value="beach">Beach</option><option value="sports">Sports</option></select></label><span></span></div>
      <label>Details<textarea name="note" rows="3" maxlength="300"></textarea></label>
      <p class="form-msg" role="status"></p>
      <button class="btn btn-red" type="submit">Add to calendar</button></form>`;
    const f = document.getElementById("liveEvent");
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const msg = f.querySelector(".form-msg"), btn = f.querySelector("button");
      btn.disabled = true; msg.textContent = "Adding...";
      try { await SPC.addEvent(Object.fromEntries(new FormData(f))); f.reset(); msg.textContent = "Added!  Thanks, neighbor."; await load(); }
      catch (err) { msg.textContent = err.message || "Sorry, that didn't go through."; }
      btn.disabled = false;
    });
  }
  SPC.onAuth(paintArea);
})();
