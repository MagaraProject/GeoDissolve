/**
 * GeoDissolve — applicazione (script classico, compatibile con file://)
 */
const io = GeoDissolve.io;
const filters = GeoDissolve.filters;
const dissolve = GeoDissolve.dissolve;
const qa = GeoDissolve.qa;
const mapApi = GeoDissolve.map;
const LayerManager = GeoDissolve.layers.LayerManager;

const SAMPLE_FALLBACK_GEOJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        postal_code: "00100",
        region_code: "LAZ",
        province_code: "RM",
        province_name: "Roma",
        pop: 100,
      },
      geometry: {
        type: "Polygon",
        coordinates: [[[12.45, 41.88], [12.52, 41.88], [12.52, 41.91], [12.45, 41.91], [12.45, 41.88]]],
      },
    },
    {
      type: "Feature",
      properties: {
        postal_code: "01100",
        region_code: "LAZ",
        province_code: "VT",
        province_name: "Viterbo",
        pop: 50,
      },
      geometry: {
        type: "Polygon",
        coordinates: [[[12.08, 42.38], [12.16, 42.38], [12.16, 42.42], [12.08, 42.42], [12.08, 42.38]]],
      },
    },
  ],
};

const layers = new LayerManager();

const filterSpec = { property: "", op: "=", value: "", inValues: [] };

let lastQA = null;

function el(id) {
  return document.getElementById(id);
}

function showDataMessage(html, kind = "warn") {
  const box = el("data-messages");
  box.innerHTML = html ? `<div class="message ${kind}">${html}</div>` : "";
}

function refreshWorkerBadge() {
  const w = dissolve.canUseWorkers();
  const q = qa.canUseQAWorker();
  el("worker-status-badge").textContent =
    window.location.protocol === "file:"
      ? "Workers: disattivati (file://) — dissolve/QA sul thread principale"
      : `Workers: dissolve ${w ? "on" : "off"}, QA ${q ? "on" : "off"}`;
  el("footer-note").textContent =
    window.location.protocol === "file:"
      ? "Con file locale l’app funziona senza server; per worker veloci usa: python -m http.server"
      : "Mappa web richiede rete; modalità offline = griglia.";
}

function populatePropSelects(keys) {
  for (const sel of [el("filter-prop"), el("dissolve-group1"), el("dissolve-group2")]) {
    const v = sel.value;
    sel.innerHTML = '<option value="">—</option>';
    for (const k of keys) {
      const o = document.createElement("option");
      o.value = k;
      o.textContent = k;
      sel.appendChild(o);
    }
    if ([...sel.options].some((o) => o.value === v)) sel.value = v;
  }
}

function getFilterSpecFromUI() {
  filterSpec.property = el("filter-prop").value;
  filterSpec.op = el("filter-op").value;
  filterSpec.value = el("filter-value").value;
  filterSpec.inValues = [];
  el("filter-in-list").querySelectorAll('input[type="checkbox"]:checked').forEach((c) => {
    filterSpec.inValues.push(c.value);
  });
  return filterSpec;
}

function refreshFilterInList() {
  const active = layers.getActive();
  const prop = el("filter-prop").value;
  const box = el("filter-in-list");
  box.innerHTML = "";
  if (!active || !prop) return;
  const vals = filters.uniquePropertyValues(active.fc.features, prop, 600);
  for (const v of vals) {
    const lab = document.createElement("label");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.value = v;
    lab.appendChild(cb);
    lab.appendChild(document.createTextNode(v === "" ? "(empty)" : v));
    box.appendChild(lab);
  }
}

function getScopedFeatureCollection() {
  const L = layers.getActive();
  if (!L) return { type: "FeatureCollection", features: [] };
  const scope = el("filter-scope").value;
  if (scope === "all") return L.fc;
  getFilterSpecFromUI();
  return filters.buildSubsetFeatureCollection(L.fc, filterSpec);
}

function updateFilterCount() {
  const L = layers.getActive();
  if (!L) {
    el("filter-count-display").textContent = "Filtrati: —";
    return;
  }
  getFilterSpecFromUI();
  const scope = el("filter-scope").value;
  const n =
    scope === "all" ? L.fc.features.length : filters.filterFeatures(L.fc.features, filterSpec).length;
  el("filter-count-display").textContent = `Filtrati: ${n} / ${L.fc.features.length}`;
}

