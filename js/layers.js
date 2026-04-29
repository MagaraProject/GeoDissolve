/**
 * Layer state: base + derived GeoJSON layers with styling and visibility.
 */

let _idCounter = 1;

function newId() {
  return `layer-${_idCounter++}-${Date.now().toString(36)}`;
}

const PALETTE = [
  "#38bdf8",
  "#a78bfa",
  "#f472b6",
  "#4ade80",
  "#fbbf24",
  "#fb7185",
  "#2dd4bf",
  "#f97316",
];

function pickColor(index) {
  return PALETTE[index % PALETTE.length];
}

class LayerManager {
  constructor() {
    this.layers = [];
    this.activeId = null;
    this.listeners = new Set();
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  _emit() {
    for (const fn of this.listeners) fn(this.layers, this.activeId);
  }

  async addBaseLayer(fc, meta = {}) {
    const id = newId();
    GeoDissolve.io.ensureFeatureIds(id, fc);
    const name = meta.name || meta.fileName || "Base";
    const idx = this.layers.length;
    const rec = {
      id,
      name,
      kind: "base",
      fc,
      visible: true,
      styleColor: pickColor(idx),
      choroplethKey: null,
      summary: null,
    };
    rec.summary = await GeoDissolve.io.summarizeFeatureCollection(fc);
    this.layers.push(rec);
    this.activeId = id;
    this._emit();
    return rec;
  }

  async addDerivedLayer(fc, meta) {
    const id = newId();
    GeoDissolve.io.ensureFeatureIds(id, fc);
    const idx = this.layers.length;
    const rec = {
      id,
      name: meta.name,
      kind: "derived",
      fc,
      visible: true,
      styleColor: pickColor(idx),
      choroplethKey: null,
      summary: null,
    };
    rec.summary = await GeoDissolve.io.summarizeFeatureCollection(fc);
    this.layers.push(rec);
    this.activeId = id;
    this._emit();
    return rec;
  }

  getActive() {
    return this.layers.find((l) => l.id === this.activeId) || null;
  }

  getById(id) {
    return this.layers.find((l) => l.id === id) || null;
  }

  setActive(id) {
    if (this.layers.some((l) => l.id === id)) {
      this.activeId = id;
      this._emit();
    }
  }

  setVisible(id, vis) {
    const L = this.getById(id);
    if (L) {
      L.visible = vis;
      this._emit();
    }
  }

  rename(id, name) {
    const L = this.getById(id);
    if (L && name.trim()) {
      L.name = name.trim();
      this._emit();
    }
  }

  remove(id) {
    const i = this.layers.findIndex((l) => l.id === id);
    if (i < 0) return;
    const wasActive = this.layers[i].id === this.activeId;
    this.layers.splice(i, 1);
    if (wasActive) this.activeId = this.layers[0]?.id ?? null;
    this._emit();
  }

  setChoroplethKey(id, key) {
    const L = this.getById(id);
    if (L) {
      L.choroplethKey = key || null;
      this._emit();
    }
  }

  async replaceGeoJSON(id, fc) {
    const L = this.getById(id);
    if (!L) return;
    GeoDissolve.io.ensureFeatureIds(L.id, fc);
    L.fc = fc;
    L.summary = await GeoDissolve.io.summarizeFeatureCollection(fc);
    this._emit();
  }
}

window.GeoDissolve = window.GeoDissolve || {};
GeoDissolve.layers = { LayerManager };
