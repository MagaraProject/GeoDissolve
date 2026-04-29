/**
 * GeoJSON I/O and dataset summaries.
 * Avoids deep cloning on load; assigns stable feature IDs in place.
 */

/** @param {unknown} coords */
function coordsLookProjected(coords) {
  if (!Array.isArray(coords)) return false;
  if (typeof coords[0] === "number") {
    const x = Math.abs(coords[0]);
    const y = Math.abs(coords[1] ?? 0);
    return x > 180 || y > 90;
  }
  for (const c of coords) {
    if (coordsLookProjected(c)) return true;
  }
  return false;
}

/** @param {GeoJSON.Geometry} g */
function geometryLooksProjected(g) {
  if (!g) return false;
  if (g.type === "Point") return coordsLookProjected(/** @type {number[]} */ (g.coordinates));
  if (g.type === "LineString" || g.type === "MultiPoint")
    return coordsLookProjected(/** @type {number[][]} */ (g.coordinates));
  if (g.type === "Polygon" || g.type === "MultiLineString")
    return coordsLookProjected(/** @type {number[][][]} */ (g.coordinates));
  if (g.type === "MultiPolygon") return coordsLookProjected(/** @type {number[][][][]} */ (g.coordinates));
  if (g.type === "GeometryCollection" && g.geometries) {
    return g.geometries.some(geometryLooksProjected);
  }
  return false;
}

/** @param {string} layerId */
function ensureFeatureIds(layerId, fc) {
  let next = 0;
  for (const f of fc.features) {
    f.properties = f.properties || {};
    if (f.id == null && f.properties._fid == null) {
      f.properties._fid = `${layerId}-f${next++}`;
    }
  }
}

/** @param {GeoJSON.Feature} f */
function getFeatureId(f) {
  if (f.id != null) return String(f.id);
  if (f.properties && f.properties._fid != null) return String(f.properties._fid);
  return "";
}

/**
 * Scan features in chunks to keep UI responsive.
 * @param {GeoJSON.Feature[]} features
 * @param {(i: number, f: GeoJSON.Feature) => void} fn
 * @param {{ chunk?: number, onYield?: () => void }} [opts]
 */
async function forEachFeatureChunked(features, fn, opts = {}) {
  const chunk = opts.chunk ?? 400;
  for (let i = 0; i < features.length; i++) {
    fn(i, features[i]);
    if (i > 0 && i % chunk === 0) {
      await new Promise((r) => setTimeout(r, 0));
      opts.onYield?.();
    }
  }
}

/** @returns {GeoJSON.BBox | null} */
function bboxExtend(bbox, x, y) {
  if (!bbox) return [x, y, x, y];
  return [Math.min(bbox[0], x), Math.min(bbox[1], y), Math.max(bbox[2], x), Math.max(bbox[3], y)];
}

/** @param {GeoJSON.Position} pos @param {GeoJSON.BBox | null} acc */
function bboxFromPosition(pos, acc) {
  const x = pos[0];
  const y = pos[1];
  return bboxExtend(acc, x, y);
}

/** @param {GeoJSON.Position[]} ring @param {GeoJSON.BBox | null} acc */
function bboxFromRing(ring, acc) {
  let b = acc;
  for (const p of ring) b = bboxFromPosition(p, b);
  return b;
}

/** @param {GeoJSON.Geometry} geom @param {GeoJSON.BBox | null} acc */
function bboxForGeometry(geom, acc = null) {
  if (!geom) return acc;
  const t = geom.type;
  if (t === "Point") return bboxFromPosition(geom.coordinates, acc);
  if (t === "MultiPoint" || t === "LineString") {
    let b = acc;
    for (const p of geom.coordinates) b = bboxFromPosition(p, b);
    return b;
  }
  if (t === "Polygon") {
    let b = acc;
    for (const ring of geom.coordinates) b = bboxFromRing(ring, b);
    return b;
  }
  if (t === "MultiLineString" || t === "MultiPolygon") {
    let b = acc;
    for (const item of geom.coordinates) {
      if (t === "MultiLineString") b = bboxFromPosition(/** @type {GeoJSON.Position} */ (item), b);
      else for (const ring of /** @type {GeoJSON.Position[][]} */ (item)) b = bboxFromRing(ring, b);
    }
    return b;
  }
  if (t === "GeometryCollection" && geom.geometries) {
    let b = acc;
    for (const g of geom.geometries) b = bboxForGeometry(g, b);
    return b;
  }
  return acc;
}

