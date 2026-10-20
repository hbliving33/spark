// Neighbors helping neighbors: asks and offers, "I can help" replies, and "My requests".
(() => {
  const list = document.getElementById("helpList");
  if (!list) return;
  const esc = SP.esc;
  const CATS = { groceries: ["Groceries and shopping", "🛒"], errands: ["Errands and pickups", "📦"], rides: ["Rides to appointments", "🚗"], meals: ["Meals", "🍲"], yard: ["Yard and odd jobs", "🌿"], pets: ["Pet care", "🐾"], tech: ["Tech help", "📱"], checkin: ["Friendly check-ins", "👋"], other: ["Something else", "🤝"] };
  let items = [], filter = "all";

  const card = (h) => {
    const [cat, ico] = CATS[h.category] || CATS.other;
    const canReply = h.id && !h.sample && !h.mine && SPC.approved();
    return `<article class="help-card t-${esc(h.type)}" data-id="${esc(h.id)}">
      <div class="hc-top"><span class="hc-ico" aria-hidden="true">${ico}</span>
        <span class="hc-type">${h.type === "ask" ? "Needs a hand" : "Offering to help"}</span>${h.sample ? '<span class="tag">Example</span>' : ""}${h.status === "matched" ? '<span class="tag tag-ok">Helper found</span>' : ""}</div>
      <h3>${esc(h.title)}</h3>
      ${h.body ? `<p>${esc(h.body)}</p>` : ""}
      <p class="hc-meta">${esc(cat)}${h.when_text ? " &middot; " + esc(h.when_text) : ""}${h.author_name ? " &middot; " + esc(h.author_name) : ""}</p>
      ${canReply ? `<div class="hc-act"><button type="button" class="btn btn-blue hc-reply">${h.type === "ask" ? "I can help" : "I'd like this help"}</button>
        <button type="button" class="report" data-id="${esc(h.id)}">Report</button></div>
        <form class="hc-form" hidden><label>Note to ${esc((h.author_name || "them").split(" ")[0])} <span class="opt">(how to reach you, when you're free)</span><textarea name="note" rows="2" maxlength="300"></textarea></label>
        <p class="form-msg" role="status"></p><button class="btn btn-red" type="submit">Send</button></form>` : ""}
      ${h.mine ? `<p class="hc-mine">This is yours.  See replies under My requests.</p>` : ""}
    </article>`;
  };
  function draw() {
    const show = items.filter((h) => filter === "all" || h.type === filter);
    list.innerHTML = show.length ? show.map(card).join("") : `<p class="empty">Nothing here yet.  Be the first!</p>`;
  }
  async function load() {
    try { items = await SPC.help(); } catch (e) { console.warn(e); items = []; }
    draw(); drawMine();
  }

  // "My requests": your own asks and offers with the replies you got
  async function drawMine() {
    const box = document.getElementById("myHelp");
    if (!box) return;
    if (!SPC.live || !SPC.approved()) { box.hidden = true; return; }
    const mine = items.filter((h) => h.mine);
    if (!mine.length) { box.hidden = true; return; }
    const replies = await SPC.myReplies();
    box.hidden = false;
    box.innerHTML = `<h2>My requests</h2>` + mine.map((h) => {
      const rs = replies.filter((r) => r.help_id === h.id);
      return `<div class="adm-row"><div><b>${esc(h.title)}</b><span>${h.type === "ask" ? "You asked for help" : "You offered help"} &middot; ${rs.length} ${rs.length === 1 ? "reply" : "replies"}</span>
        ${rs.map((r) => `<span class="reply"><b>${esc(r.helper_name)}:</b> ${esc(r.note || "No note")}</span>`).join("")}</div>
        <div class="adm-act">${h.status === "open" ? `<button class="btn btn-blue" data-st="matched" data-id="${h.id}">Got help</button>` : ""}<button class="btn btn-white" data-st="closed" data-id="${h.id}">Close it</button></div></div>`;
    }).join("");
  }
  document.addEventListener("click", async (e) => {
    const st = e.target.closest("button[data-st]");
    if (st) { st.disabled = true; try { await SPC.setHelpStatus(+st.dataset.id, st.dataset.st); } catch (err) { alert(err.message); } return load(); }
    const r = e.target.closest(".hc-reply");
    if (r) { const f = r.closest(".help-card").querySelector(".hc-form"); f.hidden = !f.hidden; if (!f.hidden) f.querySelector("textarea").focus(); return; }
    const rep = e.target.closest(".help-card .report");
    if (rep) {
      const why = prompt("What's wrong with this?  It will be hidden until a moderator reviews it.");
      if (why === null) return;
      try { await SPC.report("help", +rep.dataset.id, why); await load(); } catch (err) { alert(err.message); }
    }
  });
  list.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target, id = +f.closest(".help-card").dataset.id, msg = f.querySelector(".form-msg"), btn = f.querySelector("button");
    btn.disabled = true; msg.textContent = "Sending...";
    try { await SPC.replyHelp(id, f.note.value); msg.textContent = "Sent!  They'll see your note.  Thank you, neighbor."; f.querySelector("textarea").disabled = true; }
    catch (err) { msg.textContent = err.message; btn.disabled = false; }
  });

  const chips = document.getElementById("helpChips");
  chips.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    chips.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b));
    filter = b.dataset.k; draw();
  });

  // Ask or offer form
  const area = document.getElementById("helpArea");
  function paintArea() {
    if (!area || !SPC.live) return;
    if (!SPC.me()) { area.innerHTML = SP.gate("Ask for help or offer it", "Sign in to post.  Only verified Suburbia Park neighbors can ask or offer help."); return; }
    if (!SPC.approved()) { area.innerHTML = SP.pending(); return; }
    area.innerHTML = `<form class="card-form" id="liveHelp"><h2>Ask for help or offer it</h2>
      <div class="seg" role="radiogroup" aria-label="Type"><label><input type="radio" name="type" value="ask" checked><span>I need a hand</span></label><label><input type="radio" name="type" value="offer"><span>I can help</span></label></div>
      <div class="row"><label>What kind of help<select name="category" required>${Object.entries(CATS).map(([k, v]) => `<option value="${k}">${v[0]}</option>`).join("")}</select></label>
        <label>When <span class="opt">(optional)</span><input name="when_text" maxlength="60" placeholder="Thursday mornings"></label></div>
      <label>Short headline<input name="title" required minlength="3" maxlength="80" placeholder="Grocery pickup this week"></label>
      <label>Details <span class="opt">(optional)</span><textarea name="body" rows="3" maxlength="500"></textarea></label>
      <p class="fine">Shows your first name and last initial only.  Don't post your address; share it privately with the neighbor who helps.</p>
      <p class="form-msg" role="status"></p><button class="btn btn-red" type="submit">Post it</button></form>`;
    const f = document.getElementById("liveHelp");
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const msg = f.querySelector(".form-msg"), btn = f.querySelector("button[type=submit]");
      btn.disabled = true; msg.textContent = "Posting...";
      try { await SPC.addHelp(Object.fromEntries(new FormData(f))); f.reset(); msg.textContent = "Posted!  Neighbors can reply now."; await load(); }
      catch (err) { msg.textContent = err.message || "Sorry, that didn't go through."; }
      btn.disabled = false;
    });
  }
  SPC.onAuth(() => { paintArea(); load(); });
})();
