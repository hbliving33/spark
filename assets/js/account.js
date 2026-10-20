(() => {
  const box = document.getElementById("acct");
  if (!box) return;
  const esc = SP.esc;
  const status = { pending: "Waiting for approval", approved: "Approved neighbor", denied: "Not approved", suspended: "Suspended" };

  function preview() {
    box.innerHTML = `<div class="card-form gate"><h2>Neighbor sign-in is coming soon</h2>
      <p class="fine">Soon Suburbia Park neighbors will be able to sign in, post on the board and add events right from their phones.  Until then, use the forms on the Calendar and Bulletin Board pages and a neighbor will post for you.</p>
      <div class="cta-row"><a class="btn btn-red" href="board.html#post">Post a notice</a><a class="btn btn-white" href="calendar.html#add">Add an event</a></div></div>`;
  }
  async function signedOut() {
    const streets = await SPC.streets();
    box.innerHTML = `<div class="tabs" role="tablist"><button type="button" role="tab" data-t="in" aria-selected="true">Sign in</button><button type="button" role="tab" data-t="join" aria-selected="false">Join as a neighbor</button></div>
      <form class="card-form tab-pane" id="fIn" data-pane="in"><h2>Welcome back</h2>
        <p class="fine">Enter your email and we'll send you a sign-in link.  No password needed.</p>
        <label>Email<input type="email" name="email" required autocomplete="email"></label>
        <p class="form-msg" role="status"></p><button class="btn btn-red" type="submit">Email me a sign-in link</button></form>
      <form class="card-form tab-pane" id="fJoin" data-pane="join" hidden><h2>Join Suburbia Park</h2>
        <p class="fine">The app is just for Suburbia Park households.  We check every address, and a neighbor approves each account.  Your address is never shown to anyone; posts show only your first name and last initial.  Accounts are for adults 18 and over.</p>
        <div class="row"><label>First name<input name="first_name" required maxlength="40" autocomplete="given-name"></label><label>Last initial<input name="last_initial" required maxlength="1" autocomplete="off"></label></div>
        <div class="row"><label>House number<input name="house_number" required inputmode="numeric" pattern="[0-9]+" maxlength="8"></label>
          <label>Street<select name="street_id" required><option value="">Choose your street</option>${streets.map((s) => `<option value="${s.id}">${esc(s.name)}</option>`).join("")}</select></label></div>
        <label>Email<input type="email" name="email" required autocomplete="email"></label>
        <label class="check-row"><input type="checkbox" name="ok" required> I live in Suburbia Park, I'm 18 or older, and I'll follow the <a href="rules.html">community rules</a>.</label>
        <p class="form-msg" role="status"></p><button class="btn btn-red" type="submit">Send my sign-up link</button></form>`;
    box.querySelector(".tabs").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-t]"); if (!b) return;
      box.querySelectorAll(".tabs button").forEach((x) => x.setAttribute("aria-selected", x === b));
      box.querySelectorAll(".tab-pane").forEach((p) => (p.hidden = p.dataset.pane !== b.dataset.t));
    });
    if (location.hash === "#join") box.querySelector('[data-t="join"]').click();
    const wire = (id, fn, done) => {
      const f = document.getElementById(id);
      f.addEventListener("submit", async (e) => {
        e.preventDefault();
        const msg = f.querySelector(".form-msg"), btn = f.querySelector("button[type=submit]");
        btn.disabled = true; msg.textContent = "Sending...";
        try { await fn(Object.fromEntries(new FormData(f))); msg.textContent = done; }
        catch (err) { msg.textContent = /signups not allowed|not found|Invalid login/i.test(err.message) ? "We couldn't find that email.  Try Join as a neighbor." : (err.message || "Sorry, that didn't go through."); }
        btn.disabled = false;
      });
    };
    wire("fIn", (d) => SPC.signIn(d.email), "Check your email for the sign-in link.  It works for one hour.");
    wire("fJoin", (d) => SPC.join(d), "Check your email and tap the link to finish signing up.  Then a neighbor will approve your account.");
  }
  function signedIn(me) {
    const p = me.profile || {};
    box.innerHTML = `<div class="card-form"><h2>Hi, ${esc(p.first_name || "neighbor")}!</h2>
      <p class="acct-status s-${esc(p.status || "pending")}">${esc(status[p.status] || "Waiting for approval")}</p>
      ${p.status === "pending" ? `<p class="fine">A neighbor will review your address and approve your account soon.</p>` : ""}
      ${p.status === "denied" ? `<p class="fine">We couldn't match your address to a Suburbia Park street.  If that's a mistake, send a note through the Suggestion Box.</p>` : ""}
      ${p.status === "approved" ? `<div class="cta-row"><a class="btn btn-red" href="board.html#post">Post a notice</a><a class="btn btn-white" href="calendar.html#add">Add an event</a></div>` : ""}
      ${SPC.admin() ? `<p><a class="more" href="admin.html">Open the admin page &rarr;</a></p>` : ""}
      <p><button type="button" class="btn btn-white" id="out">Sign out</button></p></div>`;
    document.getElementById("out").onclick = () => SPC.signOut();
  }
  if (!SPC.live) return preview();
  SPC.onAuth((me) => (me ? signedIn(me) : signedOut()));
})();