function renderLayers() {
  const ul = el("layer-list");
  ul.innerHTML = "";
  const dissolveSel = el("dissolve-input-layer");
  const qaSel = el("qa-layer");
  const qaBase = el("qa-base-ref");
  const qaDiss = el("qa-diss-ref");
  dissolveSel.innerHTML = "";
  qaSel.innerHTML = "";
  qaBase.innerHTML = '<option value="">—</option>';
  qaDiss.innerHTML = '<option value="">—</option>';

  for (const L of layers.layers) {
    const li = document.createElement("li");
    li.className = "layer-item" + (L.id === layers.activeId ? " active" : "");

    const vis = document.createElement("input");
    vis.type = "checkbox";
    vis.checked = L.visible;
    vis.title = "Visibile";
    vis.addEventListener("change", () => layers.setVisible(L.id, vis.checked));

    const mid = document.createElement("div");
    mid.className = "name";
    mid.textContent = `${L.kind === "base" ? "●" : "○"} ${L.name}`;

    const actions = document.createElement("div");
    actions.className = "layer-actions";

    const bActive = document.createElement("button");
    bActive.type = "button";
    bActive.textContent = "Attivo";
    bActive.addEventListener("click", () => layers.setActive(L.id));

    const bFit = document.createElement("button");
    bFit.type = "button";
    bFit.textContent = "Zoom layer";
    bFit.addEventListener("click", () => mapApi.zoomToGeoJSON(L.fc));

    const bExport = document.createElement("button");
    bExport.type = "button";
    bExport.textContent = "Esporta";
    bExport.addEventListener("click", () =>
      io.downloadText(`${safeName(L.name)}.geojson`, io.serializeGeoJSON(L.fc))
    );

    const bDel = document.createElement("button");
    bDel.type = "button";
    bDel.textContent = "Elimina";
    bDel.className = "danger";
    bDel.addEventListener("click", () => {
      if (layers.layers.length <= 1) {
        showDataMessage("Non si può eliminare l’unico layer.", "error");
        return;
      }
      layers.remove(L.id);
    });

    actions.append(bActive, bFit, bExport, bDel);

    const renameRow = document.createElement("div");
    renameRow.style.gridColumn = "1 / -1";
    renameRow.className = "row";
    const inp = document.createElement("input");
    inp.type = "text";
    inp.value = L.name;
    inp.placeholder = "Rinomina layer";
    inp.addEventListener("change", () => layers.rename(L.id, inp.value));

    const choro = document.createElement("select");
    choro.innerHTML = '<option value="">(tinta unita)</option>';
    const keys = L.summary?.propertyKeys || [];
    for (const k of keys) {
      const o = document.createElement("option");
      o.value = k;
      o.textContent = k;
      choro.appendChild(o);
    }
    choro.value = L.choroplethKey || "";
    choro.addEventListener("change", () => layers.setChoroplethKey(L.id, choro.value || null));

    renameRow.appendChild(inp);
    renameRow.appendChild(choro);
    li.appendChild(vis);
    li.appendChild(mid);
    li.appendChild(actions);
    li.appendChild(renameRow);
    ul.appendChild(li);

    const opt = document.createElement("option");
    opt.value = L.id;
    opt.textContent = L.name;
    dissolveSel.appendChild(opt.cloneNode(true));
    qaSel.appendChild(opt.cloneNode(true));
    qaBase.appendChild(opt.cloneNode(true));
    qaDiss.appendChild(opt.cloneNode(true));
  }

  dissolveSel.value = layers.activeId || "";
  qaSel.value = layers.activeId || "";
}

function safeName(s) {
  return s.replace(/[^a-z0-9-_]+/gi, "_").slice(0, 80) || "layer";
}

function pushMapState() {
  const st = {};
  for (const L of layers.layers) {
    st[L.id] = {
      fc: L.fc,
      visible: L.visible,
      styleColor: L.styleColor,
      name: L.name,
      choroplethKey: L.choroplethKey,
    };
  }
  mapApi.syncMapLayers(st);
  requestAnimationFrame(() => {
    mapApi.getMap()?.invalidateSize(true);
  });
}

