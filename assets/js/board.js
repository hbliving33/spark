(() => {
  const cork = document.getElementById("cork"), chips = document.getElementById("chips");
  if (!cork) return;
  const posts = [...(window.SP_POSTS || [])].sort((a, b) => b.date.localeCompare(a.date));
  const tilt = [-1.6, 1.2, -0.6, 1.8, -1.1, 0.7];
  function draw(k) {
    const show = posts.filter((p) => k === "all" || p.kind === k);
    cork.innerHTML = show.length ? show.map((p, i) => `<article class="note" data-k="${SP.esc(p.kind)}" style="--r:${tilt[i % tilt.length]}deg">
      <div class="nk">${SP.esc(SP.kinds[p.kind] || "Notice")}${p.sample ? '<span class="tag">Example</span>' : ""}</div>
      <h3>${SP.esc(p.title)}</h3><p>${SP.esc(p.body)}</p>
      <time datetime="${SP.esc(p.date)}">Posted ${SP.parse(p.date).toLocaleDateString("en-US", { month: "long", day: "numeric" })}</time></article>`).join("")
      : '<p class="empty" style="grid-column:1/-1;color:#5a3a12">Nothing here yet.  Be the first to post!</p>';
  }
  chips.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    chips.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b));
    draw(b.dataset.k);
  });
  draw("all");
})();
