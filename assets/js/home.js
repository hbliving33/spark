(async () => {
  const up = document.getElementById("upNext"), lp = document.getElementById("latestPosts");
  let events = [], posts = [];
  try { [events, posts] = await Promise.all([SPC.events(), SPC.posts()]); } catch (e) { console.warn(e); }
  if (up) {
    const list = SP.upcoming(3, events);
    up.innerHTML = list.length ? list.map(SP.event).join("") : '<li class="empty">Nothing on the calendar yet.  Add the first event!</li>';
  }
  if (lp) {
    const top = [...posts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
    lp.innerHTML = top.length ? top.map((p) => `<li><b>${SP.esc(p.title)}${p.sample ? '<span class="tag">Example</span>' : ""}</b><span>${SP.esc(SP.kinds[p.kind] || "Notice")}${p.author_name ? " &middot; " + SP.esc(p.author_name) : ""}</span></li>`).join("")
      : '<li class="empty">Nothing on the board yet.</li>';
  }
  const hm = document.getElementById("helpMini");
  if (hm) {
    let help = [];
    try { help = (await SPC.help()).slice(0, 3); } catch (e) { console.warn(e); }
    hm.innerHTML = help.length ? help.map((h) => `<li class="t-${SP.esc(h.type)}"><span>${h.type === "ask" ? "Needs a hand" : "Offering to help"}</span><b>${SP.esc(h.title)}</b></li>`).join("") : '<li><b>No requests right now.</b></li>';
  }
})();

// Next trash pickup and street sweeping, from the city schedule
(() => {
  const el = document.getElementById("pickup");
  if (!el || !window.SP_CITY_EVENTS) return;
  const t = SP.key(SP.today()), next = (re) => window.SP_CITY_EVENTS.filter((e) => e.date >= t && re.test(e.title)).sort((a, b) => a.date.localeCompare(b.date))[0];
  const day = (e) => SP.parse(e.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  const trash = next(/^Trash pickup/), sweep = next(/^Street sweeping/);
  // With a known pickup day, only flag holidays that actually move it.  Otherwise show the next citywide holiday.
  const late = window.SP_CITY && window.SP_CITY.trashDay ? next(/one day late/) : null, hol = late ? null : next(/: no /);
  const parts = [];
  if (trash) parts.push(`<b>Trash:</b> ${day(trash)}`);
  if (sweep) parts.push(`<b>Street sweeping:</b> ${day(sweep)}`);
  if (!parts.length) parts.push("<b>Trash and sweeping days coming soon.</b>");
  if (late) parts.push(`<span class="pk-hol">Holiday week: pickup moves to ${day(late)}</span>`);
  if (hol) parts.push(`<span class="pk-hol">${SP.esc(hol.title.split(":")[0])}, ${SP.parse(hol.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}: ${SP.esc(hol.title.split(": ")[1])}</span>`);
  el.innerHTML = `<img src="assets/img/hb-city-mark.png" alt="" width="34" height="26"><span class="pk-list">${parts.map((x) => `<span class="pk-item">${x}</span>`).join("")}</span><a href="calendar.html#city">See the city calendar</a>`;
  el.hidden = false;
})();
