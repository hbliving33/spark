(() => {
  const cork = document.getElementById("cork"), chips = document.getElementById("chips");
  if (!cork) return;
  let posts = [], filter = "all";
  const tilt = [-1.6, 1.2, -0.6, 1.8, -1.1, 0.7];
  function draw() {
    const show = posts.filter((p) => filter === "all" || p.kind === filter);
    cork.innerHTML = show.length ? show.map((p, i) => `<article class="note" data-k="${SP.esc(p.kind)}" style="--r:${tilt[i % tilt.length]}deg">
      <div class="nk">${SP.esc(SP.kinds[p.kind] || "Notice")}${p.sample ? '<span class="tag">Example</span>' : ""}</div>
      <h3>${SP.esc(p.title)}</h3><p>${SP.esc(p.body)}</p>
      <time datetime="${SP.esc(p.date)}">Posted ${SP.parse(p.date).toLocaleDateString("en-US", { month: "long", day: "numeric" })}${p.author_name ? " by " + SP.esc(p.author_name) : ""}</time>
      ${p.id && SPC.approved() ? `<button type="button" class="report" data-id="${p.id}">Report</button>` : ""}</article>`).join("")
      : '<p class="empty" style="grid-column:1/-1;color:#5a3a12">Nothing here yet.  Be the first to post!</p>';
  }
  async function load() {
    try { posts = await SPC.posts(); } catch (e) { console.warn(e); posts = []; }
    draw();
  }
  chips.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    chips.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b));
    filter = b.dataset.k; draw();
  });
  cork.addEventListener("click", async (e) => {
    const b = e.target.closest(".report");
    if (!b) return;
    const why = prompt("What's wrong with this notice?  It will be hidden until a moderator reviews it.");
    if (why === null) return;
    try { await SPC.report("post", +b.dataset.id, why); await load(); } catch (err) { alert("Sorry, that didn't go through.  " + err.message); }
  });

  // Posting area: live form for approved neighbors, sign-in prompt for everyone else
  const area = document.getElementById("postArea");
  function paintArea() {
    if (!area || !SPC.live) return;
    if (!SPC.me()) { area.innerHTML = SP.gate("Post a notice", "Sign in to post on the board.  Only verified Suburbia Park neighbors can post."); return; }
    if (!SPC.approved()) { area.innerHTML = SP.pending(); return; }
    area.innerHTML = `<form class="card-form" id="livePost"><h2>Post a notice</h2>
      <p class="fine">Your notice goes up right away, signed with your first name and last initial.  Please don't include phone numbers, home addresses or photos of kids.</p>
      <div class="row"><label>Type of notice<select name="kind" required><option value="">Choose one</option>${Object.entries(SP.kinds).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select></label>
      <label>Headline<input name="title" required minlength="3" maxlength="80"></label></div>
      <label>Your notice<textarea name="body" rows="4" required minlength="3" maxlength="600"></textarea></label>
      <p class="form-msg" role="status"></p>
      <button class="btn btn-red" type="submit">Post it</button></form>`;
    const f = document.getElementById("livePost");
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const msg = f.querySelector(".form-msg"), btn = f.querySelector("button");
      btn.disabled = true; msg.textContent = "Posting...";
      try { await SPC.addPost(Object.fromEntries(new FormData(f))); f.reset(); msg.textContent = "Posted!  Thanks, neighbor."; await load(); }
      catch (err) { msg.textContent = err.message || "Sorry, that didn't go through."; }
      btn.disabled = false;
    });
  }
  SPC.onAuth(() => { paintArea(); draw(); });
  load();
})();
