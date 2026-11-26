# Datos — Hermosillo: El Mapa Vivo

Every number in the app comes from an open, citable source. Each pipeline run writes
`public/data/manifest.json` with the source URL, license, vintage, retrieval date and status of
every input; the in-app "Créditos de datos" table is rendered from it. When a source fails, its
layer is marked `unavailable` and the UI says **"Datos no disponibles"**: no placeholder values.

Spatial unit: INEGI **AGEB urbana** (key `CVEGEO`, 13 characters). Sonora = `26`, Hermosillo = `030`.

## Status of each dataset

| Mode / layer | Dataset | Publisher | Vintage | Update frequency | License | Status |
|---|---|---|---|---|---|---|
| Base: AGEB boundaries | Marco Geoestadístico, AGEB urbanas (`wscatgeo/v2/geo/agebu/26/030`) | INEGI | Dec 2025 | Yearly (Dec) | INEGI Términos de libre uso | **Built** |
| Base: blocks | Marco Geoestadístico, manzanas (`…/mza/26/030`) | INEGI | Dec 2025 | Yearly | INEGI Términos de libre uso | **Built** (loaded lazily at zoom ≥ 13.4) |
| Base: streets | Marco Geoestadístico, vialidades (`…/vialidades/26/030`) | INEGI | Dec 2025 | Yearly | INEGI Términos de libre uso | **Built** (major roads up front, minor roads lazy) |
| Base: landmarks, water, river, parks, neighbourhood names | OpenStreetMap via Overpass API (bbox 28.90–29.25 N, −111.15 to −110.85) | OSM contributors | live | Weekly | ODbL 1.0 | **Built** |
| Base: sea (Gulf of California) | Natural Earth 1:10m ocean polygons (`ne_10m_ocean.geojson`), clipped to −113.2…−109.7, 27.8…30.2 | Natural Earth | v5.1 | Static (cached a year) | Public domain | **Built**. Shoreline is approximate up close (1:10 M scale); drawn under the barrios |
| Base: hillshade | AWS Terrain Tiles (Terrarium; SRTM, ETOPO1, USGS NED) | Mapzen / AWS Open Data | static | — | Attribution | **Live tiles** (fetched by the browser) |
| Territorios | k-means of population-weighted AGEB centroids | derived | — | Per run | CC-BY 4.0 (derived) | **Built — a visual grouping, not official districts** |
| People | Censo de Población y Vivienda 2020, AGEB y manzana urbana (CSV) | INEGI | 2020 | Decennial (next: 2030) | INEGI Términos de libre uso | **Built** |
| People (optional) | WorldPop 2023, 100 m grid | WorldPop | 2023 | Yearly | CC-BY 4.0 | Not built (would be labelled *modelled*) |
| Wealth | Índice de Marginación Urbana 2020 by AGEB (`imu_2020.csv`, dataset `indices_marginacion`) | CONAPO | 2020 | Each census | CC-BY 4.0 | **Built** from a hand-downloaded copy (`pipeline/manual/`). 530 AGEBs, 99.4 % of residents. Primary colour of the Bienestar mode |
| Wealth | Grado de Rezago Social 2020 by AGEB (`grs_ageb_2020.csv`, dataset `rezago_social`) | CONEVAL | 2020 | Each census | CC-BY 4.0 | **Built** from a hand-downloaded copy. 621 AGEBs, 99.6 % of residents. Five grades. Shown in the ficha |
| Heat | Landsat 8/9 Collection 2 Level-2 surface temperature (ST_B10), via Microsoft Planetary Computer STAC | USGS / NASA | 22 clear scenes, Jun–Aug 2023–2025, path/row 035/040 | Yearly (add a new summer) | Public domain | **Built**: per-pixel median composite → per-AGEB mean, plus `heat.png` |
| Heat (HUD) | NASA POWER daily T2M_MAX at 29.073, −110.955 | NASA | daily, a few days' lag | Weekly | Public domain | **Built** (reanalysis, labelled *modelado*) |
| Green | Sentinel-2 L2A NDVI per AGEB, via Planetary Computer (tiles 12RVT + 12RWT) | Copernicus / ESA | last 30 days, plus the same window a year earlier | Weekly | Copernicus open licence | **Built** (14 clear passes now, 20 a year ago on the first run) |
| Green | ESA WorldCover 2021 v200, tiles N27W111 + N27W114 | ESA | 2021 | Static (cached) | CC-BY 4.0 | **Built**: % tree cover per AGEB and 6,030 cartoon-tree points. Labelled as a satellite estimate |
| Wildlife | iNaturalist observations, research grade, animals only (`iconic_taxa` = Aves, Reptilia, Mammalia, Amphibia, Insecta, Arachnida, Mollusca, Actinopterygii, Animalia), same bbox | iNaturalist | live | Weekly | Per observation: only CC0 / CC BY / CC BY-NC (and -SA/-ND variants) kept, observer credited | **Built**: 12,822 licensed of 17,505; 12,456 drawn; 6,082 inside urban AGEBs |
| Work | DENUE Sonora (`denue_26_csv.zip`, filtered to `CVE_MUN = 030`) | INEGI | edition 11/2026 (published 2026-11-25) | Twice a year (May / Nov); checked weekly | INEGI Términos de libre uso | **Built**: 39,145 businesses; 38,943 in urban AGEBs. Jobs per AGEB are *estimated* |
| Water | REPDA — Registro Público de Derechos de Agua (CSV release: titles + location annexes, incl. irrigation districts), filtered to state 26 / municipio 30 | CONAGUA (unmodified releases preserved on Zenodo, record 24183265) | release 2025-06 (last registration 2025-06-11) | CONAGUA replaces its archive irregularly; the Zenodo record is checked weekly | Términos de Libre Uso MX (data); CC BY 4.0 (archive docs) | **Built**: 2,146 wells and intakes, 732 hm³/year authorised. Volumes are what titles allow, not metered |
| Water | Monitor de Sequía de México, municipal table (`MunicipiosSequia.xlsx`) | SMN / CONAGUA | every 15 days since 2003 | Twice a month; checked weekly | Términos de Libre Uso MX | **Built**: current level, since when, and a 3-year sparkline |
| Water | Censo 2020 `VPH_TINACO`, `VPH_CISTER`, `VPH_AGUADV` | INEGI | 2020 | Decennial | INEGI Términos de libre uso | **Built**: map colour = % of homes with a tinaco |
| Water (not built) | Dam levels (Abelardo L. Rodríguez, El Novillo) — SINA | CONAGUA | — | — | — | **Blocked for scripts** (Incapsula bot wall). Free alternative: water area seen by Sentinel-2 |
| Water (not built) | Aquifer availability (DOF 9 Nov 2023) | CONAGUA / DOF | 2023 | Every few years | — | Not built: would need a small hand-made table in `pipeline/manual/` |
| Work (HUD) | Formal jobs, IMSS | IMSS | monthly | Monthly | Datos abiertos IMSS | Not built (the HUD shows the DENUE business count instead) |