/**
 * @param {GeoJSON.FeatureCollection} fc
 * @param {{ signal?: AbortSignal, onProgress?: (n: number) => void }} [opts]
 */
async function summarizeFeatureCollection(fc, opts = {}) {
  const types = /** @type {Record<string, number>} */ ({});
  const keys = new Set();
  let bbox = /** @type {GeoJSON.BBox | null} */ (null);
  let projectedHint = false;
  const n = fc.features.length;
  let i = 0;

  await forEachFeatureChunked(
    fc.features,
    (_, f) => {
      const g = f.geometry;
      const t = g ? g.type : "null";
      types[t] = (types[t] || 0) + 1;
      if (g) {
        bbox = bboxForGeometry(g, bbox);
        if (!projectedHint) projectedHint = geometryLooksProjected(g);
      }
      if (f.properties && typeof f.properties === "object") {
        for (const k of Object.keys(f.properties)) keys.add(k);
      }
      i++;
      if (i % 500 === 0) opts.onProgress?.(i);
    },
    { chunk: 500 }
  );

  opts.onProgress?.(n);

  return {
    featureCount: n,
    geometryTypes: types,
    bbox,
    propertyKeys: [...keys].sort(),
    projectedHint,
  };
}

/**
 * @param {File} file
 * @param {{ onProgressText?: (s: string) => void, signal?: AbortSignal }} [opts]
 */
async function loadGeoJSONFromFile(file, opts = {}) {
  opts.onProgressText?.(`Reading ${file.name}…`);
  const text = await file.text();
  if (opts.signal?.aborted) throw new DOMException("Aborted", "AbortError");

  opts.onProgressText?.("Parsing JSON…");
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    throw new Error(`Invalid JSON: ${/** @type {Error} */ (e).message}`);
  }

  if (!parsed || typeof parsed !== "object") throw new Error("Root must be an object.");

  if (parsed.type === "FeatureCollection") {
    if (!Array.isArray(parsed.features)) throw new Error("FeatureCollection.features must be an array.");
    return /** @type {GeoJSON.FeatureCollection} */ (parsed);
  }

  if (parsed.type === "Feature") {
    return /** @type {GeoJSON.FeatureCollection} */ ({
      type: "FeatureCollection",
      features: [parsed],
    });
  }

  if (
    ["Point", "LineString", "Polygon", "MultiPoint", "MultiLineString", "MultiPolygon", "GeometryCollection"].includes(
      parsed.type
    )
  ) {
    return /** @type {GeoJSON.FeatureCollection} */ ({
      type: "FeatureCollection",
      features: [{ type: "Feature", properties: {}, geometry: parsed }],
    });
  }

  throw new Error(`Unsupported GeoJSON type: ${parsed.type || "unknown"}`);
}

/** @param {GeoJSON.GeoJSON} obj */
function serializeGeoJSON(obj) {
  return JSON.stringify(obj, null, 2);
}

/** Download string as file */
function downloadText(filename, text, mime = "application/geo+json") {
  const blob = new Blob([text], { type: mime + ";charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

window.GeoDissolve = window.GeoDissolve || {};
GeoDissolve.io = {
  geometryLooksProjected,
  ensureFeatureIds,
  getFeatureId,
  forEachFeatureChunked,
  bboxForGeometry,
  summarizeFeatureCollection,
  loadGeoJSONFromFile,
  serializeGeoJSON,
  downloadText,
};
