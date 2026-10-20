(() => {
  const box = document.getElementById("admin");
  if (!box) return;
  const esc = SP.esc, db = SPC.db;
  const when = (t) => new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  async function render() {
    if (!SPC.live) { box.innerHTML = `<p class="fine">The admin page works once the database is connected.</p>`; return; }
    if (!SPC.admin()) { box.innerHTML = `<div class="card-form gate"><h2>Admins only</h2><p class="fine">Sign in with an admin account to manage neighbors, reports and sponsors.</p><a class="btn btn-red" href="account.html">Sign in</a></div>`; return; }
    const [pend, reps, ads, streets] = await Promise.all([
      db.from("profiles").select("id, first_name, last_initial, house_number, address_ok, created_at, status, streets(name)").in("status", ["pending"]).order("created_at"),
      db.from("reports").select("*").eq("resolved", false).order("created_at"),
      db.from("ads").select("*").order("created_at", { ascending: false }),
      db.from("streets").select("*").order("name")
    ]);
    const r = reps.data || [];
    const pIds = r.filter((x) => x.post_id).map((x) => x.post_id), eIds = r.filter((x) => x.event_id).map((x) => x.event_id);
    const [ps, es] = await Promise.all([
      pIds.length ? db.from("posts").select("id,title,body,status").in("id", pIds) : { data: [] },
      eIds.length ? db.from("events").select("id,title,note,status").in("id", eIds) : { data: [] }
    ]);
    const pm = Object.fromEntries((ps.data || []).map((x) => [x.id, x])), em = Object.fromEntries((es.data || []).map((x) => [x.id, x]));
    box.innerHTML = `
      <section class="adm"><h2>Neighbors waiting for approval <span class="count">${(pend.data || []).length}</span></h2>
        ${(pend.data || []).map((p) => `<div class="adm-row"><div><b>${esc(p.first_name)} ${esc(p.last_initial)}.</b><span>${esc(p.house_number || "")} ${esc(p.streets ? p.streets.name : "")} &middot; signed up ${when(p.created_at)}</span></div>
          <div class="adm-act"><button class="btn btn-blue" data-a="approve" data-id="${p.id}">Approve</button><button class="btn btn-white" data-a="deny" data-id="${p.id}">Deny</button></div></div>`).join("") || `<p class="fine">No one is waiting.</p>`}</section>
      <section class="adm"><h2>Reported posts and events <span class="count">${r.length}</span></h2>
        ${r.map((x) => { const it = x.post_id ? pm[x.post_id] : em[x.event_id]; return `<div class="adm-row"><div><b>${esc(it ? it.title : "Deleted item")}</b><span>${esc(it ? (it.body || it.note || "") : "")}</span><span class="why">Reason: ${esc(x.reason || "none given")}</span></div>
          <div class="adm-act"><button class="btn btn-blue" data-a="restore" data-id="${x.id}" data-t="${x.post_id ? "posts" : "events"}" data-item="${x.post_id || x.event_id}">Put it back</button><button class="btn btn-white" data-a="remove" data-id="${x.id}" data-t="${x.post_id ? "posts" : "events"}" data-item="${x.post_id || x.event_id}">Remove it</button></div></div>`; }).join("") || `<p class="fine">Nothing reported.</p>`}</section>
      <section class="adm"><h2>Sponsors</h2>
        ${(ads.data || []).map((a) => `<div class="adm-row"><div><b>${esc(a.business)}</b><span>${esc(a.headline)} &middot; ${esc(a.slot)} &middot; ${esc(a.starts_on)} to ${esc(a.ends_on || "open")}</span></div>
          <div class="adm-act"><button class="btn ${a.active ? "btn-white" : "btn-blue"}" data-a="adtoggle" data-id="${a.id}" data-on="${a.active}">${a.active ? "Turn off" : "Turn on"}</button></div></div>`).join("") || `<p class="fine">No sponsors yet.</p>`}
        <form class="card-form adm-form" id="adForm"><h3>Add a sponsor</h3>
          <div class="row"><label>Business<input name="business" required maxlength="60"></label><label>Headline<input name="headline" required maxlength="80"></label></div>
          <label>Short description<input name="blurb" maxlength="140"></label>
          <div class="row"><label>Website (https://)<input name="link" type="url" pattern="https://.*"></label><label>Image link (https://)<input name="image_url" type="url" pattern="https://.*"></label></div>
          <div class="row"><label>Spot<select name="slot"><option value="strip">Home page sponsor strip</option><option value="banner">Home page banner</option><option value="directory">Local Businesses page</option></select></label><span></span></div>
          <div class="row"><label>Starts<input name="starts_on" type="date" required></label><label>Ends<input name="ends_on" type="date"></label></div>
          <p class="form-msg" role="status"></p><button class="btn btn-red" type="submit">Save sponsor (off until you turn it on)</button></form></section>
      <section class="adm"><h2>Suburbia Park streets</h2><p class="fine">Only addresses on these streets can sign up.  Leave the number range empty to allow any house number.</p>
        ${(streets.data || []).map((s) => `<div class="adm-row"><div><b>${esc(s.name)}</b><span>${s.low_number || s.high_number ? `${esc(s.low_number || "any")} to ${esc(s.high_number || "any")}` : "Any house number"}</span></div></div>`).join("")}
        <form class="card-form adm-form" id="stForm"><div class="row"><label>Street name<input name="name" required maxlength="60" placeholder="Suburbia Ln"></label><span></span></div>
          <div class="row"><label>Lowest house number<input name="low_number" inputmode="numeric" pattern="[0-9]*"></label><label>Highest house number<input name="high_number" inputmode="numeric" pattern="[0-9]*"></label></div>
          <p class="form-msg" role="status"></p><button class="btn btn-red" type="submit">Add street</button></form></section>`;
  }
  box.addEventListener("click", async (e) => {
    const b = e.target.closest("button[data-a]"); if (!b) return;
    b.disabled = true;
    const a = b.dataset.a, id = b.dataset.id;
    let res;
    if (a === "approve" || a === "deny") res = await db.from("profiles").update({ status: a === "approve" ? "approved" : "denied" }).eq("id", id);
    if (a === "restore" || a === "remove") {
      res = await db.from(b.dataset.t).update({ status: a === "restore" ? "live" : "removed" }).eq("id", b.dataset.item);
      if (!res.error) res = await db.from("reports").update({ resolved: true }).eq("id", id);
    }
    if (a === "adtoggle") res = await db.from("ads").update({ active: b.dataset.on !== "true" }).eq("id", id);
    if (res && res.error) alert(res.error.message);
    render();
  });
  box.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target, d = Object.fromEntries(new FormData(f)), msg = f.querySelector(".form-msg");
    Object.keys(d).forEach((k) => d[k] === "" && (d[k] = null));
    const res = f.id === "adForm" ? await db.from("ads").insert(d) : await db.from("streets").insert(d);
    if (res.error) { msg.textContent = res.error.message; return; }
    render();
  });
  SPC.onAuth(render);
})();
