# Pipeline

Downloads open sources, cleans them, aggregates to INEGI AGEB and writes static files into
`public/data/`. Every output is listed with its source, license and retrieval date in
`public/data/manifest.json`.

## Run locally

Requirements: [uv](https://docs.astral.sh/uv/) and Python ≥ 3.11 (dependency: `shapely`).

```bash
uv run --directory pipeline python -m hlm.run
```

Or, from the repo root, `npm run data`. A full run takes about a minute once sources are cached.

Options:

```bash
uv run --directory pipeline python -m hlm.run --skip blocks,streets   # faster: AGEBs, census, wealth, OSM, territorios
uv run --directory pipeline python -m hlm.run --skip osm,wildlife     # no Overpass / iNaturalist calls (uses cached names)
uv run --directory pipeline python -m hlm.run --skip blocks,streets,osm,wildlife,heat,green   # only Chamba
```

Skipping `wildlife`, `heat`, `green` or `work` keeps that mode's numbers from the previous run (they are not
blanked), and La Gaceta only writes entries for steps that actually ran.

Downloads are cached in `pipeline/.cache/`; static sources are reused for years and OSM for 6 days.
Delete a cached file to force a fresh download. `HLM_CACHE` and `HLM_OUT` override the two folders.

## Outputs (`public/data/`)

| File | Contents |
|---|---|
| `agebs.geojson` | 673 AGEB polygons with census 2020 fields, derived ratios, IMU/GRS grades (null when unavailable), territory id and colour |
| `realms.geojson` | Territorios: dissolved polygons, label point, name, title, colour and brand (`charge`) |
| `blocks.geojson` | Manzanas with population and density (lazy-loaded by the app) |
| `roads_major.geojson`, `roads_minor.geojson` | INEGI vialidades split by rank |
| `landmarks.geojson`, `water_parks.geojson` | OSM points of interest, water, river, parks |
| `sea.geojson` | Gulf of California around the coast (Natural Earth 1:10m ocean, clipped) |
| `wildlife.geojson` | iNaturalist sightings (group, name, date, observer, licence, new-this-week flag) |
| `trees.geojson` | Cartoon-tree points from WorldCover tree cells (`v` = NDVI there, `c` = tree fraction) |
| `heat.png` | Summer ground-temperature picture (lon/lat bounds and °C range in `stats.json → heat.image`) |
| `history.json`, `chronicle.json` | Weekly snapshots and La Gaceta entries |
| `work.json` | DENUE businesses as compact rows `[lon, lat, group, size, name, SCIAN, alta]` plus the activity names (loaded the first time Chamba is opened) |
| `stats.json` | City totals, density class breaks and medians used by legends and descriptions |
| `manifest.json` | Provenance and status of every source and layer |

## Modules

- `hlm/common.py`: paths, cached `fetch()` with retries and the manual fallback, provenance records
- `hlm/base.py`: Marco Geoestadístico (AGEB, manzanas, vialidades)
- `hlm/people.py`: Censo 2020 AGEB and manzana CSV; `*` → null
- `hlm/wealth.py`: CONAPO IMU 2020 and CONEVAL GRS 2020 (column names auto-detected)
- `hlm/osm.py`: Overpass queries with endpoint fallback
- `hlm/coast.py`: Natural Earth ocean polygon clipped to the map area (`sea.geojson`), runs every time (cached a year)
- `hlm/wildlife.py`: iNaturalist download (paged by id, ≤ 1 request/s), licence and privacy filters, per-AGEB counts
- `hlm/heat.py`: Landsat summer LST composite (cached in `.cache/heat_comp_*.npz`), per-AGEB means, `heat.png`; NASA POWER daily max
- `hlm/green.py`: Sentinel-2 NDVI (now and a year ago), WorldCover tree cover (cached `.npy`), `trees.geojson`
- `hlm/work.py`: INEGI DENUE (Sonora zip, municipio 030), per-AGEB business counts and estimated jobs, compact `work.json` points
- `hlm/chronicle.py`: weekly snapshot (`history.json`) and La Gaceta entries (`chronicle.json`)
- `hlm/realms.py`: k-means *territorios*, names, colours and brands
- `hlm/run.py`: orchestration

## When a portal blocks scripts (CONAPO / CONEVAL)

`repodatos.atdt.gob.mx` sometimes answers **403 Access Denied** to non-browser clients. The pipeline
then marks the Wealth layer `unavailable` and the app says "Datos no disponibles". To fill it:

1. Open <https://www.datos.gob.mx/dataset/indices_marginacion> in a browser and download
   **"Índice de marginación urbana AGEB"** (`imu_2020.csv`).
2. Open <https://www.datos.gob.mx/dataset/rezago_social> and download
   **"Grado de rezago social por AGEB, 2020"** (`grs_ageb_2020.csv`).
3. Save both, with those exact names, in `pipeline/manual/` and re-run the pipeline. The run prints
   which columns it detected; check that the grade/index columns were found.

## Weekly refresh (GitHub Actions)

`.github/workflows/weekly-refresh.yml` runs every Monday 06:00 UTC (and on demand). It re-runs only the
fast-changing layers and commits the changed `public/data/`. Static layers (census, marginalization,
geometry) are cached and not refetched. Weekly layers today: OSM, iNaturalist, NASA POWER and Sentinel-2 NDVI, plus the *La Gaceta*
entries comparing this week with last week. The Landsat composite is cached and only rebuilt when
`SUMMERS` in `hlm/heat.py` changes (add a year each September).

## Satellite layers

Heat and Green both come from **Microsoft Planetary Computer STAC** (Landsat C2 L2 and Sentinel-2 L2A, no account required for
public assets; signed URLs via `planetary-computer`). Google Earth Engine is the alternative and needs a
service account. Credentials only ever come from environment variables or CI secrets:

```bash
export PC_SDK_SUBSCRIPTION_KEY=...        # optional, raises Planetary Computer rate limits
export EE_SERVICE_ACCOUNT=... EE_PRIVATE_KEY_FILE=...   # only if using Earth Engine
```

Never commit keys. `.env` is git-ignored.