## How figures are handled

- **Boundaries vs. statistics:** boundaries are from Dec 2025 and figures from the 2020 census; they are joined
  by `CVEGEO`. 673 AGEBs exist in the 2025 framework and 665 have census rows. The 11 AGEBs without a match
  (created after 2020, or re-keyed) are drawn with a dashed outline and flagged "Barrio nuevo", never filled
  with estimates.
- **Confidential cells:** INEGI replaces small counts with `*`. They are stored as `null` and shown as "—",
  never as 0. A block with a real `0` residents is shown as 0.
- **Derived ratios** (density, % of homes with internet, etc.) are computed only from census counts. Areas
  use a local equirectangular projection (error < 0.5 % at city scale).
- **Territorios** are a game construct for the zoomed-out view. Their names combine the nearest OSM
  neighbourhood inside the territory with a compass title (*Comarca* = inner ring, *Frontera* = outer ring,
  *El Corazón* = centre). The UI says so in the legend.
- **Province descriptions and vignettes** are generated only from that AGEB's census values, and are labelled as illustrations.

## Census percentages (audited 2026-11-26)

| Shown as | Numerator | Denominator | Why that denominator |
|---|---|---|---|
| Hogares con internet / troca / computadora / agua / drenaje | `VPH_INTER`, `VPH_AUTOM`, `VPH_PC`, `VPH_AGUADV`, `VPH_DRENAJ` | `VIVPARH_CV` | The `VPH_*` counts include dwellings without occupant information; `VIVPARH_CV` is the only total that includes them too |
| Casas vacías | `VIVPAR_DES` | `TVIVPAR` | Private dwellings only (`VIVTOT` adds collective housing) |
| Con trabajo (de quienes trabajan o buscan) | `POCUPADA` | `PEA` | INEGI's labour-force base |
| Sin servicio médico, edades | `PSINDER`, `POB0_14`, `POB15_64`, `POB65_MAS` | `POBTOT` | |
| Casas con gente (count) | `TVIVPARHAB` | | Full count of inhabited private dwellings |

