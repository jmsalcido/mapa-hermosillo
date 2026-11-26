"""Base geometry from INEGI Marco Geoestadístico (Dec 2025): AGEBs, blocks, streets."""
from __future__ import annotations

import json

from shapely.geometry import shape, mapping

from .common import ENT, MUN, Manifest, Provenance, fetch, local_area_km2, round_coords, write_json, OUT

GAIA = "https://gaia.inegi.org.mx/wscatgeo/v2/geo"
MG_LICENSE = "INEGI Términos de libre uso de la información (compatible CC-BY 4.0)"



def _load(url: str, name: str) -> dict:
    return json.loads(fetch(url, name).read_text(encoding="utf-8"))


def load_agebs(manifest: Manifest) -> list[dict]:
    url = f"{GAIA}/agebu/{ENT}/{MUN}"
    gj = _load(url, "mg2025_agebu_26030.json")
    manifest.add(Provenance(
        id="inegi_mg_ageb", name="Marco Geoestadístico — AGEB urbanas", url=url,
        license=MG_LICENSE, publisher="INEGI", vintage=gj.get("metadatos", {}).get(
            "Fuente_informacion_vectorial", "Marco Geoestadístico, diciembre 2025"),
        notes="Boundaries are Dec 2025; census statistics are 2020 and joined by CVEGEO. "
              "AGEBs created after 2020 have no census figures."))
    out = []
    for f in gj["features"]:
        p = f["properties"]
        g = shape(f["geometry"])
        if not g.is_valid:
            g = g.buffer(0)
        out.append({"cvegeo": p["cvegeo"], "loc": p["cve_loc"], "ageb": p["cve_ageb"], "geom": g,
                    "area_km2": local_area_km2(g)})
    print(f"  {len(out)} AGEB geometries")
    return out


def build_blocks(manifest: Manifest, block_pop: dict[str, int | None]):
    url = f"{GAIA}/mza/{ENT}/{MUN}"
    gj = _load(url, "mg2025_mza_26030.json")
    manifest.add(Provenance(id="inegi_mg_mza", name="Marco Geoestadístico — Manzanas", url=url,
                            license=MG_LICENSE, publisher="INEGI", vintage="Marco Geoestadístico, diciembre 2025"))
    feats = []
    for f in gj["features"]:
        p = f["properties"]
        g = shape(f["geometry"]).simplify(0.00001, preserve_topology=True)
        if g.is_empty:
            continue
        pop = block_pop.get(p["cvegeo"])
        feats.append({"type": "Feature", "geometry": round_coords(mapping(g), 6),
                      "properties": {"id": p["cvegeo"], "pop": pop,
                                     "dens": round(pop / max(local_area_km2(g), 1e-6)) if pop is not None else None}})
    write_json(OUT / "blocks.geojson", {"type": "FeatureCollection", "features": feats})
    manifest.layer("blocks", "ok", ["inegi_mg_mza", "inegi_censo2020"], count=len(feats))


def build_streets(manifest: Manifest):
    url = f"{GAIA}/vialidades/{ENT}/{MUN}"
    gj = _load(url, "mg2025_vialidades_26030.json")
    manifest.add(Provenance(id="inegi_mg_vial", name="Marco Geoestadístico — Vialidades", url=url,
                            license=MG_LICENSE, publisher="INEGI", vintage="Marco Geoestadístico, diciembre 2025"))
    major, minor = [], []
    for f in gj["features"]:
        p = f["properties"]
        t = p.get("tipovial") or ""
        name = p.get("nomvial") or ""
        if name in ("Ninguno", "N/A"):
            name = ""
        g = shape(f["geometry"]).simplify(0.00002, preserve_topology=False)
        if g.is_empty:
            continue
        rank = 1 if t in ("Boulevard", "Carretera", "Periférico", "Calzada") else 2 if t == "Avenida" else 3
        feat = {"type": "Feature", "geometry": round_coords(mapping(g), 5),
                "properties": {"r": rank, **({"n": f"{t} {name}".strip()} if name and rank < 3 else {})}}
        (major if rank < 3 else minor).append(feat)
    write_json(OUT / "roads_major.geojson", {"type": "FeatureCollection", "features": major})
    write_json(OUT / "roads_minor.geojson", {"type": "FeatureCollection", "features": minor})
    manifest.layer("roads", "ok", ["inegi_mg_vial"], major=len(major), minor=len(minor))
