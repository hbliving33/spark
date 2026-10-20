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
})();