function refreshSummaryFromActive() {
  const L = layers.getActive();
  if (!L || !L.summary) {
    el("sum-count").textContent = "—";
    el("sum-types").textContent = "—";
    el("sum-bbox").textContent = "—";
    el("sum-keys").textContent = "—";
    return;
  }
  const s = L.summary;
  el("sum-count").textContent = String(s.featureCount);
  el("sum-types").textContent = Object.entries(s.geometryTypes)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");
  el("sum-bbox").textContent = s.bbox ? s.bbox.map((x) => x.toFixed(4)).join(", ") : "—";
  el("sum-keys").textContent = s.propertyKeys.join(", ") || "(nessuna)";
  populatePropSelects(s.propertyKeys);
  refreshFilterInList();
}

layers.subscribe(() => {
  renderLayers();
  pushMapState();
  refreshSummaryFromActive();
  updateFilterCount();
});

el("filter-op").addEventListener("change", () => {
  const op = el("filter-op").value;
  el("filter-value-wrap").hidden = op === "IN";
  el("filter-in-wrap").hidden = op !== "IN";
  updateFilterCount();
});

el("filter-prop").addEventListener("change", () => {
  refreshFilterInList();
  updateFilterCount();
});

["filter-scope", "filter-value"].forEach((id) => el(id).addEventListener("input", updateFilterCount));
el("filter-in-list").addEventListener("change", updateFilterCount);

el("file-geojson").addEventListener("change", async (ev) => {
  const input = ev.target;
  const f = input.files?.[0];
  if (!f) return;
  showDataMessage(`Lettura di «${f.name}»…`, "ok");
  try {
    const fc = await io.loadGeoJSONFromFile(f, {
      onProgressText: (t) => showDataMessage(t, "ok"),
    });
    let warned = false;
    for (const feat of fc.features) {
      if (feat.geometry && io.geometryLooksProjected(feat.geometry)) {
        warned = true;
        break;
      }
    }
    showDataMessage("Elaborazione riepilogo…", "ok");
    await layers.addBaseLayer(fc, { name: f.name.replace(/\.[^.]+$/, "") || "Importato" });
    if (warned) {
      showDataMessage(
        "Coordinate fuori intervallo lon/lat (forse proiettate?). L’app assume WGS84.",
        "warn"
      );
    } else {
      showDataMessage(`Caricato: <strong>${fc.features.length}</strong> feature. Usa «Zoom layer» o «Fit attivo» sulla mappa.`, "ok");
    }
    mapApi.zoomToGeoJSON(fc);
    input.value = "";
  } catch (e) {
    showDataMessage(`Errore: ${e.message}`, "error");
    console.error(e);
  }
});

el("btn-sample").addEventListener("click", async () => {
  showDataMessage("");
  try {
    const res = await fetch("data/sample.geojson");
    if (!res.ok) throw new Error(String(res.status));
    const fc = await res.json();
    await layers.addBaseLayer(fc, { name: "Sample postal areas" });
    mapApi.zoomToGeoJSON(fc);
    showDataMessage("Caricato sample da file.", "ok");
  } catch {
    await layers.addBaseLayer(SAMPLE_FALLBACK_GEOJSON, { name: "Sample (incorporato)" });
    mapApi.zoomToGeoJSON(SAMPLE_FALLBACK_GEOJSON);
    showDataMessage("Caricato mini-sample incorporato (per il file completo usa un server locale).", "ok");
  }
});

el("btn-save-subset").addEventListener("click", async () => {
  const L = layers.getActive();
  if (!L) return;
  const fc = getScopedFeatureCollection();
  if (!fc.features.length) {
    showDataMessage("Nessuna feature nel sottoinsieme.", "error");
    return;
  }
  const name = window.prompt("Nome nuovo layer:", "Subset");
  if (!name) return;
  await layers.addDerivedLayer(fc, { name });
  mapApi.zoomToGeoJSON(fc);
  showDataMessage(`Salvate ${fc.features.length} feature come «${name}».`, "ok");
});

