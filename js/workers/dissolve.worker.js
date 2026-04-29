/* eslint-disable no-restricted-globals */
/**
 * Web Worker: incremental polygon union per dissolve group (JSTS).
 * importScripts paths are relative to this worker script file.
 */
importScripts("../../libs/jsts.min.js", "../../libs/turf.min.js");

const jsts = self.jsts;
const turf = self.turf;

/**
 * @param {string} key
 * @param {string[]} groupProps
 * @param {{ properties?: object }[]} groupFeats
 * @param {string[]} sumFields
 * @param {GeoJSON.Geometry} gjGeom
 */
function buildAggregateProps(key, groupProps, groupFeats, sumFields, gjGeom) {
  /** @type {Record<string, unknown>} */
  const props = {
    _dissolveKey: key,
    _sourceFeatureCount: groupFeats.length,
  };
  const sample = groupFeats[0]?.properties || {};
  for (let i = 0; i < groupProps.length; i++) {
    const k = groupProps[i];
    props[k] = sample[k];
  }
  for (const sf of sumFields) {
    let s = 0;
    let n = 0;
    for (const f of groupFeats) {
      const v = Number((f.properties || {})[sf]);
      if (!Number.isNaN(v)) {
        s += v;
        n++;
      }
    }
    props[`sum_${sf}`] = s;
    props[`sumCount_${sf}`] = n;
  }
  try {
    const poly = /** @type {GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>} */ ({
      type: "Feature",
      properties: {},
      geometry: gjGeom,
    });
    props.area_m2 = turf.area(poly);
    const line = turf.polygonToLine(poly);
    props.perimeter_m = turf.length(/** @type {GeoJSON.Feature} */ (line), { units: "meters" });
  } catch {
    props.area_m2 = null;
    props.perimeter_m = null;
  }
  return props;
}

self.onmessage = function (ev) {
  const msg = ev.data;
  if (msg.type !== "run") return;

  const jobId = msg.jobId;
  const reader = new jsts.io.GeoJSONReader();
  const writer = new jsts.io.GeoJSONWriter();
  const groups = msg.groups;
  const groupProps = msg.groupProps;
  const sumFields = msg.sumFields || [];
  const includeNonPoly = !!msg.includeNonPoly;
  const cleanBuffer = msg.cleanBuffer !== false;
  const warnings = Array.isArray(msg.preambleWarnings) ? [...msg.preambleWarnings] : [];

  const groupKeys = Object.keys(groups);
  const totalGroups = groupKeys.length;
  const outFeatures = [];

  try {
    let inputFeatures = 0;
    for (const k of groupKeys) inputFeatures += groups[k].length;

    for (let idx = 0; idx < groupKeys.length; idx++) {
      const key = groupKeys[idx];
      const groupFeats = groups[key];
      let unionGeom = null;

      for (const f of groupFeats) {
        if (!f.geometry) continue;
        let g = reader.read(f.geometry);
        if (includeNonPoly && f.geometry.type !== "Polygon" && f.geometry.type !== "MultiPolygon") {
          try {
            g = g.buffer(0.00001);
          } catch {
            continue;
          }
        }
        try {
          unionGeom = unionGeom ? unionGeom.union(g) : g;
        } catch (e) {
          warnings.push(`Union failed in group "${key}": ${e && e.message ? e.message : String(e)}`);
        }
      }

      if (!unionGeom) {
        warnings.push(`Group "${key}" produced empty geometry.`);
      } else {
        if (cleanBuffer) {
          try {
            unionGeom = unionGeom.buffer(0);
          } catch (_) {
            /* keep */
          }
        }
        const gjGeom = writer.write(unionGeom);
        const props = buildAggregateProps(key, groupProps, groupFeats, sumFields, gjGeom);
        outFeatures.push({ type: "Feature", properties: props, geometry: gjGeom });
      }

      self.postMessage({
        jobId,
        type: "progress",
        progress: (idx + 1) / totalGroups,
        label: `Group ${idx + 1}/${totalGroups}`,
      });
    }

    self.postMessage({
      jobId,
      type: "done",
      result: {
        fc: { type: "FeatureCollection", features: outFeatures },
        stats: {
          groupCount: outFeatures.length,
          inputFeatures,
          warnings,
        },
      },
    });
  } catch (err) {
    self.postMessage({
      jobId,
      type: "error",
      error: err && err.message ? err.message : String(err),
    });
  }
};