An earlier version divided the `VPH_*` counts by `VIVPAR_HAB`, which excludes dwellings without occupant
information, and showed values up to 540 %. The pipeline now stops if any share falls outside 0–100 %
(`people.check_ratios`).

## Fauna rules

- **Only openly licensed observations** are used (4,683 "all rights reserved" observations are excluded). Each point keeps
  its observer's iNaturalist username and licence, shown on the sighting card with a link to the original.
- **Hidden locations stay hidden.** iNaturalist blurs coordinates of threatened species and private observations
  (366 here). They count in city totals but are never drawn or assigned to a barrio.
- Positions less precise than 500 m are drawn but not counted for a barrio.
- **Counts measure observer effort, not wildlife abundance.** Parks, the university and the river get more reports
  because more people photograph there. The legend says so in plain words.
- "New this week" = observations **uploaded** in the last 7 days (an upload can be of an older sighting).
- La Gaceta's weekly entries come from `public/data/history.json` (one snapshot per ISO week) and are only
  generated from those numbers.

## Calor rules

- Landsat measures **land-surface temperature** (ground, roofs, pavement) at the ~10:40 local overpass, **not air
  temperature**. Values of 50–60 °C are normal for Hermosillo summers. The UI says "suelo y techos, no del aire".
- Clouds, cloud shadows and cirrus are removed per pixel with `QA_PIXEL`. Scenes less than 80 % clear over the city
  are dropped. The composite is the per-pixel median of the remaining scenes, so a single odd day does not dominate.
- Per AGEB: mean of composite pixels whose centre falls inside the AGEB (at least 3 pixels).
- Finding, checked in numbers: urban AGEBs average 53.6 °C while the surrounding desert averages 58.1 °C. Hermosillo
  behaves as a summer "cool island" relative to bare desert. The hottest barrios are new, bare developments at the edge.
- The HUD's "Máxima" is NASA POWER reanalysis at a ~0.5° cell: one value for the whole city, arriving a few days late.

## Verde rules

- **NDVI now** = per-pixel median of clear Sentinel-2 observations in the last 30 days (20 m). Clouds, shadows,
  cirrus and dark pixels are removed with the SCL scene classification. Reflectance uses the −1000 BOA offset for
  processing baseline ≥ 04.00.
- **A year ago** = the same 30-day window one year earlier, so the comparison isn't distorted by seasons. Weekly
  changes per territory come from `history.json` from the second weekly run on.
- **"Se ve verde"** = share of pixels with NDVI ≥ 0.3 (living, irrigated vegetation or trees in this climate).
- **Trees** = WorldCover 2021 class 10. One cartoon tree per 60 m cell that is ≥ 25 % tree cover, inside barrios,
  sized by that spot's current NDVI. It is **not a tree inventory**; the UI says so.
- The outlying towns (Bahía de Kino, Miguel Alemán, San Pedro) are outside the city bbox, so Calor and Verde show
  "sin datos" there (79 AGEBs).

## Chamba rules

- **Businesses** come from DENUE and are assigned to an AGEB by DENUE's own `CVE_LOC` + `CVE_AGEB`, not by geometry.
  202 businesses have no urban AGEB; they are still drawn on the map.
- **Jobs are an estimate.** DENUE only gives a size range (`PER_OCU`). Each business counts as the midpoint:
  0–5 → 3, 6–10 → 8, 11–30 → 20, 31–50 → 40, 51–100 → 75, 101–250 → 175, 251+ → 300 (a deliberately low
  guess for the open range). The legend, ficha and Gaceta all say "cerca de" / "cálculo".
