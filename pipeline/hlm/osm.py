"""OpenStreetMap via Overpass: landmarks, water, river bed, parks, peaks, neighbourhood names."""
from __future__ import annotations

import json

from shapely.geometry import LineString, Polygon, mapping
from shapely.ops import polygonize, unary_union

from .common import BBOX, OUT, Manifest, Provenance, SourceUnavailable, fetch, round_coords, write_json

ENDPOINTS = ["https://overpass-api.de/api/interpreter",
             "https://overpass.private.coffee/api/interpreter",
             "https://maps.mail.ru/osm/tools/overpass/api/interpreter"]
B = "{},{},{},{}".format(*BBOX)

POI_QUERY = f"""[out:json][timeout:180];
(
  nwr["amenity"="university"]["name"]({B});
  nwr["leisure"="stadium"]["name"]({B});
  nwr["shop"="mall"]["name"]({B});
  nwr["building"="cathedral"]({B});
  nwr["amenity"="place_of_worship"]["name"~"Catedral",i]({B});
  nwr["natural"="peak"]["name"]({B});
  nwr["tourism"~"museum|zoo|attraction"]["name"]({B});
  nwr["amenity"="hospital"]["name"]({B});
  nwr["aeroway"="aerodrome"]["name"]({B});
  nwr["name"~"Ford",i]["landuse"="industrial"]({B});
  nwr["name"~"Ford",i]["man_made"="works"]({B});
  nwr["name"~"Ford",i]["building"="industrial"]({B});
  node["place"~"suburb|neighbourhood|quarter"]["name"]({B});
);
out center tags;"""

GEOM_QUERY = f"""[out:json][timeout:180];
(
  nwr["natural"="water"]({B});
  nwr["landuse"="reservoir"]({B});
  way["waterway"~"river|stream|canal"]({B});
  nwr["leisure"~"park|garden"]["name"]({B});
);
out geom;"""


def _overpass(query: str, name: str):
    last = None
    for ep in ENDPOINTS:
        try:
            p = fetch(ep, name, data={"data": query}, retries=3, max_age_days=6)
            d = json.loads(p.read_text(encoding="utf-8"))
            if "elements" in d:
                return d
        except (SourceUnavailable, json.JSONDecodeError) as e:
            last = e
    raise SourceUnavailable(f"Overpass failed on every endpoint: {last}")


def _kind(t: dict) -> str | None:
    if t.get("place") in ("suburb", "neighbourhood", "quarter"):
        return "place"
    if "Ford" in t.get("name", "") and (t.get("landuse") == "industrial" or t.get("man_made") == "works"
                                         or t.get("building") == "industrial"):
        return "factory"
    if t.get("amenity") == "university":
        return "university"
    if t.get("leisure") == "stadium":
        return "stadium"
    if t.get("shop") == "mall":
        return "mall"
    if t.get("building") == "cathedral" or "catedral" in t.get("name", "").lower():
        return "cathedral"
    if t.get("natural") == "peak":
        return "peak"
    if t.get("amenity") == "hospital":
        return "hospital"
    if t.get("aeroway") == "aerodrome":
        return "airport"
    if t.get("tourism") in ("museum", "zoo", "attraction"):
        return t["tourism"]
    return None


def build_osm(manifest: Manifest) -> list[dict]:
    """Writes landmarks.geojson and water.geojson; returns neighbourhood place nodes."""
    prov = Provenance(id="osm", name="OpenStreetMap (Overpass API)", url="https://www.openstreetmap.org/copyright",
                      license="ODbL 1.0 — © OpenStreetMap contributors", publisher="OpenStreetMap contributors",
                      vintage="live", notes=f"bbox {BBOX}")
    places: list[dict] = []
    try:
        d = _overpass(POI_QUERY, "osm_pois.json")
        feats, seen = [], set()
        for e in d["elements"]:
            t = e.get("tags", {})
            k = _kind(t)
            lat = e.get("lat") or e.get("center", {}).get("lat")
            lon = e.get("lon") or e.get("center", {}).get("lon")
            if not k or lat is None:
                continue
            name = t.get("name", "")
            if k == "place":
                places.append({"name": name, "lat": lat, "lon": lon, "rank": t["place"]})
                continue
            if (k, name) in seen:
                continue
            seen.add((k, name))
            feats.append({"type": "Feature", "geometry": {"type": "Point", "coordinates": [round(lon, 5), round(lat, 5)]},
                          "properties": {"kind": k, "name": name, "ele": t.get("ele"), "osm": f"{e['type']}/{e['id']}"}})
        write_json(OUT / "landmarks.geojson", {"type": "FeatureCollection", "features": feats})
        manifest.layer("landmarks", "ok", ["osm"], count=len(feats))
        print(f"  OSM: {len(feats)} landmarks, {len(places)} named places")
    except SourceUnavailable as e:
        prov.status, prov.notes = "partial", str(e)
        manifest.layer("landmarks", "unavailable", ["osm"], reason=str(e))
        print(f"  ! OSM landmarks unavailable: {e}")

    try:
        d = _overpass(GEOM_QUERY, "osm_geom.json")
        feats = []
        for e in d["elements"]:
            t = e.get("tags", {})
            kind = ("river" if t.get("waterway") else "park" if t.get("leisure") else "water")
            g = None
            if e["type"] == "way" and "geometry" in e:
                pts = [(p["lon"], p["lat"]) for p in e["geometry"]]
                if kind != "river" and len(pts) >= 4 and pts[0] == pts[-1]:
                    g = Polygon(pts)
                elif len(pts) >= 2:
                    g = LineString(pts)
            elif e["type"] == "relation":
                outers = [LineString([(p["lon"], p["lat"]) for p in m["geometry"]])
                          for m in e.get("members", []) if m.get("role") == "outer" and m.get("geometry")]
                polys = list(polygonize(unary_union(outers))) if outers else []
                g = unary_union(polys) if polys else None
            if g is None or g.is_empty:
                continue
            if g.geom_type in ("Polygon", "MultiPolygon"):
                g = g.buffer(0).simplify(0.00003)
            else:
                if kind != "river":
                    continue
                g = g.simplify(0.00003)
            feats.append({"type": "Feature", "geometry": round_coords(mapping(g), 5),
                          "properties": {"kind": kind, "name": t.get("name", ""),
                                         "intermittent": t.get("intermittent") == "yes"}})
        write_json(OUT / "water_parks.geojson", {"type": "FeatureCollection", "features": feats})
        manifest.layer("water_parks", "ok", ["osm"], count=len(feats))
    except SourceUnavailable as e:
        prov.status, prov.notes = "partial", str(e)
        manifest.layer("water_parks", "unavailable", ["osm"], reason=str(e))
        print(f"  ! OSM water/parks unavailable: {e}")
    manifest.add(prov)
    return places


def cached_places() -> list[dict]:
    """Neighbourhood names from the last Overpass download (used when OSM is skipped)."""
    from .common import CACHE
    p = CACHE / "osm_pois.json"
    if not p.exists():
        return []
    d = json.loads(p.read_text(encoding="utf-8"))
    return [{"name": e["tags"]["name"], "lat": e["lat"], "lon": e["lon"], "rank": e["tags"]["place"]}
            for e in d.get("elements", []) if e.get("tags", {}).get("place") and "lat" in e and e["tags"].get("name")]
