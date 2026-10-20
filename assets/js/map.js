// Neighborhood map: the list switches the Google map to each place.
(() => {
  const frame = document.getElementById("gmap"), list = document.getElementById("places");
  if (!frame || !list) return;
  list.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-q]");
    if (!b) return;
    list.querySelectorAll("li").forEach((li) => li.classList.toggle("on", li.contains(b)));
    frame.src = "https://maps.google.com/maps?q=" + encodeURIComponent(b.dataset.q) + "&z=" + (b.dataset.z || 16) + "&output=embed";
  });
})();
