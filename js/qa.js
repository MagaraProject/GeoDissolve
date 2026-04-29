/**
 * Run QA checks (Web Worker when http://, else main-thread fallback).
 */

const QA_WORKER_URL = "js/workers/qa.worker.js";

function canUseQAWorker() {
  try {
    if (typeof Worker === "undefined") return false;
    if (window.location.protocol === "file:") return false;
    return true;
  } catch {
    return false;
  }
}

function runQAInWorker(payload, opts = {}) {
  const w = new Worker(QA_WORKER_URL, { type: "classic" });
  const jobId = `qa-${Date.now()}`;

  return new Promise((resolve, reject) => {
    w.onmessage = (ev) => {
      const m = ev.data;
      if (m.jobId !== jobId) return;
      if (m.type === "progress") opts.onProgress?.(m);
      if (m.type === "done") {
        w.terminate();
        resolve(m.result);
      }
      if (m.type === "error") {
        w.terminate();
        reject(new Error(m.error || "QA worker error"));
      }
    };
    w.onerror = (e) => {
      w.terminate();
      reject(e.error || e);
    };
    w.postMessage({ type: "run", jobId, ...payload });
  });
}

async function runQAMainThreadSimple(fc) {
  const jsts = window.jsts;
  const turf = window.turf;
  const issues = [];
  if (!jsts || !turf) {
    return {
      issues: [
        {
          type: "ERROR",
          featureIds: [],
          suggestion: "JSTS/Turf not loaded.",
        },
      ],
      meta: { featureCount: 0, note: "libraries missing" },
    };
  }
  const reader = new jsts.io.GeoJSONReader();
  const max = Math.min(fc.features.length, 500);
  if (fc.features.length > 500) {
    issues.push({
      type: "WARN",
      featureIds: [],
      suggestion: `Open via a local web server to run full QA in a worker. On file:// only first ${max} features checked lightly.`,
    });
  }

  for (let i = 0; i < max; i++) {
    const f = fc.features[i];
    const id = f.id != null ? String(f.id) : String((f.properties && f.properties._fid) || `idx-${i}`);
    const g = f.geometry;
    if (!g || (g.type !== "Polygon" && g.type !== "MultiPolygon")) continue;
    try {
      const jg = reader.read(g);
      let valid = true;
      try {
        const Op = jsts.operation?.valid?.IsValidOp;
        valid = Op ? new Op(jg).isValid() : typeof jg.isValid === "function" ? jg.isValid() : true;
      } catch {
        valid = false;
      }
      if (!valid) {
        issues.push({
          type: "INVALID",
          subtype: "topology",
          featureIds: [id],
          suggestion: "Repair geometry (file:// limited QA).",
        });
      }
      const area = turf.area(f);
      if (area > 0 && area < 200) {
        issues.push({
          type: "SLIVER",
          featureIds: [id],
          area_m2: area,
          suggestion: "Small feature — verify (partial check on file://).",
        });
      }
    } catch {
      /* skip */
    }
    if (i % 40 === 0) await new Promise((r) => setTimeout(r, 0));
  }

  return { issues, meta: { featureCount: fc.features.length, overlapPairsChecked: 0 } };
}

async function runQA(fc, options = {}) {
  if (canUseQAWorker()) {
    try {
      return await runQAInWorker(
        {
          features: fc.features,
          overlapRelMin: options.overlapRelMin,
          sliverAreaMax: options.sliverAreaMax,
          maxShells: options.maxShells,
          tinyIslandFrac: options.tinyIslandFrac,
          gapTolerancePct: options.gapTolerancePct,
          boundaryTolerancePct: options.boundaryTolerancePct,
          baseForGap: options.baseForGap,
          dissolvedForGap: options.dissolvedForGap,
        },
        { onProgress: options.onProgress }
      );
    } catch (e) {
      console.warn("QA worker failed, fallback:", e);
    }
  }
  return runQAMainThreadSimple(fc);
}

function qaReportToCSV(issues) {
  if (!issues.length) return "type,featureIds,notes\n";
  const keys = new Set();
  for (const row of issues) {
    for (const k of Object.keys(row)) {
      if (k !== "suggestion") keys.add(k);
    }
  }
  keys.add("suggestion");
  const cols = [...keys];
  const esc = (v) => {
    if (v == null) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    if (s.includes(",") || s.includes('"')) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [cols.join(",")];
  for (const row of issues) {
    lines.push(cols.map((c) => esc(row[c])).join(","));
  }
  return lines.join("\n");
}

window.GeoDissolve = window.GeoDissolve || {};
GeoDissolve.qa = {
  canUseQAWorker,
  runQAInWorker,
  runQAMainThreadSimple,
  runQA,
  qaReportToCSV,
};
