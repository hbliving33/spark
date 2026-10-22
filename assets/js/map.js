// Neighborhood map: OpenStreetMap with the Suburbia Park tract and LeBard Park outlined.
(() => {
  const el = document.getElementById("gmap"), list = document.getElementById("places");
  if (!el || !window.L) return;
  // Outline traced from OpenStreetMap street and park data: Brookhurst Street, LeBard Park, Lavonne Lane, Edye Drive.
  const TRACT = [[33.665,-117.95345],[33.665,-117.95264],[33.665839,-117.952642],[33.665871,-117.952048],[33.665937,-117.951532],
    [33.665519,-117.950142],[33.665464,-117.950052],[33.665461,-117.949593],[33.665453,-117.949221],[33.665352,-117.948876],
    [33.6644054,-117.9491383],[33.66434,-117.94915],[33.66226,-117.94965],[33.66185,-117.94975],[33.66185,-117.95345]];
  const map = L.map(el, { scrollWheelZoom: false, attributionControl: true });
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map);
  const tract = L.polygon(TRACT, { color: "#d62828", weight: 3, fillColor: "#d62828", fillOpacity: 0.12 }).addTo(map);
  map.fitBounds(tract.getBounds(), { padding: [24, 24] });
  let pin = null;
  if (!list) return;
  list.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-ll]");
    if (!b) return;
    list.querySelectorAll("li").forEach((li) => li.classList.toggle("on", li.contains(b)));
    if (pin) { map.removeLayer(pin); pin = null; }
    if (b.dataset.tract) { map.flyToBounds(tract.getBounds(), { padding: [24, 24] }); return; }
    const ll = b.dataset.ll.split(",").map(Number);
    pin = L.circleMarker(ll, { radius: 9, color: "#fff", weight: 3, fillColor: "#1d4ed8", fillOpacity: 1 }).addTo(map);
    map.flyTo(ll, +b.dataset.z || 17);
  });
})();
