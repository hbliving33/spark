// Ad spots: show live sponsors from the database, or "Your business here" placeholders.
(async () => {
  const slots = document.querySelectorAll("[data-ad-slot]");
  for (const el of slots) {
    const slot = el.dataset.adSlot, max = +(el.dataset.max || 1);
    let ads = [];
    try { ads = (await SPC.ads(slot)).slice(0, max); } catch (e) { console.warn(e); }
    const card = (a) => {
      const inner = `${a.image_url ? `<img src="${SP.esc(a.image_url)}" alt="" loading="lazy">` : ""}<span class="ad-tag">Sponsor</span><b>${SP.esc(a.business)}</b><span class="ad-h">${SP.esc(a.headline)}</span>${a.blurb ? `<span class="ad-b">${SP.esc(a.blurb)}</span>` : ""}`;
      const safe = /^https:\/\//i.test(a.link || "") ? a.link : "";
      return safe ? `<a class="ad" href="${SP.esc(safe)}" target="_blank" rel="noopener sponsored">${inner}</a>` : `<div class="ad">${inner}</div>`;
    };
    const empty = `<a class="ad ad-empty" href="businesses.html#advertise"><span class="ad-tag">Sponsor spot</span><b>Your business here</b><span class="ad-h">Reach Suburbia Park neighbors.  Tap to learn more.</span></a>`;
    const fill = ads.map(card);
    while (fill.length < max) fill.push(empty);
    el.innerHTML = fill.join("");
  }
})();
