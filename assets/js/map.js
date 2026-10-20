// Neighborhood map: Suburbia Park to the beach along the Santa Ana River Trail.
(() => {
  const el = document.getElementById("nbMap");
  if (!el || !window.L) return;
  const spots = [
    { name: "Suburbia Park", note: "Our neighborhood", at: [33.66367, -117.95316], cls: "p-home" },
    { name: "Seaview Little League fields", note: "20461 Craimer Lane", at: [33.66507, -117.95200], cls: "p-field" },
    { name: "River trail footbridge", note: "Closest way onto the trail", at: [33.66362, -117.94702], cls: "p-trail" },
    { name: "Mile marker 2", note: "Two miles to the beach", at: [33.66033, -117.94940], cls: "p-trail" },
    { name: "River mouth and the beach", note: "Mile 0 of the Santa Ana River Trail", at: [33.62907, -117.95767], cls: "p-beach" }
  ];
  const map = L.map(el, { scrollWheelZoom: false, zoomControl: true });
  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    maxZoom: 19, subdomains: "abcd",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }).addTo(map);
  const markers = spots.map((s, i) => L.marker(s.at, {
    title: s.name,
    icon: L.divIcon({ className: "nb-pin " + s.cls, html: `<span>${i + 1}</span>`, iconSize: [34, 34], iconAnchor: [17, 34], popupAnchor: [0, -30] })
  }).addTo(map).bindPopup(`<b>${s.name}</b><br>${s.note}`));
  const fit = () => map.fitBounds(L.latLngBounds(spots.map((s) => s.at)), { padding: [30, 30] });
  fit();
  const list = document.getElementById("places");
  if (list) list.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-i]");
    if (!b) return;
    const i = +b.dataset.i;
    list.querySelectorAll("li").forEach((li, j) => li.classList.toggle("on", j === i));
    map.flyTo(spots[i].at, 16, { duration: .8 });
    markers[i].openPopup();
  });
  addEventListener("resize", () => map.invalidateSize());
})();
