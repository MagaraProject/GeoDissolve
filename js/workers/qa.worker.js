/* eslint-disable no-restricted-globals */
/**
 * Web Worker: geometry QA — validity, overlaps (spatial index), slivers, multipart,
 * optional gap/boundary vs paired union of base vs dissolved layers.
 */
importScripts("../../libs/jsts.min.js", "../../libs/turf.min.js");

const jsts = self.jsts;
const turf = self.turf;

/** @param {GeoJSON.Feature} f @param {ReturnType<typeof turf.bbox>} bbox */
function featBBox(f) {
  try {
    return turf.bbox(f);
  } catch {
    return [0, 0, 0, 0];
  }
}

/** @param {{ minX:number,minY:number,maxX:number,maxY:number }} a */
function boxesOverlap(a, b) {
  return !(a.maxX < b.minX || b.maxX < a.minX || a.maxY < b.minY || b.maxY < a.minY);
}

/**
 * @param {{ i: number, minX: number, maxX: number, minY: number, maxY: number }[]} boxes
 * @returns {[number, number][]} index pairs i<j
 */
function sweepOverlapPairs(boxes) {
  const sorted = [...boxes].sort((a, b) => a.minX - b.minX || a.i - b.i);
  /** @type {[number, number][]} */
  const pairs = [];
  for (let i = 0; i < sorted.length; i++) {
    const bi = sorted[i];
    for (let j = i + 1; j < sorted.length; j++) {
      const bj = sorted[j];
      if (bj.minX > bi.maxX) break;
      if (boxesOverlap(bi, bj)) pairs.push([bi.i, bj.i]);
    }
  }
  return pairs;
}

/** @param {GeoJSON.Geometry} g */
function isPolyType(g) {
  return g && (g.type === "Polygon" || g.type === "MultiPolygon");
}

/**
 * @param {jsts.geom.Geometry} g
 */
function jstsIsValid(g) {
  try {
    if (typeof g.isValid === "function") return g.isValid();
    const Op = jsts.operation && jsts.operation.valid && jsts.operation.valid.IsValidOp;
    if (Op) return new Op(g).isValid();
  } catch {
    return false;
  }
  return true;
}

/** @param {GeoJSON.Feature} f */
function polyPartCount(gj) {
  if (!gj) return 0;
  if (gj.type === "Polygon") return 1 + (gj.coordinates.length - 1);
  if (gj.type === "MultiPolygon") return gj.coordinates.reduce((n, p) => n + 1 + Math.max(0, p.length - 1), 0);
  return 0;
}

/** @param {GeoJSON.Feature} f */
function multipartShellCount(gj) {
  if (!gj) return 0;
  if (gj.type === "Polygon") return 1;
  if (gj.type === "MultiPolygon") return gj.coordinates.length;
  return 0;
}

/**
 * Incremental union GeoJSON polygon features to JSTS geometry.
 * @param {GeoJSON.Feature[]} feats
 */
function unionFeatureCollectionJSTS(feats) {
  const reader = new jsts.io.GeoJSONReader();
  let acc = null;
  for (const f of feats) {
    if (!isPolyType(f.geometry)) continue;
    try {
      const g = reader.read(f.geometry);
      acc = acc ? acc.union(g) : g;
    } catch {
      /* skip */
    }
  }
  return acc;
}

