# GeoDissolve — local administrative dissolve & polygon QA

Single-page, **offline-capable** GIS utility: load GeoJSON, filter subsets, **dissolve** by one or two attributes (JSTS incremental union), manage multiple layers, and run **geometry QA** (validity, overlaps, slivers, multipart, gap/boundary vs base union). No backend, no API keys.

## How to run

### Option A — aprire `index.html` direttamente

- Doppio clic o trascinamento nel browser.
- L’app usa **solo script classici** (nessun `import` ES module): caricamento GeoJSON e mappa funzionano anche con `file://`.
- I **Web Worker** restano disattivati su `file://` (sicurezza browser); dissolve/QA usano il thread principale.

### Option B — local static server (recommended)

From the `geo-dissolve-tool` folder:

```bash
# Python 3
python -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080). This enables **Web Workers** for dissolve and QA and allows **Load sample** (`data/sample.geojson`).

Other options: `npx serve .` or any static file server.

## Gestione Attributi (⚙ Attributi)

Su ogni layer nella lista compare il pulsante **⚙ Attributi** che apre un pannello a scomparsa nella metà inferiore della mappa:

| Funzione | Come |
|---|---|
| **Modifica cella** | Click su una cella → digita → Invio o clic fuori |
| **Ordina** | Click sull'intestazione della colonna (▲▼) |
| **Aggiungi colonna** | Bottone **+ Col** → inserisci nome e valore predefinito |
| **Elimina colonna** | Bottone **✕** sull'intestazione (solo colonne non bloccate) |
| **Colonne bloccate** | Mostrano 🔒 — campi interni (iniziano con `_`): non modificabili |
| **Salva** | **💾 Salva nel layer** applica tutto |
| **Annulla** | **↩ Annulla tutto** scarta le modifiche non salvate |
| **Ridimensiona** | Trascina la barra grigia in cima al pannello |
| **Paginazione** | Scegli righe/pagina e naviga con ◀ ▶ |

## Example workflow

1. **Load** `data/sample.geojson` (via server) or your own postal / admin GeoJSON.
2. Review **summary** (feature count, geometry types, bbox, property keys).
3. **Filter** (optional): choose attribute, operator, value(s); save **subset as new layer** if needed.
4. **Dissolve**: pick input layer, **group by** (e.g. `province_code`); optional second field; optional **sum** numeric columns; run — new derived layer appears.
5. **QA**: choose layer; optionally enable **gap / boundary** and pick **base** vs **dissolved** layers; **Run QA**; **Zoom** to issues; export **JSON/CSV**.
6. **Export** any layer as GeoJSON from the layer row.

## Project layout

```
geo-dissolve-tool/
  index.html
  css/style.css
  js/
    app.js          # UI wiring
    io.js           # load/save, summaries
    layers.js       # layer list & styling keys
    filters.js      # subset logic
    dissolve.js     # dissolve orchestration + main-thread fallback
    qa.js           # QA orchestration + simple file:// fallback
    map.js          # Leaflet map, graticule, selection
    workers/
      dissolve.worker.js
      qa.worker.js
  libs/             # vendored: Leaflet, JSTS, Turf + marker images
  data/sample.geojson
```

## Assumptions

- CRS assumed **WGS84** (lon/lat). You get a **warning** if coordinates look projected (outside lon/lat range).
- **Polygon / MultiPolygon** are supported for dissolve; points/lines are **excluded** unless **Include points/lines** is checked (experimental buffer).
- Large files: parsing is one-shot JSON (browser limit); processing uses **chunked** scans where possible and **workers** when served over HTTP.

## Libraries (bundled in `libs/`)

- [Leaflet](https://leafletjs.com/) — map
- [JSTS](https://github.com/bjornharrtell/jsts) — union, intersection, validity, symDifference
- [Turf](https://turfjs.org/) — bbox, area, length, helpers

All are MIT/BSD-compatible; see each library’s license in the vendored files.
