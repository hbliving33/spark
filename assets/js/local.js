// Local page: shows this community's sponsors from HBLiving's shared ad list.
// Sample ads are never shown here, only real sponsors.
(() => {
  const ads = (window.HB_ADS || []).filter((a) => !a.sample && (a.communities || []).includes(window.SP_COMMUNITY));
  const box = document.getElementById("sponsors"), list = document.getElementById("sponsorList");
  if (!box || !list || !ads.length) return;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  list.innerHTML = ads.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)).map((a) => `<li class="spon" data-ad="${esc(a.id || "")}">
    <div class="spon-top"><span class="spon-cat">${esc(a.cat)}</span><span class="spon-tag">Sponsor</span></div>
    <b>${esc(a.name)}</b><span>${esc(a.line)}</span>
    <div class="spon-links">${a.phone ? `<a href="tel:${esc(a.phone)}" data-ad="${esc(a.id)}" data-kind="call">Call</a>` : ""}${a.url ? `<a href="${esc(a.url)}" target="_blank" rel="noopener" data-ad="${esc(a.id)}" data-kind="web">Website</a>` : ""}${a.lat ? `<a href="https://maps.google.com/?q=${a.lat},${a.lng}" target="_blank" rel="noopener" data-ad="${esc(a.id)}" data-kind="dir">Directions</a>` : ""}</div></li>`).join("");
  box.hidden = false;
  if (window.hblTrack) list.querySelectorAll(".spon[data-ad]").forEach((el) => window.hblTrack.watch(el));
  const t = document.getElementById("teaser"); if (t) t.hidden = true;
})();
