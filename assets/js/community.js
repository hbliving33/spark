// Community data layer: neighbor sign-in, live posts and events, and reports.
// Uses Supabase when assets/js/config.js is filled in; otherwise runs in preview mode
// with the sample entries in data.js.
(() => {
  const cfg = window.SP_CONFIG || {};
  const live = !!(cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase && window.supabase.createClient);
  const db = live ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey) : null;
  let me = null;      // { user, profile }
  const listeners = [];

  const C = {
    live, db,
    me: () => me,
    approved: () => !!(me && me.profile && me.profile.status === "approved"),
    admin: () => !!(me && me.profile && me.profile.is_admin && me.profile.status === "approved"),
    onAuth(fn) { listeners.push(fn); if (ready) fn(me); }
  };
  let ready = false;

  async function loadMe() {
    if (!live) { me = null; return; }
    const { data } = await db.auth.getSession();
    const user = data && data.session ? data.session.user : null;
    if (!user) { me = null; return; }
    const { data: profile } = await db.from("profiles").select("*").eq("id", user.id).maybeSingle();
    me = { user, profile };
  }
  async function refresh() {
    await loadMe();
    ready = true;
    listeners.forEach((fn) => fn(me));
    paintAccount();
  }
  if (live) db.auth.onAuthStateChange(() => { refresh(); });

  // ---- Reading ----
  C.posts = async () => {
    if (!live) return (window.SP_POSTS || []).map((p) => ({ ...p, author_name: "" }));
    const { data, error } = await db.from("posts_public").select("*").order("created_at", { ascending: false }).limit(60);
    if (error) throw error;
    return data.map((p) => ({ id: p.id, kind: p.kind, title: p.title, body: p.body, date: p.created_at.slice(0, 10), author_name: p.author_name }));
  };
  C.events = async () => {
    if (!live) return window.SP_EVENTS || [];
    const { data, error } = await db.from("events_public").select("*").order("date").limit(200);
    if (error) throw error;
    return data;
  };
  C.help = async () => {
    if (!live) return window.SP_HELP || [];
    const { data, error } = await db.from("help_public").select("*").order("created_at", { ascending: false }).limit(80);
    if (error) throw error;
    return data.map((h) => ({ ...h, date: h.created_at.slice(0, 10) }));
  };
  C.myReplies = async () => {
    if (!live || !me) return [];
    const { data } = await db.from("my_help_replies").select("*").order("created_at");
    return data || [];
  };
  C.streets = async () => {
    if (!live) return [];
    const { data } = await db.from("streets").select("id,name").order("name");
    return data || [];
  };

  // ---- Writing (security rules on the server decide what is allowed) ----
  const clean = (s, n) => String(s || "").replace(/\s+/g, " ").trim().slice(0, n);
  const BAD = /\b(fuck|shit|bitch|asshole|cunt|dick|bastard|slut|whore)\w*/i;
  C.hasBadWords = (s) => BAD.test(String(s || ""));
  C.addPost = async (p) => {
    const row = { kind: p.kind, title: clean(p.title, 80), body: clean(p.body, 600) };
    if (C.hasBadWords(row.title + " " + row.body)) throw new Error("Please keep it family friendly.");
    const { error } = await db.from("posts").insert(row);
    if (error) throw error;
  };
  C.addEvent = async (e) => {
    const row = { title: clean(e.title, 80), date: e.date, time: clean(e.time, 20) || null, place: clean(e.place, 80) || null, note: clean(e.note, 300) || null, kind: e.kind || "social" };
    if (C.hasBadWords([row.title, row.place, row.note].join(" "))) throw new Error("Please keep it family friendly.");
    const { error } = await db.from("events").insert(row);
    if (error) throw error;
  };
  C.addHelp = async (h) => {
    const row = { type: h.type, category: h.category, title: clean(h.title, 80), body: clean(h.body, 500) || null, when_text: clean(h.when_text, 60) || null };
    if (C.hasBadWords([row.title, row.body].join(" "))) throw new Error("Please keep it family friendly.");
    const { error } = await db.from("help").insert(row);
    if (error) throw error;
  };
  C.replyHelp = async (id, note) => {
    if (C.hasBadWords(note)) throw new Error("Please keep it family friendly.");
    const { error } = await db.from("help_replies").insert({ help_id: id, note: clean(note, 300) || null });
    if (error) throw new Error(/duplicate|unique/i.test(error.message) ? "You've already replied to this one." : error.message);
  };
  C.setHelpStatus = async (id, status) => {
    const { error } = await db.from("help").update({ status }).eq("id", id);
    if (error) throw error;
  };
  C.report = async (what, id, reason) => {
    const row = what === "event" ? { event_id: id } : what === "help" ? { help_id: id } : { post_id: id };
    row.reason = clean(reason, 200);
    const { error } = await db.from("reports").insert(row);
    if (error) throw error;
  };

  // ---- Sign-in ----
  const back = () => location.origin + location.pathname.replace(/[^/]*$/, "") + "account.html";
  C.join = async (f) => {
    const { error } = await db.auth.signInWithOtp({
      email: f.email.trim(),
      options: {
        shouldCreateUser: true,
        emailRedirectTo: back(),
        data: { first_name: clean(f.first_name, 40), last_initial: clean(f.last_initial, 1), house_number: clean(f.house_number, 8), street_id: String(f.street_id) }
      }
    });
    if (error) throw error;
    // Let community@suburbiapark.com know someone is waiting for approval
    const street = (document.querySelector('select[name="street_id"] option:checked') || {}).textContent || "";
    fetch("https://formsubmit.co/ajax/community@suburbiapark.com", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ _subject: "New Suburbia Park sign-up waiting for approval", _template: "table",
        name: clean(f.first_name, 40) + " " + clean(f.last_initial, 1) + ".", address: clean(f.house_number, 8) + " " + street, email: f.email.trim() }) }).catch(() => {});
  };
  C.signIn = async (email) => {
    const { error } = await db.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: false, emailRedirectTo: back() } });
    if (error) throw error;
  };
  C.signOut = async () => { if (db) await db.auth.signOut(); location.href = "index.html"; };

  // ---- Header account button ----
  function paintAccount() {
    document.querySelectorAll("[data-account]").forEach((a) => {
      if (!live) { a.textContent = "Join"; return; }
      if (!me) { a.textContent = "Sign in"; return; }
      a.textContent = me.profile ? me.profile.first_name : "My account";
    });
  }

  window.SPC = C;
  if (live) refresh(); else { ready = true; paintAccount(); }
})();
