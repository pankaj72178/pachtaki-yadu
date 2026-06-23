/* ============================================================
   Leaflet maps (OpenStreetMap, no API key):
   1) #pickMap     — tap to pin a complaint's location (form)
   2) #communityMap — every pinned complaint as a colored marker
   Centered on Bairgania (Pachtaki Yadu), Sitamarhi, Bihar.
   ============================================================ */
(function () {
  const VILLAGE = [26.62, 85.27];
  const TILES = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const TILE_OPTS = { maxZoom: 19, attribution: "© OpenStreetMap contributors" };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  // ---- Form picker ----
  let pickMap = null;
  let pickMarker = null;

  function initPickMap() {
    const el = document.getElementById("pickMap");
    if (!el || !window.L || pickMap) return;
    pickMap = L.map(el).setView(VILLAGE, 13);
    L.tileLayer(TILES, TILE_OPTS).addTo(pickMap);
    pickMap.on("click", (e) => {
      const { lat, lng } = e.latlng;
      if (pickMarker) pickMarker.setLatLng(e.latlng);
      else pickMarker = L.marker(e.latlng).addTo(pickMap);
      const a = document.getElementById("locLat");
      const b = document.getElementById("locLng");
      if (a) a.value = lat.toFixed(6);
      if (b) b.value = lng.toFixed(6);
    });
    setTimeout(() => pickMap.invalidateSize(), 350);
  }

  // Called by the app after a successful submit / form reset.
  window.resetPickMap = function () {
    if (pickMarker && pickMap) {
      pickMap.removeLayer(pickMarker);
      pickMarker = null;
    }
    const a = document.getElementById("locLat");
    const b = document.getElementById("locLng");
    if (a) a.value = "";
    if (b) b.value = "";
  };

  // ---- Community map ----
  let commMap = null;
  let commLayer = null;

  function initCommMap() {
    const el = document.getElementById("communityMap");
    if (!el || !window.L || commMap) return;
    commMap = L.map(el).setView(VILLAGE, 12);
    L.tileLayer(TILES, TILE_OPTS).addTo(commMap);
    commLayer = L.layerGroup().addTo(commMap);
    setTimeout(() => commMap.invalidateSize(), 350);
  }

  // Called by the app whenever the complaint list (re)renders.
  window.renderComplaintMap = function (list) {
    if (!commMap || !commLayer) return;
    commLayer.clearLayers();
    const pts = [];
    (list || []).forEach((c) => {
      const loc = c && c.location;
      if (!loc || loc.lat == null || loc.lng == null) return;
      const color =
        c.status === "Completed" ? "#34d399"
        : c.status === "Ongoing" ? "#60a5fa"
        : "#fbbf24";
      const m = L.circleMarker([loc.lat, loc.lng], {
        radius: 9, color, fillColor: color, fillOpacity: 0.85, weight: 2,
      });
      m.bindPopup(
        `<b>${esc(c.category || "Issue")}</b><br>${esc(c.wardNumber || "")} · ${esc(c.status || "Pending")}`
      );
      m.addTo(commLayer);
      pts.push([loc.lat, loc.lng]);
    });
    if (pts.length) {
      try {
        commMap.fitBounds(pts, { padding: [30, 30], maxZoom: 15 });
      } catch (e) {
        /* ignore */
      }
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    initPickMap();
    initCommMap();
  });
})();
