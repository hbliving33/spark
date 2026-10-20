(() => {
  const up = document.getElementById("upNext");
  if (up) {
    const list = SP.upcoming(3);
    up.innerHTML = list.length ? list.map(SP.event).join("") : '<li class="empty">Nothing on the calendar yet.  Add the first event!</li>';
  }
  const lp = document.getElementById("latestPosts");
  if (lp) {
    const posts = [...(window.SP_POSTS || [])].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
    lp.innerHTML = posts.map((p) => `<li><b>${SP.esc(p.title)}${p.sample ? '<span class="tag">Example</span>' : ""}</b><span>${SP.esc(SP.kinds[p.kind] || "Notice")}</span></li>`).join("");
  }
})();
