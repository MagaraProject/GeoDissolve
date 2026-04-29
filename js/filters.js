/**
 * Attribute filters for subset selection (entire layer vs filtered features).
 */

function normStr(v) {
  if (v == null) return "";
  return String(v);
}

function featureMatchesFilter(feature, spec) {
  const props = feature.properties || {};
  const raw = props[spec.property];
  const s = normStr(raw).toLowerCase();
  const needle = spec.value.trim().toLowerCase();

  switch (spec.op) {
    case "=":
      return normStr(raw) === spec.value;
    case "!=":
      return normStr(raw) !== spec.value;
    case "IN": {
      const set = new Set(spec.inValues.map((x) => String(x)));
      return set.has(normStr(raw));
    }
    case "contains":
      return needle.length === 0 || s.includes(needle);
    case "startsWith":
      return needle.length === 0 || s.startsWith(needle);
    default:
      return true;
  }
}

function filterFeatures(features, spec) {
  if (!spec.property) return features.slice();
  return features.filter((f) => featureMatchesFilter(f, spec));
}

function uniquePropertyValues(features, prop, cap = 800) {
  const set = new Set();
  for (const f of features) {
    const v = (f.properties || {})[prop];
    set.add(v == null ? "" : String(v));
    if (set.size >= cap) break;
  }
  return [...set].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function buildSubsetFeatureCollection(fc, spec) {
  const matched = filterFeatures(fc.features, spec);
  return {
    type: "FeatureCollection",
    features: matched.map((f) => ({
      ...f,
      properties: { ...(f.properties || {}) },
    })),
  };
}

function filterSummarizeIds(features) {
  return features.map((f) => GeoDissolve.io.getFeatureId(f)).filter(Boolean);
}

window.GeoDissolve = window.GeoDissolve || {};
GeoDissolve.filters = {
  featureMatchesFilter,
  filterFeatures,
  uniquePropertyValues,
  buildSubsetFeatureCollection,
  filterSummarizeIds,
};