self.onmessage = function (ev) {
  const msg = ev.data;
  if (msg.type !== "run") return;
  const jobId = msg.jobId;

  /** @type {object[]} */
  const issues = [];
  const reader = new jsts.io.GeoJSONReader();
  const writer = new jsts.io.GeoJSONWriter();

  try {
    const features = msg.features || [];
    const overlapRelMin = typeof msg.overlapRelMin === "number" ? msg.overlapRelMin : 0.001;
    const sliverAreaMax = typeof msg.sliverAreaMax === "number" ? msg.sliverAreaMax : 500;
    const maxShells = typeof msg.maxShells === "number" ? msg.maxShells : 25;
    const tinyIslandFrac =
      typeof msg.tinyIslandFrac === "number" ? msg.tinyIslandFrac : 0.002;
    const gapTolerancePct = typeof msg.gapTolerancePct === "number" ? msg.gapTolerancePct : 0.1;
    const boundaryTolerancePct =
      typeof msg.boundaryTolerancePct === "number" ? msg.boundaryTolerancePct : 0.15;

    const n = features.length;
    let processed = 0;

    /** BBox entries only for polygon/MultiPolygon features (featIdx = original index). */
    /** @type {{ i: number, minX: number, maxX: number, minY: number, maxY: number }[]} */
    const polyBoxes = [];

    for (let i = 0; i < n; i++) {
      const f = features[i];
      const id = f.id != null ? String(f.id) : (f.properties && String(f.properties._fid)) || `idx-${i}`;
      const g = f.geometry;

      if (!g) {
        issues.push({
          type: "INVALID",
          subtype: "empty_geometry",
          featureIds: [id],
          suggestion: "Remove or repair the feature; geometry is null.",
        });
        processed++;
        continue;
      }

      if (g.type === "Point" || g.type === "MultiPoint" || g.type === "LineString" || g.type === "MultiLineString") {
        issues.push({
          type: "UNSUPPORTED",
          subtype: g.type,
          featureIds: [id],
          suggestion: "Points/lines are skipped for polygon QA; filter or convert if needed.",
        });
        processed++;
        continue;
      }

      if (!isPolyType(g)) {
        issues.push({
          type: "INVALID",
          subtype: "unknown_type",
          featureIds: [id],
          suggestion: "Inspect geometry type.",
        });
        processed++;
        continue;
      }

      let jGeom;
      try {
        jGeom = reader.read(g);
      } catch (e) {
        issues.push({
          type: "INVALID",
          subtype: "parse_error",
          featureIds: [id],
          detail: e && e.message ? e.message : String(e),
          suggestion: "Fix geometry encoding / rings per GeoJSON spec.",
        });
        processed++;
        continue;
      }

      const bb = featBBox(f);
      polyBoxes.push({ i, minX: bb[0], minY: bb[1], maxX: bb[2], maxY: bb[3] });

      try {
        const area = turf.area(f);
        if (!area || area < 1e-12) {
          issues.push({
            type: "INVALID",
            subtype: "zero_area",
            featureIds: [id],
            area_m2: area,
            suggestion: "Remove degenerate polygon or repair vertices.",
          });
        }

        if (!jstsIsValid(jGeom)) {
          issues.push({
            type: "INVALID",
            subtype: "topology",
            featureIds: [id],
            area_m2: area,
            suggestion: "Repair in GIS (fix self-intersections, ring orientation) or buffer(0) cautiously.",
          });
        }

        if (area > 0 && area <= sliverAreaMax) {
          let perim = 0;
          try {
            const line = turf.polygonToLine(f);
            perim = turf.length(line, { units: "meters" });
          } catch {
            perim = 1;
          }
          const compact = (4 * Math.PI * area) / (perim * perim + 1e-9);
          if (compact < 0.04) {
            issues.push({
              type: "SLIVER",
              featureIds: [id],
              area_m2: area,
              compactness: compact,
              suggestion: "Inspect source topology; increase minimum area filter or merge with neighbors.",
            });
          }
        }

        const shells = multipartShellCount(g);
        if (shells > maxShells) {
          issues.push({
            type: "MULTIPART",
            subtype: "high_shell_count",
            featureIds: [id],
            shellCount: shells,
            suggestion: "Review digitization; explode or simplify multipart.",
          });
        }

        if (g.type === "MultiPolygon" && area > 0) {
          for (let si = 0; si < g.coordinates.length; si++) {
            const shell = g.coordinates[si];
            const partFeat = { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: shell } };
            const pa = turf.area(partFeat);
            if (pa / area < tinyIslandFrac && pa > 0) {
              issues.push({
                type: "MULTIPART",
                subtype: "tiny_island",
                featureIds: [id],
                partIndex: si,
                part_area_m2: pa,
                suggestion: "Tiny island part — may be artifact; consider removing or snapping.",
              });
            }
          }
        }

        if (polyPartCount(g) > 12) {
          issues.push({
            type: "MULTIPART",
            subtype: "many_rings",
            featureIds: [id],
            ringCount: polyPartCount(g),
            suggestion: "Complex holes — validate ring orientation and nesting.",
          });
        }
      } catch (e) {
        issues.push({
          type: "INVALID",
          subtype: "measure_error",
          featureIds: [id],
          detail: e && e.message ? e.message : String(e),
          suggestion: "Inspect geometry.",
        });
      }

      processed++;
      if (processed % 80 === 0 || processed === n) {
        self.postMessage({ jobId, type: "progress", phase: "validity", progress: processed / n });
      }
    }

    /* ----- pairwise overlaps (polygons only) ----- */
    const pairs = sweepOverlapPairs(polyBoxes);
    let pairDone = 0;
    for (const [ia, ib] of pairs) {
      const fa = features[ia];
      const fb = features[ib];
      if (!isPolyType(fa.geometry) || !isPolyType(fb.geometry)) continue;
      try {
        const ga = reader.read(fa.geometry);
        const gb = reader.read(fb.geometry);
        if (!ga.intersects(gb)) continue;
        const inter = ga.intersection(gb);
        const iArea = inter.getArea();
        if (iArea <= 0) continue;
        const aArea = turf.area(fa);
        const bArea = turf.area(fb);
        const rel = iArea / Math.min(aArea, bArea);
        if (rel > overlapRelMin) {
          const ida = fa.id != null ? String(fa.id) : String((fa.properties && fa.properties._fid) || `idx-${ia}`);
          const idb = fb.id != null ? String(fb.id) : String((fb.properties && fb.properties._fid) || `idx-${ib}`);
          issues.push({
            type: "OVERLAP",
            featureIds: [ida, idb],
            overlap_m2: iArea,
            relative_to_smaller: rel,
            suggestion: "Fix source polygons or adjust dissolve; overlaps break clean administrative seams.",
          });
        }
      } catch {
        /* skip pair */
      }
      pairDone++;
      if (pairDone % 200 === 0) {
        self.postMessage({
          jobId,
          type: "progress",
          phase: "overlap",
          progress: pairs.length ? pairDone / pairs.length : 1,
        });
      }
    }

    /* ----- gap / boundary: union base vs dissolved ----- */
    if (msg.baseForGap && msg.dissolvedForGap) {
      const baseFeats = msg.baseForGap.features || [];
      const dissFeats = msg.dissolvedForGap.features || [];

      self.postMessage({ jobId, type: "progress", phase: "gap_union", progress: 0.1 });
      const uBase = unionFeatureCollectionJSTS(baseFeats);
      self.postMessage({ jobId, type: "progress", phase: "gap_union", progress: 0.45 });
      const uDiss = unionFeatureCollectionJSTS(dissFeats);
      self.postMessage({ jobId, type: "progress", phase: "gap_union", progress: 0.7 });

      if (uBase && uDiss) {
        try {
          const gjB = writer.write(uBase);
          const gjD = writer.write(uDiss);
          const fB = /** @type {GeoJSON.Feature} */ ({ type: "Feature", properties: {}, geometry: gjB });
          const fD = /** @type {GeoJSON.Feature} */ ({ type: "Feature", properties: {}, geometry: gjD });
          const areaB = turf.area(fB);
          const areaD = turf.area(fD);
          const gapPct = areaB > 0 ? (Math.abs(areaB - areaD) / areaB) * 100 : 0;
          if (gapPct > gapTolerancePct) {
            issues.push({
              type: "GAP",
              featureIds: [],
              base_area_m2: areaB,
              dissolved_area_m2: areaD,
              diff_pct: gapPct,
              suggestion: "Area mismatch after dissolve — check grouping keys, gaps between parcels, or invalid rings.",
            });
          }

          const sym = uBase.symDifference(uDiss);
          const gjSym = writer.write(sym);
          const fSym = /** @type {GeoJSON.Feature} */ ({ type: "Feature", properties: {}, geometry: gjSym });
          const areaSym = turf.area(fSym);
          const boundPct = areaB > 0 ? (areaSym / areaB) * 100 : 0;
          if (boundPct > boundaryTolerancePct) {
            issues.push({
              type: "BOUNDARY_MISMATCH",
              featureIds: [],
              symmetric_diff_m2: areaSym,
              symmetric_diff_pct_of_base: boundPct,
              suggestion: "Union boundary differs — internal edges may remain or topology errors; run validity fixes.",
            });
          }
        } catch (e) {
          issues.push({
            type: "GAP",
            subtype: "union_compare_failed",
            detail: e && e.message ? e.message : String(e),
            suggestion: "Retry after repairing invalid geometries.",
          });
        }
      }
    }

    self.postMessage({
      jobId,
      type: "done",
      result: { issues, meta: { featureCount: n, overlapPairsChecked: pairs.length } },
    });
  } catch (err) {
    self.postMessage({
      jobId,
      type: "error",
      error: err && err.message ? err.message : String(err),
    });
  }
};