el("dissolve-input-layer").addEventListener("change", (e) => {
  const id = e.target.value;
  if (id) layers.setActive(id);
});

el("btn-dissolve").addEventListener("click", async () => {
  const lid = el("dissolve-input-layer").value || layers.activeId;
  const rec = layers.getById(lid);
  if (!rec) return;

  const g1 = el("dissolve-group1").value;
  if (!g1) {
    el("dissolve-result-msg").textContent = "Scegli un attributo per il raggruppamento.";
    return;
  }
  const g2 = el("dissolve-group2").value;
  const sums = el("dissolve-sums").value
    .split(/[,;\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const useFiltered = el("filter-scope").value === "filter" && el("filter-prop").value;

  let feats = rec.fc.features;
  if (useFiltered) {
    getFilterSpecFromUI();
    feats = filters.filterFeatures(rec.fc.features, filterSpec);
  }
  if (!feats.length) {
    el("dissolve-result-msg").textContent = "Nessuna feature in ingresso.";
    return;
  }

  el("dissolve-result-msg").textContent = "";
  el("dissolve-progress").classList.add("visible");
  el("dissolve-progress-bar").style.width = "0%";
  el("dissolve-progress-label").textContent = "Dissolve…";

  try {
    const out = await dissolve.runDissolve(feats, {
      groupBy: g1,
      groupBy2: g2 || undefined,
      sumFields: sums,
      includeNonPoly: el("dissolve-include-lines").checked,
      onProgress: (p, label) => {
        el("dissolve-progress-bar").style.width = `${Math.round(p * 100)}%`;
        el("dissolve-progress-label").textContent = label;
      },
    });

    el("dissolve-progress-bar").style.width = "100%";
    const w = out.stats.warnings || [];
    const gname = [g1, g2].filter(Boolean).join(" + ");
    const derivedName = `Dissolved: ${gname} (${feats.length} in)`;
    await layers.addDerivedLayer(out.fc, { name: derivedName });
    mapApi.zoomToGeoJSON(out.fc);
    el("dissolve-result-msg").textContent = `Fatto: ${out.stats.groupCount} gruppi. ${w.length ? w.slice(0, 2).join(" | ") : ""}`;
    if (w.length) console.warn("Dissolve warnings", w);
  } catch (e) {
    el("dissolve-result-msg").textContent = e.message;
  } finally {
    el("dissolve-progress").classList.remove("visible");
  }
});

el("btn-run-qa").addEventListener("click", async () => {
  const lid = el("qa-layer").value;
  const rec = layers.getById(lid);
  if (!rec) return;

  el("qa-tbody").innerHTML = "";
  el("qa-progress").classList.add("visible");
  el("qa-progress-bar").style.width = "0%";
  el("qa-progress-label").textContent = "QA…";

  const gapOn = el("qa-gap-check").checked;
  let baseForGap = null;
  let dissolvedForGap = null;
  if (gapOn) {
    const bid = el("qa-base-ref").value;
    const did = el("qa-diss-ref").value;
    if (bid && did && bid !== did) {
      baseForGap = layers.getById(bid)?.fc || null;
      dissolvedForGap = layers.getById(did)?.fc || null;
    }
  }

  try {
    const result = await qa.runQA(rec.fc, {
      overlapRelMin: Number(el("qa-overlap-rel").value),
      sliverAreaMax: Number(el("qa-sliver-area").value),
      gapTolerancePct: Number(el("qa-gap-pct").value),
      boundaryTolerancePct: Number(el("qa-bound-pct").value),
      baseForGap: baseForGap || undefined,
      dissolvedForGap: dissolvedForGap || undefined,
      onProgress: (m) => {
        if (m.progress != null) {
          el("qa-progress-bar").style.width = `${Math.round(m.progress * 100)}%`;
          el("qa-progress-label").textContent = m.phase || "…";
        }
      },
    });

    lastQA = { issues: result.issues, layerId: lid };
    renderQATable(result.issues, rec.fc);
    el("qa-progress-bar").style.width = "100%";
    el("qa-progress-label").textContent = `${result.issues.length} righe`;
  } catch (e) {
    el("qa-progress-label").textContent = e.message;
  } finally {
    setTimeout(() => el("qa-progress").classList.remove("visible"), 400);
  }
});

function renderQATable(issues, fc) {
  const tb = el("qa-tbody");
  tb.innerHTML = "";
  for (const iss of issues) {
    const tr = document.createElement("tr");
    const ids = (iss.featureIds || []).join(", ");
    const metric = metricSummary(iss);
    tr.innerHTML = `<td>${escapeHtml(String(iss.type))}</td><td>${escapeHtml(ids)}</td><td>${escapeHtml(metric)}</td><td>${escapeHtml(String(iss.suggestion || ""))}</td><td class="cell-actions"></td>`;
    const cell = tr.querySelector(".cell-actions");
    if (cell && Array.isArray(iss.featureIds) && iss.featureIds.length) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = "Zoom";
      b.addEventListener("click", () => mapApi.zoomToFeatureIds(iss.featureIds, fc));
      cell.appendChild(b);
    }
    tb.appendChild(tr);
  }
}

function metricSummary(iss) {
  const parts = [];
  if (iss.area_m2 != null) parts.push(`area ${Number(iss.area_m2).toFixed(2)} m²`);
  if (iss.overlap_m2 != null) parts.push(`overlap ${Number(iss.overlap_m2).toFixed(2)} m²`);
  if (iss.diff_pct != null) parts.push(`Δ ${Number(iss.diff_pct).toFixed(3)}%`);
  if (iss.symmetric_diff_pct_of_base != null)
    parts.push(`symΔ ${Number(iss.symmetric_diff_pct_of_base).toFixed(3)}%`);
  if (iss.compactness != null) parts.push(`compact ${Number(iss.compactness).toFixed(4)}`);
  return parts.join("; ") || (iss.detail ? String(iss.detail) : "—");
}

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

el("btn-export-qa-json").addEventListener("click", () => {
  if (!lastQA) return;
  io.downloadText(
    "qa-report.json",
    JSON.stringify({ layerId: lastQA.layerId, issues: lastQA.issues }, null, 2),
    "application/json"
  );
});

el("btn-export-qa-csv").addEventListener("click", () => {
  if (!lastQA) return;
  io.downloadText("qa-report.csv", qa.qaReportToCSV(lastQA.issues), "text/csv");
});

let basemapOn = false;
el("btn-basemap").addEventListener("click", () => {
  basemapOn = !basemapOn;
  mapApi.setBasemapOnline(basemapOn);
  el("btn-basemap").textContent = basemapOn ? "Mappa offline" : "Mappa web";
});

el("btn-fit-all").addEventListener("click", () => {
  const Lr = layers.layers;
  if (!Lr.length) return;
  let b = null;
  for (const L of Lr) {
    for (const f of L.fc.features) {
      if (f.geometry) b = io.bboxForGeometry(f.geometry, b);
    }
  }
  if (b) mapApi.getMap()?.fitBounds([[b[1], b[0]], [b[3], b[2]]], { padding: [24, 24] });
});

el("btn-fit-active").addEventListener("click", () => {
  const L = layers.getActive();
  if (L) mapApi.zoomToGeoJSON(L.fc);
});

mapApi.setFeatureSelectHandler((detail) => {
  const box = el("selection-detail");
  if (!detail) {
    box.textContent = "Clicca un poligono…";
    return;
  }
  const props = detail.properties || {};
  const keys = Object.keys(props).slice(0, 14);
  box.innerHTML =
    `<strong>${escapeHtml(detail.geometryType || "")}</strong><br/>` +
    keys.map((k) => `${escapeHtml(k)}: ${escapeHtml(String(props[k]))}`).join("<br/>");
});

document.querySelectorAll(".panel-header").forEach((h) => {
  h.addEventListener("click", () => h.closest(".panel")?.classList.toggle("collapsed"));
});

mapApi.initMap("map", "libs/");
refreshWorkerBadge();
showDataMessage(
  "«Carica GeoJSON…» sceglie il file. Dopo il caricamento i dati compaiono a sinistra e sulla mappa; usa «Zoom layer» se non vedi nulla.",
  "ok"
);
