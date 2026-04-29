/* =========================================================
   GeoDissolve — bundle completo (file:// safe, no ES modules)
   ========================================================= */
(function () {
  "use strict";

  /* ================================================================
     I18N — translations & language switcher
     ================================================================ */
  var LANGS = {
    en: {
      page_title:        "GeoDissolve — Dissolve, Filters & QA",
      subtitle:          "Dissolve, filters, geometry QA — fully offline, no server required",
      panel_data:        "Data / Layers",
      panel_filter:      "Filter / Subset",
      panel_dissolve:    "Dissolve / Aggregation",
      panel_qa:          "Geometry QA",
      btn_load:          "Load GeoJSON\u2026",
      btn_sample:        "Sample",
      sum_features:      "Features",
      sum_geom_types:    "Geometry types",
      sum_props:         "Properties",
      lbl_layers:        "Layers",
      lbl_scope:         "Scope",
      scope_all:         "Entire active layer",
      scope_filter:      "Apply attribute filter",
      lbl_attribute:     "Attribute",
      attr_placeholder:  "— load data —",
      lbl_operator:      "Operator",
      op_contains:       "contains",
      op_starts:         "starts with",
      lbl_value:         "Value",
      val_placeholder:   "text value",
      lbl_in_values:     "Values (from layer)",
      filter_count_init: "Filtered: —",
      filter_count_tpl:  "Filtered: {n} / {total}",
      btn_save_subset:   "Save subset as new layer",
      lbl_input_layer:   "Input layer",
      lbl_group1:        "Group by (1st level)",
      lbl_group2:        "Group by (2nd level, optional)",
      lbl_sum_fields:    "Sum numeric fields (comma-separated names)",
      sum_placeholder:   "e.g. pop, area_km2",
      btn_dissolve:      "\u25b6 Run Dissolve",
      lbl_qa_layer:      "Layer to analyze",
      lbl_overlap_thresh:"Overlap threshold (fraction of smaller area)",
      lbl_sliver_area:   "Max sliver area (m\u00b2)",
      btn_run_qa:        "\u25b6 Run QA",
      btn_export_json:   "Export JSON",
      btn_export_csv:    "Export CSV",
      qa_th_type:        "Type",
      qa_th_ids:         "Feature IDs",
      qa_th_metric:      "Metric",
      qa_th_suggestion:  "Suggestion",
      btn_basemap:       "Web basemap (OSM)",
      btn_basemap_off:   "Offline map",
      btn_fit_all:       "Fit all",
      btn_fit_active:    "Fit active",
      selection_title:   "Selection",
      selection_hint:    "Click a polygon for details\u2026",
      ap_rows_per_page:  "Rows/page",
      ap_prev:           "\u25c4 Prev",
      ap_next:           "Next \u25ba",
      ap_close:          "\u2715 Close",
      ap_close_title:    "Close panel",
      ap_unsaved:        "\u26a0 Unsaved changes",
      ap_save:           "\ud83d\udcbe Save to layer",
      ap_discard:        "\u21a9 Discard all",
      ap_add_col:        "+ Col",
      ap_resize_title:   "Drag to resize",
      ap_title_default:  "Attributes",
      ap_title_tpl:      "\u2699 Attributes: {name}   ({rows} features, {cols} columns)",
      ap_page_info:      "Page {p} of {total}  (rows {start}\u2013{end})",
      lyr_active:        "Active",
      lyr_zoom:          "Zoom",
      lyr_attrs:         "\u2699 Attributes",
      lyr_export:        "Export",
      lyr_delete:        "Delete",
      lyr_rename_ph:     "Rename\u2026",
      lyr_solid:         "(solid color)",
      lyr_color_by:      "Color by",
      msg_ready:         "Ready. Click <strong>Load GeoJSON\u2026</strong> to choose your file.",
      msg_reading:       "Reading \u00ab{name}\u00bb\u2026",
      msg_parsing:       "Processing {n} features\u2026",
      msg_loaded:        "\u2713 Loaded: <strong>{n} features</strong> in layer \u00ab{name}\u00bb.",
      msg_projected:     "\u26a0 Coordinates outside lon/lat range (projected?). Check CRS.",
      msg_sample_ok:     "\u2713 Sample loaded: {n} features.",
      msg_subset_saved:  "\u2713 Subset \u00ab{name}\u00bb saved ({n} features).",
      msg_no_layer:      "Select a layer.",
      msg_no_groupby:    "Select a group-by attribute.",
      msg_no_features:   "No input features.",
      msg_dissolve_done: "\u2713 {n} groups created. {warn}",
      msg_qa_done:       "{n} issues found",
      msg_cant_del_last: "Cannot delete the only layer.",
      msg_attr_saved:    "\u2713 Attribute changes saved to layer \u00ab{name}\u00bb.",
      msg_no_subset:     "No features in current subset.",
      confirm_del_layer: "Delete layer \"{name}\"?",
      confirm_del_col:   "Remove column \"{key}\" from all features?",
      confirm_discard:   "Discard all unsaved changes?",
      prompt_subset:     "New layer name:",
      prompt_col_name:   "New column name:",
      prompt_col_default:"Default value (empty = leave blank):",
      err_col_exists:    "Column \"{name}\" already exists.",
      err_col_new_dup:   "Column \"{name}\" is already in the new-columns list.",
      err_col_reserved:  "Names starting with \"_\" are reserved.",
      worker_file:       "Mode: file:// (main thread)",
      worker_server:     "Mode: HTTP server",
      footer_file:       "file:// — all operations run in the browser. Use python -m http.server for workers.",
      footer_server:     "Server mode — workers available for dissolve/QA on large datasets.",
      qa_zoom:           "Zoom",
      dissolve_progress_start: "Running dissolve\u2026",
      dissolve_group_tpl:"Group {done}/{total}",
      dissolve_complete: "Complete",
      qa_progress_start: "Running QA\u2026",
      qa_validity_tpl:   "Validity {done}/{total}",
      qa_overlap_tpl:    "Overlap {done}/{total}",
      dissolve_no_grp:   "Select a group-by attribute.",
      dissolve_no_feats: "No input features.",
      col_add_btn:       "+ Col",
    },
    it: {
      page_title:        "GeoDissolve — Dissolve, Filtri & QA",
      subtitle:          "Dissolve, filtri, QA geometrica — tutto offline, nessun server richiesto",
      panel_data:        "Dati / Layer",
      panel_filter:      "Filtro / Sottoinsieme",
      panel_dissolve:    "Dissolve / Aggregazione",
      panel_qa:          "Geometry QA",
      btn_load:          "Carica GeoJSON\u2026",
      btn_sample:        "Esempio",
      sum_features:      "Feature",
      sum_geom_types:    "Tipi geometria",
      sum_props:         "Propriet\u00e0",
      lbl_layers:        "Layer",
      lbl_scope:         "Ambito",
      scope_all:         "Intero layer attivo",
      scope_filter:      "Applica filtro attributo",
      lbl_attribute:     "Attributo",
      attr_placeholder:  "— carica dati —",
      lbl_operator:      "Operatore",
      op_contains:       "contiene",
      op_starts:         "inizia con",
      lbl_value:         "Valore",
      val_placeholder:   "valore testo",
      lbl_in_values:     "Valori (dal layer)",
      filter_count_init: "Filtrati: —",
      filter_count_tpl:  "Filtrati: {n} / {total}",
      btn_save_subset:   "Salva sottoinsieme come nuovo layer",
      lbl_input_layer:   "Layer di input",
      lbl_group1:        "Raggruppa per (1\u00b0 livello)",
      lbl_group2:        "Raggruppa per (2\u00b0 livello, opzionale)",
      lbl_sum_fields:    "Somma campi numerici (nomi separati da virgola)",
      sum_placeholder:   "es. pop, area_km2",
      btn_dissolve:      "\u25b6 Esegui Dissolve",
      lbl_qa_layer:      "Layer da analizzare",
      lbl_overlap_thresh:"Soglia overlap (frazione area minore)",
      lbl_sliver_area:   "Area max sliver (m\u00b2)",
      btn_run_qa:        "\u25b6 Esegui QA",
      btn_export_json:   "Esporta JSON",
      btn_export_csv:    "Esporta CSV",
      qa_th_type:        "Tipo",
      qa_th_ids:         "ID feature",
      qa_th_metric:      "Metrica",
      qa_th_suggestion:  "Suggerimento",
      btn_basemap:       "Mappa web (OSM)",
      btn_basemap_off:   "Mappa offline",
      btn_fit_all:       "Fit tutti",
      btn_fit_active:    "Fit attivo",
      selection_title:   "Selezione",
      selection_hint:    "Clicca un poligono per i dettagli\u2026",
      ap_rows_per_page:  "Righe/pagina",
      ap_prev:           "\u25c4 Prec",
      ap_next:           "Succ \u25ba",
      ap_close:          "\u2715 Chiudi",
      ap_close_title:    "Chiudi pannello",
      ap_unsaved:        "\u26a0 Modifiche non salvate",
      ap_save:           "\ud83d\udcbe Salva nel layer",
      ap_discard:        "\u21a9 Annulla tutto",
      ap_add_col:        "+ Col",
      ap_resize_title:   "Trascina per ridimensionare",
      ap_title_default:  "Attributi",
      ap_title_tpl:      "\u2699 Attributi: {name}   ({rows} feature, {cols} colonne)",
      ap_page_info:      "Pagina {p} di {total}  (righe {start}\u2013{end})",
      lyr_active:        "Attivo",
      lyr_zoom:          "Zoom",
      lyr_attrs:         "\u2699 Attributi",
      lyr_export:        "Esporta",
      lyr_delete:        "Elimina",
      lyr_rename_ph:     "Rinomina\u2026",
      lyr_solid:         "(tinta unita)",
      lyr_color_by:      "Colore per",
      msg_ready:         "Pronto. Clicca <strong>Carica GeoJSON\u2026</strong> per scegliere il tuo file.",
      msg_reading:       "Lettura di \u00ab{name}\u00bb\u2026",
      msg_parsing:       "Elaborazione {n} feature\u2026",
      msg_loaded:        "\u2713 Caricato: <strong>{n} feature</strong> nel layer \u00ab{name}\u00bb.",
      msg_projected:     "\u26a0 Coordinate fuori range lon/lat (proiettate?). Verifica CRS.",
      msg_sample_ok:     "\u2713 Sample caricato: {n} feature.",
      msg_subset_saved:  "\u2713 Sottoinsieme \u00ab{name}\u00bb salvato ({n} feature).",
      msg_no_layer:      "Seleziona un layer.",
      msg_no_groupby:    "Scegli un attributo group-by.",
      msg_no_features:   "Nessuna feature in ingresso.",
      msg_dissolve_done: "\u2713 {n} gruppi creati. {warn}",
      msg_qa_done:       "{n} problemi trovati",
      msg_cant_del_last: "Non puoi eliminare l'unico layer.",
      msg_attr_saved:    "\u2713 Modifiche agli attributi salvate nel layer \u00ab{name}\u00bb.",
      msg_no_subset:     "Nessuna feature nel sottoinsieme.",
      confirm_del_layer: "Eliminare il layer \"{name}\"?",
      confirm_del_col:   "Rimuovere la colonna \"{key}\" da tutte le feature?",
      confirm_discard:   "Annullare tutte le modifiche non salvate?",
      prompt_subset:     "Nome del nuovo layer:",
      prompt_col_name:   "Nome della nuova colonna:",
      prompt_col_default:"Valore predefinito (vuoto = lascia vuoto):",
      err_col_exists:    "La colonna \"{name}\" esiste gi\u00e0.",
      err_col_new_dup:   "La colonna \"{name}\" \u00e8 gi\u00e0 nella lista delle nuove colonne.",
      err_col_reserved:  "I nomi che iniziano con \"_\" sono riservati.",
      worker_file:       "Modalit\u00e0 file:// (main thread)",
      worker_server:     "Modalit\u00e0 server HTTP",
      footer_file:       "file:// — tutte le operazioni girano nel browser. Usa python -m http.server per i worker.",
      footer_server:     "Modalit\u00e0 server — worker disponibili per dissolve/QA su grandi dataset.",
      qa_zoom:           "Zoom",
      dissolve_progress_start: "Dissolve in corso\u2026",
      dissolve_group_tpl:"Gruppo {done}/{total}",
      dissolve_complete: "Completato",
      qa_progress_start: "QA in corso\u2026",
      qa_validity_tpl:   "Validit\u00e0 {done}/{total}",
      qa_overlap_tpl:    "Overlap {done}/{total}",
      dissolve_no_grp:   "Scegli un attributo group-by.",
      dissolve_no_feats: "Nessuna feature in ingresso.",
      col_add_btn:       "+ Col",
    },
  };

  /* Current language — default ENG */
  var _lang = "en";

  /* t(key, vars) — get translated string, optionally replacing {placeholders} */
  function t(key, vars) {
    var dict = LANGS[_lang] || LANGS.en;
    var s = dict[key] !== undefined ? dict[key] : (LANGS.en[key] !== undefined ? LANGS.en[key] : key);
    if (vars) {
      for (var k in vars) {
        s = s.split("{" + k + "}").join(String(vars[k]));
      }
    }
    return s;
  }

  /* Apply translations to all [data-i18n] elements in the document */
  function applyLang(code) {
    _lang = code || "en";
    document.documentElement.lang = _lang;

    /* Update <title> */
    var titleEl = document.querySelector("[data-i18n-title]");
    if (titleEl) {
      var tKey = titleEl.getAttribute("data-i18n-title");
      if (titleEl.tagName === "TITLE") {
        titleEl.textContent = t(tKey);
      } else {
        titleEl.title = t(tKey);
      }
    }

    /* data-i18n → textContent */
    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      var key = nodes[i].getAttribute("data-i18n");
      nodes[i].textContent = t(key);
    }

    /* data-i18n-placeholder → placeholder */
    var pnodes = document.querySelectorAll("[data-i18n-placeholder]");
    for (var i = 0; i < pnodes.length; i++) {
      var pkey = pnodes[i].getAttribute("data-i18n-placeholder");
      pnodes[i].placeholder = t(pkey);
    }

    /* data-i18n-title on non-<title> elements */
    var tnodes = document.querySelectorAll("[data-i18n-title]:not(title)");
    for (var i = 0; i < tnodes.length; i++) {
      var ttkey = tnodes[i].getAttribute("data-i18n-title");
      tnodes[i].title = t(ttkey);
    }

    /* Update lang switcher UI */
    var label = document.getElementById("lang-label");
    if (label) label.textContent = _lang === "it" ? "ITA" : "ENG";

    var opts = document.querySelectorAll(".lang-option");
    for (var i = 0; i < opts.length; i++) {
      opts[i].classList.toggle("active", opts[i].dataset.lang === _lang);
    }

    /* Update dynamic badge/footer if already initialised */
    var badge = document.getElementById("worker-status-badge");
    if (badge && badge.textContent !== "\u2026") {
      badge.textContent = window.location.protocol === "file:" ? t("worker_file") : t("worker_server");
    }
    var fn = document.getElementById("footer-note");
    if (fn && fn.textContent) {
      fn.textContent = window.location.protocol === "file:" ? t("footer_file") : t("footer_server");
    }
    /* selection hint */
    var sd = document.getElementById("selection-detail");
    if (sd && (sd.textContent === "Click a polygon for details\u2026" ||
               sd.textContent === "Clicca un poligono per i dettagli\u2026")) {
      sd.textContent = t("selection_hint");
    }

    /* Save preference */
    try { localStorage.setItem("gd_lang", _lang); } catch(_) {}
  }

  /* Wire language switcher (called after DOM ready) */
  function initLangSwitcher() {
    var btn = document.getElementById("lang-btn");
    var dropdown = document.getElementById("lang-dropdown");
    if (!btn || !dropdown) return;

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = dropdown.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
    });

    document.addEventListener("click", function () {
      dropdown.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    });

    dropdown.addEventListener("click", function (e) { e.stopPropagation(); });

    var options = dropdown.querySelectorAll(".lang-option");
    for (var i = 0; i < options.length; i++) {
      (function (opt) {
        opt.addEventListener("click", function () {
          applyLang(opt.dataset.lang);
          dropdown.classList.remove("open");
          btn.setAttribute("aria-expanded", "false");
        });
      })(options[i]);
    }

    /* Restore saved preference; default = en */
    var saved = "en";
    try { saved = localStorage.getItem("gd_lang") || "en"; } catch(_) {}
    if (!LANGS[saved]) saved = "en";
    applyLang(saved);
  }

  /* ---- diagnostica visibile ---- */
  function fatalUI(msg) {
    var box = document.getElementById("data-messages");
    if (box) box.innerHTML = '<div class="message error"><strong>Errore critico:</strong> ' + msg + "</div>";
    console.error("GeoDissolve FATAL:", msg);
  }
  function showMsg(html, kind) {
    var box = document.getElementById("data-messages");
    if (!box) return;
    box.innerHTML = html ? '<div class="message ' + (kind || "ok") + '">' + html + "</div>" : "";
  }

  /* ---- utility DOM ---- */
  function el(id) {
    return document.getElementById(id);
  }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function safeName(s) {
    return String(s || "layer")
      .replace(/[^a-z0-9\-_]/gi, "_")
      .slice(0, 80);
  }

  /* ================================================================
     IO
     ================================================================ */
  function readFileAsText(file, cb) {
    /* FileReader works on file:// in all modern browsers */
    var fr = new FileReader();
    fr.onload = function (e) {
      cb(null, e.target.result);
    };
    fr.onerror = function () {
      cb(new Error("Lettura file fallita"));
    };
    fr.readAsText(file, "utf-8");
  }

  function parseGeoJSON(text) {
    var parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      throw new Error("JSON non valido: " + e.message);
    }
    if (!parsed || typeof parsed !== "object") throw new Error("Il file non è un oggetto JSON.");
    if (parsed.type === "FeatureCollection") {
      if (!Array.isArray(parsed.features)) throw new Error("FeatureCollection.features deve essere un array.");
      return parsed;
    }
    if (parsed.type === "Feature") return { type: "FeatureCollection", features: [parsed] };
    var geomTypes = ["Point","LineString","Polygon","MultiPoint","MultiLineString","MultiPolygon","GeometryCollection"];
    if (geomTypes.indexOf(parsed.type) >= 0) {
      return { type: "FeatureCollection", features: [{ type: "Feature", properties: {}, geometry: parsed }] };
    }
    throw new Error("Tipo GeoJSON non supportato: " + (parsed.type || "sconosciuto"));
  }

  var _fidCounter = 0;
  function ensureFeatureIds(fc) {
    for (var i = 0; i < fc.features.length; i++) {
      var f = fc.features[i];
      if (!f.properties) f.properties = {};
      if (f.id == null && f.properties._fid == null) {
        f.properties._fid = "f" + (++_fidCounter);
      }
    }
  }

  function getFeatureId(f) {
    if (f.id != null) return String(f.id);
    if (f.properties && f.properties._fid != null) return String(f.properties._fid);
    return "";
  }

  function bboxForFC(fc) {
    var b = null;
    for (var i = 0; i < fc.features.length; i++) {
      var g = fc.features[i].geometry;
      if (g) b = bboxGrow(g, b);
    }
    return b;
  }

  function bboxGrow(geom, b) {
    if (!geom) return b;
    var coords = flatCoords(geom);
    for (var i = 0; i < coords.length; i++) {
      var x = coords[i][0], y = coords[i][1];
      if (b === null) b = [x, y, x, y];
      else {
        if (x < b[0]) b[0] = x;
        if (y < b[1]) b[1] = y;
        if (x > b[2]) b[2] = x;
        if (y > b[3]) b[3] = y;
      }
    }
    return b;
  }

  function flatCoords(geom) {
    var out = [];
    function walk(c) {
      if (!Array.isArray(c)) return;
      if (typeof c[0] === "number") { out.push(c); return; }
      for (var i = 0; i < c.length; i++) walk(c[i]);
    }
    if (geom.coordinates) walk(geom.coordinates);
    if (geom.geometries) for (var i = 0; i < geom.geometries.length; i++) {
      var sub = flatCoords(geom.geometries[i]);
      for (var j = 0; j < sub.length; j++) out.push(sub[j]);
    }
    return out;
  }

  function projectedHint(fc) {
    for (var i = 0; i < Math.min(fc.features.length, 10); i++) {
      var g = fc.features[i].geometry;
      if (!g) continue;
      var coords = flatCoords(g);
      for (var j = 0; j < coords.length; j++) {
        if (Math.abs(coords[j][0]) > 181 || Math.abs(coords[j][1]) > 91) return true;
      }
    }
    return false;
  }

  function summarize(fc) {
    var types = {}, keys = {}, bbox = null;
    for (var i = 0; i < fc.features.length; i++) {
      var f = fc.features[i];
      var t = f.geometry ? f.geometry.type : "null";
      types[t] = (types[t] || 0) + 1;
      if (f.geometry) bbox = bboxGrow(f.geometry, bbox);
      if (f.properties) {
        var ks = Object.keys(f.properties);
        for (var j = 0; j < ks.length; j++) keys[ks[j]] = 1;
      }
    }
    return {
      featureCount: fc.features.length,
      geometryTypes: types,
      bbox: bbox,
      propertyKeys: Object.keys(keys).sort(),
    };
  }

  function downloadText(filename, text, mime) {
    mime = mime || "application/geo+json";
    var blob = new Blob([text], { type: mime + ";charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    }, 100);
  }

  /* ================================================================
     FILTERS
     ================================================================ */
  function featureMatchesFilter(f, spec) {
    var raw = (f.properties || {})[spec.property];
    var s = (raw == null ? "" : String(raw)).toLowerCase();
    var needle = (spec.value || "").trim().toLowerCase();
    switch (spec.op) {
      case "=": return String(raw == null ? "" : raw) === spec.value;
      case "!=": return String(raw == null ? "" : raw) !== spec.value;
      case "IN":
        var set = {};
        for (var i = 0; i < spec.inValues.length; i++) set[spec.inValues[i]] = 1;
        return !!set[raw == null ? "" : String(raw)];
      case "contains": return needle === "" || s.indexOf(needle) >= 0;
      case "startsWith": return needle === "" || s.indexOf(needle) === 0;
      default: return true;
    }
  }

  function filterFeatures(features, spec) {
    if (!spec.property) return features.slice();
    var out = [];
    for (var i = 0; i < features.length; i++) {
      if (featureMatchesFilter(features[i], spec)) out.push(features[i]);
    }
    return out;
  }

  function uniqueValues(features, prop, cap) {
    cap = cap || 600;
    var set = {}, arr = [];
    for (var i = 0; i < features.length; i++) {
      var v = (features[i].properties || {})[prop];
      var k = v == null ? "" : String(v);
      if (!set[k]) { set[k] = 1; arr.push(k); }
      if (arr.length >= cap) break;
    }
    return arr.sort(function (a, b) {
      return a.localeCompare(b, undefined, { numeric: true });
    });
  }

  /* ================================================================
     LAYERS
     ================================================================ */
  var PALETTE = ["#38bdf8","#a78bfa","#f472b6","#4ade80","#fbbf24","#fb7185","#2dd4bf","#f97316"];
  var _layerIdCounter = 0;

  function LayerManager() {
    this.layers = [];
    this.activeId = null;
    this._listeners = [];
  }
  LayerManager.prototype.subscribe = function (fn) {
    this._listeners.push(fn);
  };
  LayerManager.prototype._emit = function () {
    for (var i = 0; i < this._listeners.length; i++) this._listeners[i](this.layers, this.activeId);
  };
  LayerManager.prototype.addLayer = function (fc, name, kind) {
    var id = "layer-" + (++_layerIdCounter);
    ensureFeatureIds(fc);
    var rec = {
      id: id,
      name: name || "Layer",
      kind: kind || "base",
      fc: fc,
      visible: true,
      styleColor: PALETTE[(this.layers.length) % PALETTE.length],
      choroplethKey: null,
      summary: summarize(fc),
    };
    this.layers.push(rec);
    this.activeId = id;
    this._emit();
    return rec;
  };
  LayerManager.prototype.getActive = function () {
    for (var i = 0; i < this.layers.length; i++) {
      if (this.layers[i].id === this.activeId) return this.layers[i];
    }
    return null;
  };
  LayerManager.prototype.getById = function (id) {
    for (var i = 0; i < this.layers.length; i++) {
      if (this.layers[i].id === id) return this.layers[i];
    }
    return null;
  };
  LayerManager.prototype.setActive = function (id) {
    if (this.getById(id)) { this.activeId = id; this._emit(); }
  };
  LayerManager.prototype.setVisible = function (id, v) {
    var L = this.getById(id); if (L) { L.visible = v; this._emit(); }
  };
  LayerManager.prototype.rename = function (id, name) {
    var L = this.getById(id); if (L && name.trim()) { L.name = name.trim(); this._emit(); }
  };
  LayerManager.prototype.remove = function (id) {
    var idx = -1;
    for (var i = 0; i < this.layers.length; i++) if (this.layers[i].id === id) { idx = i; break; }
    if (idx < 0) return;
    var wasActive = this.layers[idx].id === this.activeId;
    this.layers.splice(idx, 1);
    if (wasActive) this.activeId = this.layers.length ? this.layers[0].id : null;
    this._emit();
  };
  LayerManager.prototype.setChoropleth = function (id, key) {
    var L = this.getById(id); if (L) { L.choroplethKey = key || null; this._emit(); }
  };

  /* ================================================================
     DISSOLVE (main thread — works on file://)
     ================================================================ */
  function computeGroupKey(f, groupProps) {
    var p = f.properties || {};
    var parts = [];
    for (var i = 0; i < groupProps.length; i++) {
      var v = p[groupProps[i]];
      parts.push(v == null ? "" : String(v));
    }
    return parts.join("\u001f");
  }

  function dissolveMainThread(features, opts, onProgress, onDone, onError) {
    var jsts = window.jsts;
    var turf = window.turf;
    if (!jsts) return onError("JSTS non caricato. Controlla libs/jsts.min.js.");
    if (!turf) return onError("Turf non caricato. Controlla libs/turf.min.js.");

    var groupBy = opts.groupBy;
    var groupBy2 = opts.groupBy2 || "";
    var sumFields = opts.sumFields || [];
    var groupProps = [groupBy, groupBy2].filter(Boolean);

    var groups = {}, order = [];
    var excluded = 0, warnings = [];

    for (var i = 0; i < features.length; i++) {
      var f = features[i];
      var gt = f.geometry && f.geometry.type;
      if (gt !== "Polygon" && gt !== "MultiPolygon") { excluded++; continue; }
      var key = computeGroupKey(f, groupProps);
      if (!groups[key]) { groups[key] = []; order.push(key); }
      groups[key].push(f);
    }
    if (excluded > 0) warnings.push(excluded + " feature non-poligono escluse.");

    var reader = new jsts.io.GeoJSONReader();
    var writer = new jsts.io.GeoJSONWriter();
    var total = order.length;
    var outFeatures = [];
    var idx = 0;

    function step() {
      if (idx >= total) {
        onProgress(1, "Completato");
        onDone({
          fc: { type: "FeatureCollection", features: outFeatures },
          stats: { groupCount: outFeatures.length, inputFeatures: features.length, warnings: warnings },
        });
        return;
      }
      var key = order[idx];
      var groupFeats = groups[key];
      var unionGeom = null;
      for (var j = 0; j < groupFeats.length; j++) {
        var gf = groupFeats[j];
        if (!gf.geometry) continue;
        try {
          var g = reader.read(gf.geometry);
          unionGeom = unionGeom ? unionGeom.union(g) : g;
        } catch (e) {
          warnings.push('Union fallita nel gruppo "' + key + '": ' + e.message);
        }
      }
      if (!unionGeom) {
        warnings.push('Gruppo "' + key + '" ha geometria vuota.');
        idx++;
        onProgress(idx / total, "Gruppo " + idx + "/" + total);
        setTimeout(step, 0);
        return;
      }
      try { unionGeom = unionGeom.buffer(0); } catch (_) {}

      var gjGeom = writer.write(unionGeom);
      var props = { _dissolveKey: key, _sourceFeatureCount: groupFeats.length };
      var sample = groupFeats[0].properties || {};
      for (var pi = 0; pi < groupProps.length; pi++) props[groupProps[pi]] = sample[groupProps[pi]];
      for (var si = 0; si < sumFields.length; si++) {
        var sf = sumFields[si], sum = 0, cnt = 0;
        for (var fi = 0; fi < groupFeats.length; fi++) {
          var v = Number((groupFeats[fi].properties || {})[sf]);
          if (!isNaN(v)) { sum += v; cnt++; }
        }
        props["sum_" + sf] = sum; props["sumCount_" + sf] = cnt;
      }
      try {
        var pf = { type: "Feature", properties: {}, geometry: gjGeom };
        props.area_m2 = turf.area(pf);
        props.perimeter_m = turf.length(turf.polygonToLine(pf), { units: "meters" });
      } catch (_) {}
      outFeatures.push({ type: "Feature", properties: props, geometry: gjGeom });

      idx++;
      onProgress(idx / total, "Gruppo " + idx + "/" + total);
      setTimeout(step, 0);
    }
    setTimeout(step, 0);
  }

  /* ================================================================
     QA (main thread)
     ================================================================ */
  function runQAMainThread(fc, opts, onProgress, onDone, onError) {
    var jsts = window.jsts;
    var turf = window.turf;
    if (!jsts || !turf) return onError("JSTS/Turf non caricati.");

    var issues = [];
    var features = fc.features;
    var n = features.length;
    var reader = new jsts.io.GeoJSONReader();
    var sliverAreaMax = opts.sliverAreaMax || 500;
    var overlapRelMin = opts.overlapRelMin || 0.001;

    var i = 0;
    /* validity + slivers */
    function stepValidity() {
      if (i >= n) {
        onProgress(1, "Validità OK, check overlap…");
        doOverlaps();
        return;
      }
      var f = features[i];
      var id = getFeatureId(f) || ("idx-" + i);
      var g = f.geometry;
      if (!g || (g.type !== "Polygon" && g.type !== "MultiPolygon")) { i++; setTimeout(stepValidity, 0); return; }
      try {
        var jg = reader.read(g);
        var valid = (typeof jg.isValid === "function") ? jg.isValid() : true;
        if (!valid) issues.push({ type: "INVALID", subtype: "topology", featureIds: [id],
          suggestion: "Ripara la geometria (auto-intersezioni, orientamento anelli)." });
        var area = turf.area(f);
        if (!area || area < 1e-10) {
          issues.push({ type: "INVALID", subtype: "zero_area", featureIds: [id], area_m2: area,
            suggestion: "Rimuovi il poligono degenere." });
        } else if (area <= sliverAreaMax) {
          var perim = 1;
          try { perim = turf.length(turf.polygonToLine(f), { units: "meters" }); } catch (_) {}
          var compact = (4 * Math.PI * area) / (perim * perim + 1e-9);
          if (compact < 0.04) issues.push({ type: "SLIVER", featureIds: [id], area_m2: area,
            compactness: compact, suggestion: "Possibile sliver; ispeziona la topologia sorgente." });
        }
        if (g.type === "MultiPolygon" && g.coordinates.length > 25)
          issues.push({ type: "MULTIPART", subtype: "many_shells", featureIds: [id],
            shellCount: g.coordinates.length, suggestion: "Numero di shell elevato." });
      } catch (e) {
        issues.push({ type: "INVALID", subtype: "parse_error", featureIds: [id],
          detail: e.message, suggestion: "Verifica la codifica della geometria." });
      }
      i++;
      if (i % 60 === 0) onProgress(i / (n * 2), "Validità " + i + "/" + n);
      setTimeout(stepValidity, 0);
    }

    /* bbox sweep for overlaps */
    function doOverlaps() {
      var boxes = [];
      for (var j = 0; j < features.length; j++) {
        var f = features[j];
        if (!f.geometry || (f.geometry.type !== "Polygon" && f.geometry.type !== "MultiPolygon")) continue;
        try {
          var bb = turf.bbox(f);
          boxes.push({ i: j, minX: bb[0], minY: bb[1], maxX: bb[2], maxY: bb[3] });
        } catch (_) {}
      }
      boxes.sort(function (a, b) { return a.minX - b.minX; });
      var pairs = [];
      for (var a = 0; a < boxes.length; a++) {
        for (var b = a + 1; b < boxes.length; b++) {
          if (boxes[b].minX > boxes[a].maxX) break;
          if (boxes[a].maxY >= boxes[b].minY && boxes[b].maxY >= boxes[a].minY) {
            pairs.push([boxes[a].i, boxes[b].i]);
          }
        }
      }
      var pi = 0;
      function stepPair() {
        if (pi >= pairs.length) {
          onProgress(1, "Completato");
          onDone({ issues: issues, meta: { featureCount: n, overlapPairsChecked: pairs.length } });
          return;
        }
        var ia = pairs[pi][0], ib = pairs[pi][1];
        var fa = features[ia], fb = features[ib];
        try {
          var ga = reader.read(fa.geometry), gb = reader.read(fb.geometry);
          if (ga.intersects(gb)) {
            var inter = ga.intersection(gb);
            var iArea = inter.getArea();
            if (iArea > 0) {
              var aArea = turf.area(fa), bArea = turf.area(fb);
              var rel = iArea / Math.min(aArea, bArea);
              if (rel > overlapRelMin) {
                issues.push({ type: "OVERLAP",
                  featureIds: [getFeatureId(fa) || "idx-" + ia, getFeatureId(fb) || "idx-" + ib],
                  overlap_m2: iArea, relative_to_smaller: rel,
                  suggestion: "Sovrapposizione rilevata — verifica la sorgente." });
              }
            }
          }
        } catch (_) {}
        pi++;
        if (pi % 100 === 0) onProgress(0.5 + pi / (pairs.length * 2), "Overlap " + pi + "/" + pairs.length);
        setTimeout(stepPair, 0);
      }
      stepPair();
    }
    stepValidity();
  }

  function qaReportToCSV(issues) {
    if (!issues.length) return "type,featureIds,notes\n";
    var keys = ["type", "subtype", "featureIds", "area_m2", "overlap_m2", "diff_pct", "compactness", "suggestion"];
    var lines = [keys.join(",")];
    for (var i = 0; i < issues.length; i++) {
      var row = issues[i];
      lines.push(keys.map(function (k) {
        var v = row[k];
        if (v == null) return "";
        var s = Array.isArray(v) ? v.join("|") : String(v);
        if (s.indexOf(",") >= 0 || s.indexOf('"') >= 0) return '"' + s.replace(/"/g, '""') + '"';
        return s;
      }).join(","));
    }
    return lines.join("\n");
  }

  /* ================================================================
     MAP
     ================================================================ */
  var _map = null, _graticuleGrp = null, _layerMap = {}, _selLayer = null;
  var _onFeatureSelect = null;
  var _basemapLayer = null;

  function initMap(containerId) {
    if (_map) return;
    try {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "libs/images/marker-icon.png",
        iconRetinaUrl: "libs/images/marker-icon-2x.png",
        shadowUrl: "libs/images/marker-shadow.png",
      });
      _map = L.map(containerId, { preferCanvas: true, worldCopyJump: true }).setView([20, 0], 2);
      _selLayer = L.geoJSON(undefined, { style: { color: "#fbbf24", weight: 3, fillOpacity: 0.18 } }).addTo(_map);
      _graticuleGrp = L.layerGroup().addTo(_map);
      _map.createPane("basemap");
      _map.getPane("basemap").style.zIndex = "200";
      _map.on("click", function () { _selLayer.clearLayers(); _onFeatureSelect && _onFeatureSelect(null); });
      _drawGraticule();
      _map.on("moveend zoomend", _drawGraticule);
    } catch (e) {
      fatalUI("Errore inizializzazione mappa: " + e.message);
    }
  }

  function _drawGraticule() {
    if (!_map || !_graticuleGrp) return;
    _graticuleGrp.clearLayers();
    var b = _map.getBounds();
    if (!b.isValid()) return;
    var z = _map.getZoom();
    var step = z < 4 ? 10 : z < 6 ? 5 : 2;
    var sty = { color: "#475569", weight: 0.4, opacity: 0.35, interactive: false };
    var s = Math.floor(b.getSouth() / step) * step, n = Math.ceil(b.getNorth() / step) * step;
    var w = Math.floor(b.getWest() / step) * step, e2 = Math.ceil(b.getEast() / step) * step;
    for (var lng = w; lng <= e2; lng += step)
      L.polyline([[b.getSouth(), lng], [b.getNorth(), lng]], sty).addTo(_graticuleGrp);
    for (var lat = s; lat <= n; lat += step)
      L.polyline([[lat, b.getWest()], [lat, b.getEast()]], sty).addTo(_graticuleGrp);
  }

  function _colorFromValue(val) {
    var s = val == null ? "" : String(val), h = 0;
    for (var i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) & 0xffffffff;
    h = ((h % 360) + 360) % 360;
    return { fill: "hsla(" + h + ",62%,48%,0.35)", stroke: "hsl(" + h + ",70%,42%)" };
  }

  function syncMapLayers(state) {
    if (!_map) return;
    /* remove deleted */
    for (var id in _layerMap) {
      if (!state[id]) { _map.removeLayer(_layerMap[id]); delete _layerMap[id]; }
    }
    /* add / replace */
    for (var id in state) {
      var spec = state[id];
      if (!spec || !spec.fc) continue;
      if (_layerMap[id]) { _map.removeLayer(_layerMap[id]); delete _layerMap[id]; }
      if (!spec.visible) continue;
      (function (spec, id) {
        var gj = L.geoJSON(spec.fc, {
          style: function (feature) {
            var base = spec.styleColor || "#38bdf8";
            if (spec.choroplethKey && feature.properties) {
              var c = _colorFromValue(feature.properties[spec.choroplethKey]);
              return { color: c.stroke, weight: 1.5, opacity: 0.85, fillColor: c.fill, fillOpacity: 0.4 };
            }
            return { color: base, weight: 1.5, opacity: 0.85, fillColor: base, fillOpacity: 0.28 };
          },
          onEachFeature: function (feature, lyr) {
            lyr.on({
              mouseover: function (e) {
                var t = _tooltipHtml(feature.properties);
                e.target.bindTooltip(t, { sticky: true, opacity: 0.95, className: "gd-tooltip" }).openTooltip();
                e.target.setStyle({ weight: 3, fillOpacity: 0.5 });
              },
              mouseout: function (e) {
                e.target.unbindTooltip();
                e.target.setStyle({ weight: 1.5, fillOpacity: spec.choroplethKey ? 0.4 : 0.28 });
              },
              click: function (e) {
                L.DomEvent.stopPropagation(e);
                _selectFeature(e.target.feature);
              },
            });
          },
        });
        gj.addTo(_map);
        _layerMap[id] = gj;
      })(spec, id);
    }
    /* refresh size after short delay (handles hidden-container edge case) */
    setTimeout(function () { if (_map) _map.invalidateSize(); }, 100);
  }

  function _tooltipHtml(props) {
    if (!props) return "<em>Nessuna proprietà</em>";
    var keys = Object.keys(props).filter(function (k) { return k.charAt(0) !== "_" || k === "_fid"; }).slice(0, 12);
    var rows = keys.map(function (k) { return "<tr><td>" + esc(k) + "</td><td>" + esc(props[k]) + "</td></tr>"; });
    return '<table class="tip-table">' + rows.join("") + "</table>";
  }

  function _selectFeature(feature) {
    if (_selLayer) _selLayer.clearLayers();
    if (!feature || !feature.geometry) { _onFeatureSelect && _onFeatureSelect(null); return; }
    if (_selLayer) _selLayer.addData(feature);
    _onFeatureSelect && _onFeatureSelect({
      properties: feature.properties || {},
      geometryType: feature.geometry.type,
    });
  }

  function zoomToFC(fc) {
    if (!_map || !fc) return;
    try {
      var lyr = L.geoJSON(fc);
      var b = lyr.getBounds();
      if (b.isValid()) _map.fitBounds(b.pad(0.1));
    } catch (e) { console.warn("zoomToFC:", e); }
  }

  function zoomToIds(ids, fc) {
    var set = {}, found = [];
    for (var i = 0; i < ids.length; i++) set[ids[i]] = 1;
    for (var i = 0; i < fc.features.length; i++) {
      var f = fc.features[i], id = getFeatureId(f);
      if (set[id]) found.push(f);
    }
    if (found.length) zoomToFC({ type: "FeatureCollection", features: found });
  }

  function setBasemapOnline(on) {
    if (!_map) return;
    if (_basemapLayer) { _map.removeLayer(_basemapLayer); _basemapLayer = null; }
    if (on) {
      _basemapLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { attribution: "&copy; OpenStreetMap", maxZoom: 19, pane: "basemap" });
      _basemapLayer.addTo(_map);
      if (_graticuleGrp) _map.removeLayer(_graticuleGrp);
    } else {
      if (_graticuleGrp && !_map.hasLayer(_graticuleGrp)) _graticuleGrp.addTo(_map);
      _drawGraticule();
    }
  }

  /* ================================================================
     APP — UI wiring
     ================================================================ */
  var layerMgr = new LayerManager();
  var filterSpec = { property: "", op: "=", value: "", inValues: [] };
  var lastQA = null;

  function pushMapState() {
    var st = {};
    for (var i = 0; i < layerMgr.layers.length; i++) {
      var L = layerMgr.layers[i];
      st[L.id] = { fc: L.fc, visible: L.visible, styleColor: L.styleColor,
        name: L.name, choroplethKey: L.choroplethKey };
    }
    syncMapLayers(st);
  }

  function refreshSummary() {
    var L = layerMgr.getActive();
    if (!L || !L.summary) {
      el("sum-count").textContent = "—"; el("sum-types").textContent = "—";
      el("sum-bbox").textContent = "—"; el("sum-keys").textContent = "—"; return;
    }
    var s = L.summary;
    el("sum-count").textContent = s.featureCount;
    el("sum-types").textContent = Object.keys(s.geometryTypes).map(function (k) {
      return k + ": " + s.geometryTypes[k]; }).join(", ");
    el("sum-bbox").textContent = s.bbox ? s.bbox.map(function (x) { return x.toFixed(4); }).join(", ") : "—";
    el("sum-keys").textContent = s.propertyKeys.join(", ") || "(nessuna)";
    populatePropSelects(s.propertyKeys);
    refreshFilterInList();
    updateFilterCount();
  }

  function populatePropSelects(keys) {
    var selIds = ["filter-prop", "dissolve-group1", "dissolve-group2"];
    for (var si = 0; si < selIds.length; si++) {
      var sel = el(selIds[si]);
      if (!sel) continue;
      var prev = sel.value;
      sel.innerHTML = '<option value="">—</option>';
      for (var i = 0; i < keys.length; i++) {
        var o = document.createElement("option");
        o.value = keys[i]; o.textContent = keys[i]; sel.appendChild(o);
      }
      if (prev) sel.value = prev;
    }
  }

  function refreshFilterInList() {
    var L = layerMgr.getActive(), box = el("filter-in-list");
    box.innerHTML = "";
    var prop = el("filter-prop").value;
    if (!L || !prop) return;
    var vals = uniqueValues(L.fc.features, prop);
    for (var i = 0; i < vals.length; i++) {
      var lab = document.createElement("label");
      var cb = document.createElement("input");
      cb.type = "checkbox"; cb.value = vals[i];
      lab.appendChild(cb);
      lab.appendChild(document.createTextNode(vals[i] === "" ? "(vuoto)" : vals[i]));
      box.appendChild(lab);
    }
  }

  function getFilterSpecFromUI() {
    filterSpec.property = el("filter-prop").value;
    filterSpec.op = el("filter-op").value;
    filterSpec.value = el("filter-value").value;
    filterSpec.inValues = [];
    var cbs = el("filter-in-list").querySelectorAll('input[type="checkbox"]:checked');
    for (var i = 0; i < cbs.length; i++) filterSpec.inValues.push(cbs[i].value);
    return filterSpec;
  }

  function getScopedFeatures() {
    var L = layerMgr.getActive(); if (!L) return [];
    if (el("filter-scope").value === "all") return L.fc.features;
    getFilterSpecFromUI();
    return filterFeatures(L.fc.features, filterSpec);
  }

  function updateFilterCount() {
    var L = layerMgr.getActive();
    if (!L) { el("filter-count-display").textContent = t("filter_count_init"); return; }
    getFilterSpecFromUI();
    var n = el("filter-scope").value === "all"
      ? L.fc.features.length : filterFeatures(L.fc.features, filterSpec).length;
    el("filter-count-display").textContent = t("filter_count_tpl", { n: n, total: L.fc.features.length });
  }

  function renderLayers() {
    var ul = el("layer-list"); ul.innerHTML = "";
    var selIds = ["dissolve-input-layer", "qa-layer", "qa-base-ref", "qa-diss-ref"];
    for (var si = 0; si < selIds.length; si++) {
      var s = el(selIds[si]);
      if (!s) continue;
      s.innerHTML = (si < 2) ? "" : '<option value="">—</option>';
    }
    for (var li = 0; li < layerMgr.layers.length; li++) {
      (function (L) {
        var li = document.createElement("li");
        li.className = "layer-item" + (L.id === layerMgr.activeId ? " active" : "");

        var vis = document.createElement("input");
        vis.type = "checkbox"; vis.checked = L.visible; vis.title = "Visibile";
        vis.onchange = function () { layerMgr.setVisible(L.id, vis.checked); };

        var mid = document.createElement("div"); mid.className = "name";
        mid.textContent = (L.kind === "base" ? "● " : "○ ") + L.name;

        var acts = document.createElement("div"); acts.className = "layer-actions";

        function mkBtn(txt, cls, fn) {
          var b = document.createElement("button"); b.type = "button"; b.textContent = txt;
          if (cls) b.className = cls; b.onclick = fn; return b;
        }
        acts.appendChild(mkBtn(t("lyr_active"), null, function () { layerMgr.setActive(L.id); }));
        acts.appendChild(mkBtn(t("lyr_zoom"), null, function () { zoomToFC(L.fc); }));
        acts.appendChild(mkBtn(t("lyr_attrs"), "btn-attr-gear", function () { openAttrPanel(L.id); }));
        acts.appendChild(mkBtn(t("lyr_export"), null, function () {
          downloadText(safeName(L.name) + ".geojson", JSON.stringify(L.fc, null, 2));
        }));
        acts.appendChild(mkBtn(t("lyr_delete"), "danger", function () {
          if (layerMgr.layers.length <= 1) { showMsg(t("msg_cant_del_last"), "error"); return; }
          if (confirm(t("confirm_del_layer", { name: L.name }))) layerMgr.remove(L.id);
        }));

        var row2 = document.createElement("div");
        row2.style.gridColumn = "1 / -1"; row2.className = "row";

        var inp = document.createElement("input"); inp.type = "text"; inp.value = L.name;
        inp.placeholder = t("lyr_rename_ph"); inp.onchange = function () { layerMgr.rename(L.id, inp.value); };

        var choro = document.createElement("select");
        choro.title = t("lyr_color_by");
        choro.innerHTML = '<option value="">' + esc(t("lyr_solid")) + '</option>';
        var keys = (L.summary && L.summary.propertyKeys) || [];
        for (var ki = 0; ki < keys.length; ki++) {
          var o = document.createElement("option"); o.value = keys[ki]; o.textContent = keys[ki];
          choro.appendChild(o);
        }
        choro.value = L.choroplethKey || "";
        choro.onchange = function () { layerMgr.setChoropleth(L.id, choro.value || null); };

        row2.appendChild(inp); row2.appendChild(choro);
        li.appendChild(vis); li.appendChild(mid); li.appendChild(acts); li.appendChild(row2);
        ul.appendChild(li);

        /* selects */
        var opt = document.createElement("option"); opt.value = L.id; opt.textContent = L.name;
        ["dissolve-input-layer", "qa-layer", "qa-base-ref", "qa-diss-ref"].forEach(function (sid) {
          var s = el(sid); if (s) s.appendChild(opt.cloneNode(true));
        });
      })(layerMgr.layers[li]);
    }
    var dis = el("dissolve-input-layer"), qa = el("qa-layer");
    if (dis) dis.value = layerMgr.activeId || "";
    if (qa) qa.value = layerMgr.activeId || "";
  }

  layerMgr.subscribe(function () {
    renderLayers();
    pushMapState();
    refreshSummary();
  });

  /* ---- FILE LOAD ---- */
  el("file-geojson").addEventListener("change", function (ev) {
    var f = ev.target.files && ev.target.files[0];
    if (!f) return;
    showMsg(t("msg_reading", { name: esc(f.name) }), "ok");
    readFileAsText(f, function (err, text) {
      if (err) { showMsg("Lettura fallita: " + err.message, "error"); return; }
      var fc;
      try { fc = parseGeoJSON(text); }
      catch (e) { showMsg("Errore JSON: " + e.message, "error"); console.error(e); return; }
      showMsg(t("msg_parsing", { n: fc.features.length }), "ok");
      /* async trick: let the message render, then process */
      setTimeout(function () {
        try {
          var name = f.name.replace(/\.[^.]+$/, "") || "Importato";
          var layer = layerMgr.addLayer(fc, name, "base");
          if (projectedHint(fc)) {
            showMsg(t("msg_projected"), "warn");
          } else {
            showMsg(t("msg_loaded", { n: fc.features.length, name: esc(layer.name) }), "ok");
          }
          setTimeout(function () { zoomToFC(fc); }, 150);
        } catch (e) {
          showMsg("Errore elaborazione: " + e.message, "error"); console.error(e);
        }
        ev.target.value = "";
      }, 30);
    });
  });

  /* ---- SAMPLE ---- */
  el("btn-sample").addEventListener("click", function () {
    var SAMPLE = {
      type: "FeatureCollection",
      features: [
        { type: "Feature", properties: { postal_code: "00100", region_code: "LAZ", province_code: "RM", province_name: "Roma", pop: 100 },
          geometry: { type: "Polygon", coordinates: [[[12.45,41.88],[12.52,41.88],[12.52,41.91],[12.45,41.91],[12.45,41.88]]] } },
        { type: "Feature", properties: { postal_code: "00101", region_code: "LAZ", province_code: "RM", province_name: "Roma", pop: 80 },
          geometry: { type: "Polygon", coordinates: [[[12.52,41.88],[12.59,41.88],[12.59,41.91],[12.52,41.91],[12.52,41.88]]] } },
        { type: "Feature", properties: { postal_code: "01100", region_code: "LAZ", province_code: "VT", province_name: "Viterbo", pop: 50 },
          geometry: { type: "Polygon", coordinates: [[[12.08,42.38],[12.16,42.38],[12.16,42.42],[12.08,42.42],[12.08,42.38]]] } },
      ],
    };
    var layer = layerMgr.addLayer(SAMPLE, "Sample (CAP Italia)", "base");
    showMsg(t("msg_sample_ok", { n: SAMPLE.features.length }), "ok");
    setTimeout(function () { zoomToFC(SAMPLE); }, 150);
  });

  /* ---- FILTER ---- */
  el("filter-op").addEventListener("change", function () {
    var op = el("filter-op").value;
    el("filter-value-wrap").hidden = op === "IN";
    el("filter-in-wrap").hidden = op !== "IN";
    updateFilterCount();
  });
  el("filter-prop").addEventListener("change", function () { refreshFilterInList(); updateFilterCount(); });
  el("filter-scope").addEventListener("change", updateFilterCount);
  el("filter-value").addEventListener("input", updateFilterCount);
  el("filter-in-list").addEventListener("change", updateFilterCount);

  el("btn-save-subset").addEventListener("click", function () {
    var L = layerMgr.getActive(); if (!L) return;
    var feats = getScopedFeatures();
    if (!feats.length) { showMsg(t("msg_no_subset"), "error"); return; }
    var name = prompt(t("prompt_subset"), "Subset");
    if (!name) return;
    var fc = { type: "FeatureCollection", features: feats };
    layerMgr.addLayer(fc, name, "derived");
    showMsg(t("msg_subset_saved", { name: esc(name), n: feats.length }), "ok");
    zoomToFC(fc);
  });

  /* ---- DISSOLVE ---- */
  el("dissolve-input-layer").addEventListener("change", function () {
    if (this.value) layerMgr.setActive(this.value);
  });

  el("btn-dissolve").addEventListener("click", function () {
    var lid = el("dissolve-input-layer").value || layerMgr.activeId;
    var rec = layerMgr.getById(lid);
    if (!rec) { showMsg(t("msg_no_layer"), "error"); return; }
    var g1 = el("dissolve-group1").value;
    if (!g1) { el("dissolve-result-msg").textContent = t("dissolve_no_grp"); return; }
    var g2 = el("dissolve-group2").value;
    var sumsRaw = el("dissolve-sums").value.split(/[,;\s]+/).map(function (s) { return s.trim(); }).filter(Boolean);

    var feats = rec.fc.features;
    if (el("filter-scope").value === "filter" && el("filter-prop").value) {
      getFilterSpecFromUI(); feats = filterFeatures(feats, filterSpec);
    }
    if (!feats.length) { el("dissolve-result-msg").textContent = t("dissolve_no_feats"); return; }

  el("dissolve-result-msg").textContent = "";
  el("dissolve-progress").classList.add("visible");
  el("dissolve-progress-bar").style.width = "0%";
  el("dissolve-progress-label").textContent = t("dissolve_progress_start");

    dissolveMainThread(
      feats,
      { groupBy: g1, groupBy2: g2 || "", sumFields: sumsRaw },
      function (p, lbl) {
        el("dissolve-progress-bar").style.width = Math.round(p * 100) + "%";
        el("dissolve-progress-label").textContent = lbl;
      },
      function (out) {
        el("dissolve-progress").classList.remove("visible");
        var ww = out.stats.warnings || [];
        var name = "Dissolved: " + [g1, g2].filter(Boolean).join("+") + " (" + feats.length + " in)";
        layerMgr.addLayer(out.fc, name, "derived");
        el("dissolve-result-msg").textContent = t("msg_dissolve_done", { n: out.stats.groupCount, warn: "" }) +
          (ww.length ? ww.slice(0, 2).join(" | ") : "");
        if (ww.length) console.warn("Dissolve warnings:", ww);
        zoomToFC(out.fc);
      },
      function (err) {
        el("dissolve-progress").classList.remove("visible");
        el("dissolve-result-msg").textContent = "Errore: " + err;
      }
    );
  });

  /* ---- QA ---- */
  el("btn-run-qa").addEventListener("click", function () {
  var lid = el("qa-layer").value, rec = layerMgr.getById(lid);
  if (!rec) { showMsg(t("msg_no_layer"), "error"); return; }
  el("qa-tbody").innerHTML = "";
  el("qa-progress").classList.add("visible");
  el("qa-progress-bar").style.width = "0%";
  el("qa-progress-label").textContent = t("qa_progress_start");

    runQAMainThread(
      rec.fc,
      { overlapRelMin: Number(el("qa-overlap-rel").value), sliverAreaMax: Number(el("qa-sliver-area").value) },
      function (p, lbl) {
        el("qa-progress-bar").style.width = Math.round(p * 100) + "%";
        el("qa-progress-label").textContent = lbl;
      },
      function (result) {
        el("qa-progress").classList.remove("visible");
        lastQA = { issues: result.issues, layerId: lid };
        renderQATable(result.issues, rec.fc);
        el("qa-progress-label").textContent = t("msg_qa_done", { n: result.issues.length });
      },
      function (err) {
        el("qa-progress").classList.remove("visible");
        el("qa-progress-label").textContent = "Errore: " + err;
      }
    );
  });

  function renderQATable(issues, fc) {
    var tb = el("qa-tbody"); tb.innerHTML = "";
    for (var i = 0; i < issues.length; i++) {
      (function (iss) {
        var tr = document.createElement("tr");
        var ids = (iss.featureIds || []).join(", ");
        var metric = "";
        if (iss.area_m2 != null) metric += "area " + Number(iss.area_m2).toFixed(1) + " m² ";
        if (iss.overlap_m2 != null) metric += "overlap " + Number(iss.overlap_m2).toFixed(1) + " m² ";
        if (iss.compactness != null) metric += "compact " + Number(iss.compactness).toFixed(3);
        tr.innerHTML = "<td>" + esc(iss.type) + "</td><td>" + esc(ids) + "</td><td>" + esc(metric) +
          "</td><td>" + esc(iss.suggestion || "") + "</td><td class='cell-actions'></td>";
        if (iss.featureIds && iss.featureIds.length) {
      var b = document.createElement("button"); b.type = "button"; b.textContent = t("qa_zoom");
      b.onclick = function () { zoomToIds(iss.featureIds, fc); };
          tr.querySelector(".cell-actions").appendChild(b);
        }
        tb.appendChild(tr);
      })(issues[i]);
    }
  }

  el("btn-export-qa-json").addEventListener("click", function () {
    if (!lastQA) return;
    downloadText("qa-report.json", JSON.stringify({ issues: lastQA.issues }, null, 2), "application/json");
  });
  el("btn-export-qa-csv").addEventListener("click", function () {
    if (!lastQA) return;
    downloadText("qa-report.csv", qaReportToCSV(lastQA.issues), "text/csv");
  });

  /* ---- MAP TOOLBAR ---- */
  var _basemapOn = false;
  el("btn-basemap").addEventListener("click", function () {
    _basemapOn = !_basemapOn;
    setBasemapOnline(_basemapOn);
    el("btn-basemap").textContent = _basemapOn ? t("btn_basemap_off") : t("btn_basemap");
  });
  el("btn-fit-all").addEventListener("click", function () {
    var b = null;
    for (var i = 0; i < layerMgr.layers.length; i++) b = bboxForFC(layerMgr.layers[i].fc) || b;
    if (b && _map) _map.fitBounds([[b[1], b[0]], [b[3], b[2]]], { padding: [20, 20] });
  });
  el("btn-fit-active").addEventListener("click", function () {
    var L = layerMgr.getActive(); if (L) zoomToFC(L.fc);
  });

  /* ---- FEATURE SELECTION INFO ---- */
  _onFeatureSelect = function (detail) {
    var box = el("selection-detail");
    if (!detail) { box.textContent = t("selection_hint"); return; }
    var props = detail.properties || {}, keys = Object.keys(props).slice(0, 14);
    box.innerHTML = "<strong>" + esc(detail.geometryType) + "</strong><br/>" +
      keys.map(function (k) { return esc(k) + ": " + esc(props[k]); }).join("<br/>");
  };

  /* ---- COLLAPSIBLE PANELS ---- */
  var headers = document.querySelectorAll(".panel-header");
  for (var hi = 0; hi < headers.length; hi++) {
    headers[hi].addEventListener("click", function () {
      this.closest(".panel").classList.toggle("collapsed");
    });
  }

  /* ================================================================
     ATTRIBUTE PANEL — Excel-like editor per gli attributi del layer
     ================================================================ */

  /* Campi "essenziali" (bloccati): iniziano con _ o sono identificatori geometria */
  function isLockedField(key) {
    return key.charAt(0) === "_";
  }

  /* Stato pannello */
  var AP = {
    layerId: null,
    page: 0,
    pageSize: 100,
    /* mappa di modifiche pendenti: "rowIdx__colKey" → nuovoValore */
    pendingEdits: {},
    /* colonne da eliminare (Set simulato come oggetto) */
    pendingDelCols: {},
    /* nuove colonne da aggiungere */
    pendingNewCols: [],   /* [{name, defaultVal}] */
    /* colonna in sort */
    sortKey: null,
    sortAsc: true,
    /* indici in ordine corrente */
    sortedIdx: [],
  };

  function apOpen(layerId) {
    AP.layerId = layerId;
    AP.page = 0;
    AP.pendingEdits = {};
    AP.pendingDelCols = {};
    AP.pendingNewCols = [];
    AP.sortKey = null;
    AP.sortAsc = true;
    AP.sortedIdx = [];
    var panel = el("attr-panel");
    panel.style.display = "flex";
    apRebuildSortIndex();
    apRender();
    /* forza invalidateSize sulla mappa */
    setTimeout(function () { if (_map) _map.invalidateSize(); }, 120);
  }

  function apClose() {
    AP.layerId = null;
    var panel = el("attr-panel");
    if (panel) panel.style.display = "none";
    setTimeout(function () { if (_map) _map.invalidateSize(); }, 120);
  }

  /* Espone globalmente così i bottoni inline HTML possono chiamarla */
  window._gdAttrPanelClose = apClose;

  function apRebuildSortIndex() {
    var L = AP.layerId && layerMgr.getById(AP.layerId);
    if (!L) { AP.sortedIdx = []; return; }
    var n = L.fc.features.length;
    AP.sortedIdx = [];
    for (var i = 0; i < n; i++) AP.sortedIdx.push(i);
    if (AP.sortKey) {
      var sk = AP.sortKey, asc = AP.sortAsc;
      AP.sortedIdx.sort(function (a, b) {
        var va = (L.fc.features[a].properties || {})[sk];
        var vb = (L.fc.features[b].properties || {})[sk];
        var na = Number(va), nb = Number(vb);
        var useNum = !isNaN(na) && !isNaN(nb);
        var cmp = useNum ? na - nb : String(va == null ? "" : va).localeCompare(String(vb == null ? "" : vb));
        return asc ? cmp : -cmp;
      });
    }
  }

  function apGetColumns(L) {
    /* Tutte le colonne: prima le locked, poi le user, escludi quelle in pendingDelCols */
    var keys = (L.summary && L.summary.propertyKeys) ? L.summary.propertyKeys.slice() : [];
    /* aggiungi eventuale colonna nuova non ancora salvata */
    for (var i = 0; i < AP.pendingNewCols.length; i++) {
      var nc = AP.pendingNewCols[i].name;
      if (keys.indexOf(nc) < 0) keys.push(nc);
    }
    /* escludi pendingDelCols */
    keys = keys.filter(function (k) { return !AP.pendingDelCols[k]; });
    /* ordina: locked prima */
    keys.sort(function (a, b) {
      var la = isLockedField(a) ? 0 : 1, lb = isLockedField(b) ? 0 : 1;
      if (la !== lb) return la - lb;
      return a.localeCompare(b);
    });
    return keys;
  }

  function apRender() {
    var L = AP.layerId && layerMgr.getById(AP.layerId);
    if (!L) { apClose(); return; }

    var features = L.fc.features;
    var totalRows = features.length;
    var cols = apGetColumns(L);
    var totalPages = Math.max(1, Math.ceil(totalRows / AP.pageSize));
    if (AP.page >= totalPages) AP.page = totalPages - 1;
    var start = AP.page * AP.pageSize;
    var end = Math.min(start + AP.pageSize, totalRows);

    /* Header */
    el("ap-title").textContent = t("ap_title_tpl", { name: L.name, rows: totalRows, cols: cols.length });

    /* Paginazione */
    el("ap-page-info").textContent = t("ap_page_info", {
      p: AP.page + 1, total: totalPages, start: start + 1, end: end });
    el("ap-btn-prev").disabled = AP.page === 0;
    el("ap-btn-prev").textContent = t("ap_prev");
    el("ap-btn-next").disabled = AP.page >= totalPages - 1;
    el("ap-btn-next").textContent = t("ap_next");

    /* Costruisci tabella */
    var html = '<table class="attr-table" id="attr-table-inner">';

    /* THEAD */
    html += "<thead><tr>";
    html += '<th class="attr-th-fixed" style="min-width:42px">#</th>';
    for (var ci = 0; ci < cols.length; ci++) {
      var key = cols[ci];
      var locked = isLockedField(key);
      var sortIco = AP.sortKey === key ? (AP.sortAsc ? " ▲" : " ▼") : "";
      html += '<th class="' + (locked ? "attr-th-locked" : "attr-th-user") + '" data-key="' + esc(key) + '">';
      html += '<div class="attr-th-inner">';
      html += '<span class="attr-th-label" data-sort-key="' + esc(key) + '">';
      html += (locked ? "🔒 " : "") + esc(key) + sortIco;
      html += "</span>";
      if (!locked) {
        html += '<button type="button" class="attr-del-col" data-del-key="' + esc(key) +
          '" title="Rimuovi colonna">✕</button>';
      }
      html += "</div></th>";
    }
    html += '<th class="attr-th-add"><button type="button" id="ap-btn-add-col">' + esc(t("ap_add_col")) + '</button></th>';
    html += "</tr></thead>";

    /* TBODY */
    html += "<tbody>";
    for (var ri = start; ri < end; ri++) {
      var realIdx = AP.sortedIdx.length ? AP.sortedIdx[ri] : ri;
      var feat = features[realIdx];
      var props = feat.properties || {};
      html += "<tr data-row-idx=\"" + realIdx + "\">";
      html += "<td class=\"attr-row-num\">" + (ri + 1) + "</td>";
      for (var ci2 = 0; ci2 < cols.length; ci2++) {
        var k = cols[ci2];
        var editKey = realIdx + "__" + k;
        var rawVal = AP.pendingEdits.hasOwnProperty(editKey)
          ? AP.pendingEdits[editKey]
          : (props.hasOwnProperty(k) ? props[k] : "");
        var dispVal = rawVal == null ? "" : String(rawVal);
        var isNew = false;
        for (var ni = 0; ni < AP.pendingNewCols.length; ni++) {
          if (AP.pendingNewCols[ni].name === k) { isNew = true; break; }
        }
        var locked2 = isLockedField(k);
        if (locked2) {
          html += "<td class=\"attr-cell-locked\">" + esc(dispVal) + "</td>";
        } else {
          html += "<td class=\"attr-cell\" data-row=\"" + realIdx + "\" data-col=\"" + esc(k) + "\"" +
            (isNew ? ' data-new="1"' : "") + ">" +
            "<span class=\"attr-cell-view\">" + esc(dispVal) + "</span>" +
            "<input class=\"attr-cell-input\" type=\"text\" value=\"" + esc(dispVal) +
            "\" data-row=\"" + realIdx + "\" data-col=\"" + esc(k) + "\" />" +
            "</td>";
        }
      }
      html += "<td></td>";
      html += "</tr>";
    }
    html += "</tbody></table>";

    el("ap-table-wrap").innerHTML = html;

    /* Wiring inline editing */
    var cells = el("ap-table-wrap").querySelectorAll(".attr-cell");
    for (var xi = 0; xi < cells.length; xi++) {
      (function (td) {
        var inp = td.querySelector(".attr-cell-input");
        var span = td.querySelector(".attr-cell-view");
        /* click su td → attiva input */
        td.addEventListener("click", function () {
          td.classList.add("editing");
          inp.focus();
          inp.select();
        });
        inp.addEventListener("blur", function () {
          td.classList.remove("editing");
          var r = parseInt(td.dataset.row, 10);
          var c = td.dataset.col;
          var newVal = inp.value;
          span.textContent = newVal;
          AP.pendingEdits[r + "__" + c] = newVal;
          apMarkDirty();
        });
        inp.addEventListener("keydown", function (e) {
          if (e.key === "Enter") { inp.blur(); }
          if (e.key === "Escape") {
            td.classList.remove("editing");
            inp.value = span.textContent;
          }
          e.stopPropagation();
        });
      })(cells[xi]);
    }

    /* Sort su header */
    var sortBtns = el("ap-table-wrap").querySelectorAll("[data-sort-key]");
    for (var si = 0; si < sortBtns.length; si++) {
      (function (span) {
        span.style.cursor = "pointer";
        span.addEventListener("click", function () {
          var k = span.dataset.sortKey;
          if (AP.sortKey === k) AP.sortAsc = !AP.sortAsc;
          else { AP.sortKey = k; AP.sortAsc = true; }
          apRebuildSortIndex();
          apRender();
        });
      })(sortBtns[si]);
    }

    /* Delete column buttons */
    var delBtns = el("ap-table-wrap").querySelectorAll(".attr-del-col");
    for (var di = 0; di < delBtns.length; di++) {
      (function (btn) {
        btn.addEventListener("click", function (e) {
          e.stopPropagation();
          var k = btn.dataset.delKey;
          if (!confirm(t("confirm_del_col", { key: k }))) return;
          AP.pendingDelCols[k] = 1;
          apMarkDirty();
          apRender();
        });
      })(delBtns[di]);
    }

    /* Aggiungi colonna */
    var addColBtn = el("ap-btn-add-col");
    if (addColBtn) {
      addColBtn.addEventListener("click", function () {
        apShowAddColDialog();
      });
    }
  }

  function apMarkDirty() {
    var bar = el("ap-unsaved-bar");
    if (bar) bar.style.display = "flex";
  }
  function apClearDirty() {
    var bar = el("ap-unsaved-bar");
    if (bar) bar.style.display = "none";
  }

  function apShowAddColDialog() {
    var name = prompt(t("prompt_col_name"), "");
    if (!name || !name.trim()) return;
    name = name.trim();
    var L = layerMgr.getById(AP.layerId);
    if (!L) return;
    var existing = (L.summary && L.summary.propertyKeys) || [];
    for (var i = 0; i < existing.length; i++) {
      if (existing[i] === name) { alert(t("err_col_exists", { name: name })); return; }
    }
    for (var i = 0; i < AP.pendingNewCols.length; i++) {
      if (AP.pendingNewCols[i].name === name) { alert(t("err_col_new_dup", { name: name })); return; }
    }
    if (isLockedField(name)) { alert(t("err_col_reserved")); return; }
    var defaultVal = prompt(t("prompt_col_default"), "");
    AP.pendingNewCols.push({ name: name, defaultVal: defaultVal == null ? "" : defaultVal });
    apMarkDirty();
    apRender();
  }

  function apSaveChanges() {
    var L = AP.layerId && layerMgr.getById(AP.layerId);
    if (!L) return;
    var features = L.fc.features;

    /* 1. Aggiungi nuove colonne */
    for (var ni = 0; ni < AP.pendingNewCols.length; ni++) {
      var nc = AP.pendingNewCols[ni];
      for (var fi = 0; fi < features.length; fi++) {
        if (!features[fi].properties) features[fi].properties = {};
        if (!features[fi].properties.hasOwnProperty(nc.name)) {
          features[fi].properties[nc.name] = nc.defaultVal;
        }
      }
    }
    AP.pendingNewCols = [];

    /* 2. Elimina colonne */
    var delKeys = Object.keys(AP.pendingDelCols);
    for (var di = 0; di < delKeys.length; di++) {
      var dk = delKeys[di];
      for (var fi = 0; fi < features.length; fi++) {
        if (features[fi].properties) delete features[fi].properties[dk];
      }
    }
    AP.pendingDelCols = {};

    /* 3. Applica edit celle */
    var editKeys = Object.keys(AP.pendingEdits);
    for (var ei = 0; ei < editKeys.length; ei++) {
      var parts = editKeys[ei].split("__");
      var rowIdx = parseInt(parts[0], 10);
      /* la chiave col può contenere "__" → riunisci */
      var colKey = parts.slice(1).join("__");
      var newVal = AP.pendingEdits[editKeys[ei]];
      if (features[rowIdx] && features[rowIdx].properties) {
        /* prova conversione numerica */
        var numV = Number(newVal);
        features[rowIdx].properties[colKey] = (newVal !== "" && !isNaN(numV)) ? numV : newVal;
      }
    }
    AP.pendingEdits = {};

    /* Aggiorna summary del layer */
    L.summary = summarize(L.fc);
    apClearDirty();
    /* Ri-render tabella + sidebar */
    AP.sortedIdx = [];
    apRebuildSortIndex();
    apRender();
    /* aggiorna summary sidebar */
    refreshSummary();
    showMsg(t("msg_attr_saved", { name: esc(L.name) }), "ok");
  }

  function apDiscardChanges() {
    if (!confirm(t("confirm_discard"))) return;
    AP.pendingEdits = {};
    AP.pendingDelCols = {};
    AP.pendingNewCols = [];
    apClearDirty();
    apRender();
  }

  /* Esponi per bottoni inline */
  window._gdAttrSave = apSaveChanges;
  window._gdAttrDiscard = apDiscardChanges;
  window._gdAttrPrev = function () { AP.page--; apRender(); };
  window._gdAttrNext = function () { AP.page++; apRender(); };
  window._gdAttrPageSize = function (v) { AP.pageSize = parseInt(v, 10) || 100; AP.page = 0; apRender(); };

  /* Inizializza apertura pannello (globale per bottone layer) */
  function openAttrPanel(layerId) { apOpen(layerId); }
  window._gdOpenAttrPanel = openAttrPanel;

  /* Drag per resize pannello */
  (function () {
    var handle = el("ap-resize-handle");
    if (!handle) return;
    var startY, startH, panel;
    handle.addEventListener("mousedown", function (e) {
      panel = el("attr-panel");
      startY = e.clientY;
      startH = panel.offsetHeight;
      e.preventDefault();
      function onMove(ev) {
        var dy = startY - ev.clientY;
        var maxH = window.innerHeight - 100;
        panel.style.height = Math.max(140, Math.min(startH + dy, maxH)) + "px";
        if (_map) _map.invalidateSize();
      }
      function onUp() {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      }
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    });
  })();

  /* ---- INIT ---- */
  initMap("map");
  initLangSwitcher(); /* applies saved/default lang, sets all data-i18n elements */
  el("worker-status-badge").textContent =
    window.location.protocol === "file:" ? t("worker_file") : t("worker_server");
  el("footer-note").textContent =
    window.location.protocol === "file:" ? t("footer_file") : t("footer_server");
  showMsg(t("msg_ready"), "ok");

})(); /* fine IIFE */