- **Colour** = estimated jobs per km² (where people work, not where they live), six quantile classes.
- **Groups** by the first two SCIAN digits: tiendas (43, 46), comida (72), talleres (81), oficinas (51–56, 93),
  fábricas/obras/bodegas (11, 21–23, 31–33, 48–49), escuelas/salud/diversión (61, 62, 71).
- Only the name, activity, size range and month the business entered the directory are published. Phones,
  e-mails, web sites and street addresses are not copied into the app.
- Informal work (street stalls without a fixed place, work from home) is not in DENUE; the legend says so.
- La Gaceta writes Chamba entries only when INEGI publishes a new edition (or the first time).

## Agua rules

- **Water rights** come from REPDA. `datos.conagua.gob.mx` answers scripts with a bot wall (Incapsula), so the
  pipeline reads the newest release in the Zenodo record that preserves CONAGUA's own archives unmodified
  (`repda_zenodo_record.json` is re-checked every 6 days; each `REPDA_YYYY-MM.zip` is cached for good). Don't
  try to get past the bot wall; a hand-downloaded `pipeline/manual/REPDA_YYYY-MM.zip` is the fallback.
- Points are wells (`ANEXOS_SUBTERRANEOS*`) and surface intakes (`ANEXOS_SUPERFICIALES*`) whose state/municipio
  keys are 26/30. The 450 wells of Distrito de Riego 051 (Costa de Hermosillo) come from the `*_DTTOS` files and
  belong to the users' association. 4 points without valid coordinates are counted but not drawn.
- **Volumes are what each title authorises per year, not what is pumped.** Legend, card, ficha and Gaceta say so.
  "Albercas olímpicas" = volume ÷ 2,500 m³, rounded.
- **Uses**: AGRÍCOLA → campo; PÚBLICO URBANO → ciudad; INDUSTRIAL, AGROINDUSTRIAL, GENERACIÓN DE ENERGÍA → industria;
  PECUARIO → ganado; everything else (DIFERENTES USOS, SERVICIOS, DOMÉSTICO…) → otros.
- **Privacy**: a holder is named only if it looks like a company, ejido, association or public body
  (`water.is_entity`: legal suffixes S.A., S.P.R., S. de R.L., A.C., SAPI…, or words like EJIDO, MUNICIPIO,
  COMISIÓN, AGUA DE HERMOSILLO). Everyone else is "Particular" and their point is rounded to 3 decimals
  (~100 m). Top-holder lists merge spellings of the same company (`water.holder_key`).
- **Drought**: in the SMN table an empty cell means *sin sequía* (its NOTAS sheet says so), so it is level 0,
  not missing. Levels: sin, D0 anormalmente seco, D1–D4 moderada → excepcional. Missing reports (Aug 2003,
  Feb 2004) are simply absent columns.
- **Colour** = % of homes with a tinaco (`VPH_TINACO / VIVPARH_CV`), six quantile classes. Cisterns are too rare
  (median 2 %) to colour the map; they are shown in the ficha.
- La Gaceta writes Agua entries when the drought level changes or a new REPDA release appears (or the first time).

## Known gaps

- **No public tree inventory** for Hermosillo. The Green mode will draw trees as an NDVI proxy and say so.
- **No open zoning or parcel (catastro) GIS.** Land use is limited to OSM tags and ESA WorldCover classes.
- **IMSS formal jobs and weather are city-wide only**, so they appear in the HUD and not per AGEB.
- **No official district layer**, hence the derived *territorios*.
- **CONAPO / CONEVAL downloads are blocked for scripts** from some networks (Akamai 403). The CSVs were
  downloaded in a browser and placed in `pipeline/manual/` (see `pipeline/README.md`). The weekly Action does
  not refetch them.
- **IMU skips very small AGEBs** (143 of 673, almost all with few or no residents). They show "sin datos".
  One CONEVAL AGEB (`260300001017A`) has no match in the Dec 2025 boundaries.
- The 2020 census is getting old: fast-growing outer AGEBs (north-west, south) are under-counted
  relative to today.
- OSM coverage of named neighbourhoods is uneven (29 named places in the bbox), so several territories
  carry only a compass title.
