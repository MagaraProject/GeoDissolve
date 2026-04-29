/**
 * Map visualization (Leaflet), per-layer GeoJSON groups, selection, tooltips.
 */

let map = null;
let graticuleGroup = null;
const layerMap = {};
let selectionLayer = null;
let onFeatureSelect = null;

function initMap(containerId, libsPrefix = "libs/") {
  if (map) return map;

  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: `${libsPrefix}images/marker-icon-2x.png`,
    iconUrl: `${libsPrefix}images/marker-icon.png`,
    shadowUrl: `${libsPrefix}images/marker-shadow.png`,
  });

  map = L.map(containerId, {
    preferCanvas: true,
    zoomControl: true,
    worldCopyJump: true,
  }).setView([20, 0], 2);

  selectionLayer = L.geoJSON(undefined, {
    style: { color: "#fbbf24", weight: 3, fillOpacity: 0.15 },
  }).addTo(map);

  graticuleGroup = L.layerGroup().addTo(map);

  map.createPane("basemap");
  map.getPane("basemap").style.zIndex = "200";

  map.on("click", () => {
    selectionLayer?.clearLayers();
    onFeatureSelect?.(null);
  });

  applyOfflineBasemap();
  return map;
}

function drawGraticule() {
  if (!map || !graticuleGroup) return;
  graticuleGroup.clearLayers();
  const b = map.getBounds();
  if (!b.isValid()) return;
  const step = map.getZoom() < 4 ? 10 : map.getZoom() < 6 ? 5 : 2;
  const south = Math.floor(b.getSouth() / step) * step;
  const north = Math.ceil(b.getNorth() / step) * step;
  const west = Math.floor(b.getWest() / step) * step;
  const east = Math.ceil(b.getEast() / step) * step;
  const style = { color: "#475569", weight: 0.5, opacity: 0.45, interactive: false };
  for (let lng = west; lng <= east; lng += step) {
    L.polyline(
      [
        [b.getSouth(), lng],
        [b.getNorth(), lng],
      ],
      style
    ).addTo(graticuleGroup);
  }
  for (let lat = south; lat <= north; lat += step) {
    L.polyline(
      [
        [lat, b.getWest()],
        [lat, b.getEast()],
      ],
      style
    ).addTo(graticuleGroup);
  }
}

let basemapLayer = null;
function setBasemapOnline(enabled) {
  if (!map) return;
  if (basemapLayer) {
    map.removeLayer(basemapLayer);
    basemapLayer = null;
  }
  if (enabled) {
    basemapLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
      maxZoom: 19,
      pane: "basemap",
    });
    basemapLayer.addTo(map);
    if (graticuleGroup) map.removeLayer(graticuleGroup);
  } else {
    applyOfflineBasemap();
  }
}

function applyOfflineBasemap() {
  if (!map) return;
  if (basemapLayer) {
    map.removeLayer(basemapLayer);
    basemapLayer = null;
  }
  if (graticuleGroup && !map.hasLayer(graticuleGroup)) graticuleGroup.addTo(map);
  if (!map._gdGraticuleHandlers) {
    map._gdGraticuleHandlers = true;
    map.on("moveend", drawGraticule);
    map.on("zoomend", drawGraticule);
  }
  drawGraticule();
}

function colorFromValue(val) {
  const s = val == null ? "" : String(val);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (((h << 5) - h + s.charCodeAt(i)) | 0) >>> 0;
  const hue = h % 360;
  return { fill: `hsla(${hue}, 62%, 48%, 0.35)`, stroke: `hsl(${hue}, 70%, 42%)` };
}

function syncMapLayers(state) {
  if (!map) return;

  for (const id of Object.keys(layerMap)) {
    if (!state[id]) {
      map.removeLayer(layerMap[id]);
      delete layerMap[id];
    }
  }

  for (const [id, spec] of Object.entries(state)) {
    if (!spec || !spec.fc) continue;
    const layer = layerMap[id];
    if (layer) {
      map.removeLayer(layer);
      delete layerMap[id];
    }
    if (!spec.visible) continue;

    const gj = L.geoJSON(spec.fc, {
      style(feature) {
        const base = spec.styleColor || "#38bdf8";
        let stroke = base;
        let fill = base;
        let fillOp = 0.28;
        if (spec.choroplethKey && feature.properties) {
          const c = colorFromValue(feature.properties[spec.choroplethKey]);
          stroke = c.stroke;
          fill = c.fill;
          fillOp = 0.4;
        }
        return {
          color: stroke,
          weight: 1.5,
          opacity: 0.85,
          fillColor: fill,
          fillOpacity: fillOp,
        };
      },
      onEachFeature(feature, lyr) {
        lyr.on({
          mouseover(e) {
            const t = tooltipHtml(feature.properties);
            e.target.bindTooltip(t, { sticky: true, opacity: 0.95, className: "gd-tooltip" }).openTooltip();
            e.target.setStyle({
              weight: 3,
              fillOpacity: spec.choroplethKey ? 0.55 : 0.42,
            });
          },
          mouseout(e) {
            e.target.unbindTooltip();
            e.target.setStyle({
              weight: 1.5,
              fillOpacity: spec.choroplethKey ? 0.4 : 0.28,
            });
          },
          click(e) {
            L.DomEvent.stopPropagation(e);
            showSelected(e.target.feature);
          },
        });
      },
    });
    gj.addTo(map);
    layerMap[id] = gj;
  }
}

function tooltipHtml(props) {
  if (!props) return "<em>No properties</em>";
  const keys = Object.keys(props).filter((k) => !k.startsWith("_") || k === "_fid");
  const show = keys.slice(0, 12);
  const rows = show.map((k) => `<tr><td>${escapeHtml(k)}</td><td>${escapeHtml(String(props[k]))}</td></tr>`);
  keys.length > 12 && rows.push('<tr><td colspan="2">…</td></tr>');
  return `<table class="tip-table">${rows.join("")}</table>`;
}

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function showSelected(feature) {
  selectionLayer?.clearLayers();
  if (!feature || !feature.geometry) {
    onFeatureSelect?.(null);
    return;
  }
  selectionLayer?.addData(feature);
  const props = feature.properties || {};
  const id = props._fid != null ? String(props._fid) : feature.id != null ? String(feature.id) : "";
  onFeatureSelect?.({ id, properties: props, geometryType: feature.geometry?.type });
}

function setFeatureSelectHandler(fn) {
  onFeatureSelect = fn;
}

function zoomToGeoJSON(target) {
  if (!map || !target) return;
  const layer = L.geoJSON(
    target.type === "Feature" || target.type === "FeatureCollection"
      ? target
      : { type: "Feature", properties: {}, geometry: target }
  );
  const b = layer.getBounds();
  if (b.isValid()) map.fitBounds(b.pad(0.08));
}

function zoomToFeatureIds(featureIds, fc) {
  const set = new Set(featureIds);
  const found = [];
  for (const f of fc.features) {
    const id = f.properties?._fid != null ? String(f.properties._fid) : f.id != null ? String(f.id) : "";
    if (set.has(id)) found.push(f);
  }
  if (found.length) zoomToGeoJSON({ type: "FeatureCollection", features: found });
}

function getMap() {
  return map;
}

window.GeoDissolve = window.GeoDissolve || {};
GeoDissolve.map = {
  initMap,
  setBasemapOnline,
  syncMapLayers,
  setFeatureSelectHandler,
  zoomToGeoJSON,
  zoomToFeatureIds,
  getMap,
};
