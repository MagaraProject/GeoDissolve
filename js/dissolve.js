/**
 * Client-side dissolve: JSTS incremental union, grouped by attribute(s).
 * Web Worker when http://; main thread on file://.
 */

function jstsGlobal() {
  const j = window.jsts;
  if (!j) throw new Error("JSTS not loaded.");
  return j;
}

function computeGroupKey(f, groupProps) {
  const p = f.properties || {};
  const parts = groupProps.filter(Boolean).map((k) => {
    const v = p[k];
    return v == null ? "" : String(v);
  });
  return parts.join("\u001f");
}

function collectDissolveInput(features, opts) {
  const groupProps = [opts.groupBy, opts.groupBy2].filter(Boolean);
  if (!opts.groupBy) throw new Error("Group-by attribute is required.");

  const sumFields = opts.sumFields || [];
  const includeNonPoly = !!opts.includeNonPoly;
  const groups = {};
  let excluded = 0;
  const warnings = [];

  for (const f of features) {
    const gt = f.geometry?.type;
    const poly =
      gt === "Polygon" ||
      gt === "MultiPolygon" ||
      (includeNonPoly && (gt === "LineString" || gt === "MultiLineString" || gt === "Point" || gt === "MultiPoint"));

    if (!poly) {
      excluded++;
      continue;
    }
    if (!includeNonPoly && gt !== "Polygon" && gt !== "MultiPolygon") {
      excluded++;
      continue;
    }

    const key = computeGroupKey(f, groupProps);
    if (!groups[key]) groups[key] = [];
    groups[key].push(f);
  }

  if (excluded > 0) {
    warnings.push(
      includeNonPoly
        ? `${excluded} feature(s) had unsupported geometry for buffering/union.`
        : `${excluded} non-polygon feature(s) excluded from dissolve. Enable "Include points/lines" to try buffer(0) union (experimental).`
    );
  }

  return { groups, groupProps, sumFields, warnings };
}

function buildAggregateProps(key, groupProps, groupFeats, sumFields, gjGeom, turf) {
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
    const poly = {
      type: "Feature",
      properties: {},
      geometry: gjGeom,
    };
    props.area_m2 = turf.area(poly);
    props.perimeter_m = turf.length(turf.polygonToLine(poly), { units: "meters" });
  } catch {
    props.area_m2 = null;
    props.perimeter_m = null;
  }
  return props;
}

async function dissolveOnMainThread(features, opts) {
  const jsts = jstsGlobal();
  const turf = window.turf;
  if (!turf) throw new Error("Turf not loaded.");

  const { groups, groupProps, sumFields, warnings } = collectDissolveInput(features, opts);
  const reader = new jsts.io.GeoJSONReader();
  const writer = new jsts.io.GeoJSONWriter();
  const groupKeys = Object.keys(groups);
  const totalGroups = groupKeys.length;
  const outFeatures = [];

  let done = 0;
  for (const key of groupKeys) {
    if (opts.signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const groupFeats = groups[key];
    let unionGeom = null;
    for (const f of groupFeats) {
      if (!f.geometry) continue;
      let g = reader.read(f.geometry);
      if (opts.includeNonPoly && f.geometry.type !== "Polygon" && f.geometry.type !== "MultiPolygon") {
        try {
          g = g.buffer(0.00001);
        } catch {
          continue;
        }
      }
      try {
        unionGeom = unionGeom ? unionGeom.union(g) : g;
      } catch (e) {
        warnings.push(`Union failed in group "${key}": ${e.message}`);
      }
    }

    if (!unionGeom) {
      warnings.push(`Group "${key}" produced empty geometry.`);
      done++;
      opts.onProgress?.(done / totalGroups, `Group ${done}/${totalGroups}`);
      await new Promise((r) => setTimeout(r, 0));
      continue;
    }

    if (opts.cleanBuffer !== false) {
      try {
        unionGeom = unionGeom.buffer(0);
      } catch (_) {
        /* keep */
      }
    }

    const gjGeom = writer.write(unionGeom);
    const props = buildAggregateProps(key, groupProps, groupFeats, sumFields, gjGeom, turf);
    outFeatures.push({ type: "Feature", properties: props, geometry: gjGeom });
    done++;
    opts.onProgress?.(done / totalGroups, `Group ${done}/${totalGroups}`);
    if (done % 3 === 0) await new Promise((r) => setTimeout(r, 0));
  }

  return {
    fc: { type: "FeatureCollection", features: outFeatures },
    stats: {
      groupCount: outFeatures.length,
      inputFeatures: features.length,
      warnings,
    },
  };
}

/** Worker path relative to the HTML document (works with file:// and http://). */
const DISSOLVE_WORKER_URL = "js/workers/dissolve.worker.js";

function dissolveViaWorker(features, opts, post) {
  const w = new Worker(DISSOLVE_WORKER_URL, { type: "classic" });
  const jobId = `dissolve-${Date.now()}`;

  return new Promise((resolve, reject) => {
    w.onmessage = (ev) => {
      const m = ev.data;
      if (m.jobId !== jobId) return;
      if (m.type === "progress") post(m);
      if (m.type === "done") {
        w.terminate();
        resolve(m.result);
      }
      if (m.type === "error") {
        w.terminate();
        reject(new Error(m.error || "Worker error"));
      }
    };
    w.onerror = (err) => {
      w.terminate();
      reject(err.error || err);
    };

    const { groups, groupProps, sumFields, warnings } = collectDissolveInput(features, opts);
    const payload = {
      type: "run",
      jobId,
      groups,
      groupProps,
      sumFields,
      includeNonPoly: !!opts.includeNonPoly,
      cleanBuffer: opts.cleanBuffer !== false,
      preambleWarnings: warnings,
    };
    w.postMessage(payload);
  });
}

async function runDissolve(features, opts) {
  const useWorker = opts.useWorker !== false && canUseWorkers();
  if (useWorker) {
    try {
      const result = await dissolveViaWorker(features, opts, (m) =>
        opts.onProgress?.(m.progress ?? 0, m.label || "")
      );
      return result;
    } catch (e) {
      console.warn("Worker dissolve failed; falling back to main thread:", e);
    }
  }
  return dissolveOnMainThread(features, opts);
}

function canUseWorkers() {
  try {
    if (typeof Worker === "undefined") return false;
    if (window.location.protocol === "file:") return false;
    return true;
  } catch {
    return false;
  }
}

window.GeoDissolve = window.GeoDissolve || {};
GeoDissolve.dissolve = {
  computeGroupKey,
  collectDissolveInput,
  dissolveOnMainThread,
  runDissolve,
  canUseWorkers,
};
