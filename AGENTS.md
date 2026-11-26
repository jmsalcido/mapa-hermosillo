# AGENTS.md — Hermosillo: El Mapa Vivo

A stylised, strategy-game-looking map of Hermosillo, Sonora (Civilization VI / Crusader Kings III feel, Norteño
look), built only from real, open data. Static site (Vite + React + MapLibre) fed by a Python pipeline that
writes `public/data/`. A GitHub Action refreshes the data weekly and redeploys to Cloudflare.

Live: https://hermosillo-mapa-vivo.vinc-fdb.workers.dev

## Non-negotiable rules

1. **Real data only.** Every number on screen comes from a cited source in `public/data/manifest.json`.
   If a source fails, show "Datos no disponibles" / "sin datos". Never invent, interpolate or use placeholders.
2. **Missing ≠ zero.** INEGI `*` cells (confidentiality) are `null`, a real `0` stays `0`. Keep that distinction
   through the pipeline and the UI.
3. **Modelled or estimated values are labelled** in the UI ("cálculo aproximado", "modelado", "visto desde
   satélite"). Examples: Chamba jobs (DENUE size-range midpoints), NASA POWER temperature, NDVI trees.
4. **UI language is Spanish (Mexico) only**, written in plain words for non-technical people. No English in the
   interface. Strings live in `src/i18n.ts` or inline JSX in Spanish.
5. **Look: Norteño western** — leather, stitching, conchos, brass rivets, sarape stripe, cattle-brand (fierro)
   heraldry; fonts Rye / Zilla Slab / Alegreya. Inspired by that aesthetic; never copy any game's or artist's
   art, names, logos or likeness.
6. **Colour-blind-safe palettes**: single-hue ramps with monotonic lightness, or blue↔orange diverging. Point
   symbols differ by silhouette, not only colour.
7. **Privacy**: no phones, e-mails, addresses of businesses; iNaturalist obscured observations are never placed;
   only openly licensed (CC0 / CC-BY*) observations are kept and credited.
8. **Percentages must be 0–100.** Use the denominator INEGI defines for each numerator (see `DATA.md →
   Census percentages`). `people.check_ratios` aborts the run otherwise — don't weaken it.

## Commands

```bash
npm install
npm run dev                 # Vite on http://localhost:5178 (see .claude/launch.json)
npm run build               # tsc -b && vite build → dist/
npm run data                # full pipeline (= uv run --directory pipeline python -m hlm.run)

# faster partial runs; skipped data modes KEEP last run's numbers (see run.py → _carry_over)
uv run --directory pipeline python -m hlm.run --skip blocks,streets,osm
uv run --directory pipeline python -m hlm.run --skip blocks,streets,osm,wildlife,heat,green   # only Chamba

# deploy (Cloudflare Workers static assets, account "vinc")
npm run build && CLOUDFLARE_ACCOUNT_ID=<vinc account id> npx wrangler deploy
```

Run the pipeline with `--directory pipeline` (not `--project pipeline`): the `hlm` package must be importable.
There is no test suite; verify with `npm run build`, a pipeline run, and the app in a browser.

## Layout

```
pipeline/hlm/      Python pipeline (uv project in pipeline/)
  common.py        paths, cached fetch() with retries + pipeline/manual fallback, Provenance/Manifest
  base.py          INEGI Marco Geoestadístico: AGEBs, blocks, streets
  people.py        Censo 2020 (AGEB + manzana), ratios, check_ratios()
  wealth.py        CONAPO IMU 2020, CONEVAL GRS 2020 (5 grades each)
  osm.py           Overpass: landmarks, water, parks, neighbourhood names
  realms.py        "territorios": k-means grouping, Norteño titles, colours, fierros (derived, not official)
  wildlife.py      Fauna — iNaturalist
  heat.py          Calor — Landsat summer LST composite + NASA POWER daily max
  green.py         Verde — Sentinel-2 NDVI (now vs a year ago) + ESA WorldCover trees
  work.py          Chamba — INEGI DENUE businesses, estimated jobs
  chronicle.py     La Gaceta: weekly snapshot (history.json) + entries (chronicle.json)
  run.py           orchestration, stats.json, manifest.json
pipeline/manual/   hand-downloaded sources (trimmed CONAPO/CONEVAL CSVs are committed)
public/data/       pipeline output served by the site (committed)
src/
  App.tsx          state: mode, selection, groups, cards; keyboard 1–7 / Esc
  data.ts          types for every data file + loadCore()
  modes.ts         mode list, colour ramps and MapLibre colour expressions
  i18n.ts          Spanish strings and number/date formatting (es-MX)
  describe.ts      plain-language one-line description of a barrio
  analytics.ts     dataLayer events for Google Tag Manager
  map/             MapView (layers, lazy loading, crossfade, interaction), base style
  art/             SVG art: heraldry, landmark tokens, critters, trees, business icons, portrait
  ui/              Ledger (HUD), ModeBar, Legend, Tooltip, ProvincePanel (ficha), Chronicle, cards, Welcome
```

## Adding or changing a map mode

Follow the existing pattern (Fauna / Calor / Verde / Chamba are good templates):

1. `pipeline/hlm/<mode>.py`: fetch via `fetch()` (cache + manual fallback), register a `Provenance`, set
   `manifest.layer(<mode>, "ok" | "unavailable", [...])`, add per-AGEB fields with a short prefix, return
   a stats dict. On failure: mark unavailable, return `{}` — never raise past `run.py` for a data outage.
2. `run.py`: call it, add breaks to `stats["breaks"]`, add the section to `stats`, add the field rules to
   `CARRY` so `--skip` keeps old numbers.
3. `chronicle.py`: Gaceta entries only from measured numbers, each with a `source`; kinds share a family
   prefix (`work`, `work_new`, …) so partial runs replace only their own entries.
4. Frontend: types in `data.ts`, ramp + expression in `modes.ts`, fill layer + lazy point layer in
   `MapView.tsx` (fetch on first open of the mode), legend (plain words + source + year), tooltip, ficha
   section, credits.
5. Document the dataset and its rules in `DATA.md`; update `pipeline/README.md`.

## Gotchas learned the hard way

- **Census dwelling denominators**: `VPH_*` include dwellings without occupant info → divide by `VIVPARH_CV`,
  not `VIVPAR_HAB` (that produced 540 %). Empty homes use `TVIVPAR`.
- **CONEVAL GRS has five grades**, not three.
- **CONAPO / CONEVAL portals return 403 to scripts.** Don't try to bypass it; use `pipeline/manual/`.
- **Planetary Computer SAS tokens** are per collection: `/api/sas/v1/token/landsat-c2-l2`, `sentinel-2-l2a`,
  `esa-worldcover`.
- **Standalone SVGs must be valid XML** (e.g. no duplicate `stroke-width`) or `addImage` silently fails —
  use the `ow()` helper pattern and keep `onerror` handlers.
- **MapLibre markers set inline opacity**: hide them with a class (`display:none` / child opacity), not
  container opacity.
- **Zoom in filters**: use `minzoom` on separate layers rather than `['zoom']` inside `filter`.
- **Cloudflare Pages is now Workers static assets**: deploy with `wrangler deploy` and `wrangler.toml [assets]`;
  `public/_headers` sets caching (`/data/*` 1 h, `/assets/*` immutable).
- The browser pane in a hidden tab throttles animation frames; slow first paint there is not a real bug.
- 79 outlying-town AGEBs (Bahía de Kino, Miguel Alemán, San Pedro) are outside the satellite bbox: Calor and
  Verde show "sin datos" there by design.

## Weekly Action (`.github/workflows/weekly-refresh.yml`)

Mondays 06:00 UTC: restore `pipeline/.cache`, drop OSM + iNaturalist caches, run
`hlm.run --skip blocks,streets`, commit `public/data`, build and `wrangler deploy`.
Repo secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, optional `PC_SDK_SUBSCRIPTION_KEY`.

## Analytics

Google Tag Manager `GTM-M9MFZ7RP` in `index.html` (skipped on localhost) → GA4. Custom dataLayer events:
`cambio_modo`, `abrir_barrio`, `ver_ficha_punto` (see `src/analytics.ts`).

## Commits

Small, focused commits with a clear message. Never commit `.env`, tokens, `pipeline/.cache/`, or full national
source files. Regenerate `public/data/` with the pipeline rather than editing it by hand.
