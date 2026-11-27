"""Colonias: which colonia names fall in each AGEB, for the search box and the ficha.

INEGI publishes the official list of colonias (catálogo de asentamientos) but without shapes, so
the place of each colonia comes from INEGI DENUE: every business row carries its colonia name
(NOMB_ASENT) and its AGEB keys (CVE_LOC + CVE_AGEB).

Rules:
- The colonia ↔ AGEB link is DERIVED (where registered businesses are), so the UI calls it approximate.
- A colonia needs at least `MIN_BIZ` businesses. A colonia–AGEB pair is kept when the AGEB holds at
  least `MIN_SHARE` of the colonia's businesses, or the colonia makes up at least `MIN_AGEB_SHARE` of
  the AGEB's businesses (with `MIN_BIZ` or more there). The colonia's top AGEB is always kept. This
  drops mis-coded rows.
- Names are shown as written in the INEGI catalog when the normalised name matches; otherwise the
  DENUE name is title-cased.
- Colonias with no registered business cannot be placed and are left out.
- Only names and AGEB keys are copied: no business names, addresses or phones.
"""
from __future__ import annotations

import csv
import io
import json
import re
import unicodedata
import zipfile
from collections import Counter, defaultdict

from .common import ENT, MUN, OUT, Manifest, Provenance, SourceUnavailable, fetch, write_json
from .work import URL as DENUE_URL, ZIP_NAME as DENUE_ZIP, _edition, _title

CAT_URL = f"https://gaia.inegi.org.mx/wscatgeo/v2/asentamientos/{ENT}/{MUN}"
CAT_NAME = "inegi_asentamientos_26030.json"
LICENSE = "Términos de Libre Uso de la Información del INEGI"
MIN_BIZ = 2
MIN_SHARE = 0.15
MIN_AGEB_SHARE = 0.25
MAX_PER_AGEB = 3
PLAIN_TYPE = {"Localidad": "Poblado"}  # "Localidad" next to "Pueblo" reads as jargon


def norm(s: str) -> str:
    s = unicodedata.normalize("NFD", s or "")
    s = "".join(ch for ch in s if unicodedata.category(ch) != "Mn")
    return re.sub(r"[^A-Z0-9]+", " ", s.upper()).strip()


def _catalog(manifest: Manifest) -> dict[str, tuple[str, str]]:
    """normalised name -> (official name, type); {} if the catalog cannot be read."""
    try:
        d = json.loads(fetch(CAT_URL, CAT_NAME, max_age_days=30).read_text(encoding="utf-8"))
        rows = d.get("datos") or []
    except (SourceUnavailable, ValueError) as e:
        print(f"  ! asentamientos catalog unavailable: {e}")
        return {}
    manifest.add(Provenance(id="inegi_asentamientos", name="Catálogo de asentamientos humanos (colonias)",
                            url=CAT_URL, license=LICENSE, publisher="INEGI",
                            vintage=(rows[0].get("periodo") if rows else "?") or "?",
                            notes="Official colonia names and types (no shapes); used only to write names."))
    out = {}
    for r in rows:
        nm, tp = (r.get("nom_asen") or "").strip(), (r.get("tipo_asen") or "").strip()
        if nm:
            out.setdefault(norm(nm), (nm, "" if tp == "NINGUNO" else tp.capitalize()))
    return out


def build_names(manifest: Manifest, agebs: list[dict]) -> dict:
    try:
        path = fetch(DENUE_URL, DENUE_ZIP, max_age_days=6, timeout=600)
    except SourceUnavailable as e:
        print(f"  ! DENUE unavailable: {e}")
        manifest.layer("names", "unavailable", ["inegi_denue"])
        return {}

    z = zipfile.ZipFile(path)
    edition, _ = _edition(z)
    csv_name = next(n for n in z.namelist() if n.startswith("conjunto_de_datos/") and n.endswith(".csv"))
    rows = csv.DictReader(io.TextIOWrapper(z.open(csv_name), encoding="latin-1", newline=""))

    keys = {a["cvegeo"] for a in agebs}
    per: dict[str, Counter] = defaultdict(Counter)  # normalised colonia -> AGEB -> businesses
    raw: dict[str, Counter] = defaultdict(Counter)  # normalised colonia -> spelling / type seen
    for r in rows:
        if r["CVE_ENT"] != ENT or r["CVE_MUN"] != MUN:
            continue
        nm = (r["NOMB_ASENT"] or "").strip()
        k = norm(nm)
        if not k or k in ("NINGUNO", "SIN NOMBRE", "NA"):
            continue
        key = ENT + MUN + r["CVE_LOC"].strip().zfill(4) + r["CVE_AGEB"].strip().upper().zfill(4)
        if key not in keys:
            continue
        per[k][key] += 1
        raw[k][(nm, (r["TIPO_ASENT"] or "").strip())] += 1

    if not per:
        manifest.layer("names", "unavailable", ["inegi_denue"])
        return {}

    ageb_total: Counter = Counter()
    for cnt in per.values():
        ageb_total.update(cnt)

    cat = _catalog(manifest)
    colonias, by_ageb = [], defaultdict(list)  # cvegeo -> [(businesses, name)]
    matched = 0
    for k, cnt in per.items():
        total = sum(cnt.values())
        if total < MIN_BIZ:
            continue
        ranked = cnt.most_common()
        keep = [a for i, (a, n) in enumerate(ranked)
                if i == 0 or n / total >= MIN_SHARE or (n >= MIN_BIZ and n / ageb_total[a] >= MIN_AGEB_SHARE)]
        if k in cat:
            name, typ = cat[k]
            matched += 1
        else:
            (dn, dt), _ = raw[k].most_common(1)[0]
            name, typ = _title(dn), ("" if dt.upper() in ("", "NINGUNO") else dt.capitalize())
        typ = PLAIN_TYPE.get(typ, typ)
        colonias.append({"n": name, "t": typ, "a": keep})
        for a in keep:
            by_ageb[a].append((cnt[a], name))

    colonias.sort(key=lambda c: norm(c["n"]))
    for a in agebs:
        names = [n for _, n in sorted(by_ageb.get(a["cvegeo"], []), key=lambda x: -x[0])]
        a["col"] = names[:MAX_PER_AGEB] or None

    write_json(OUT / "colonias.json", {"edition": edition, "c": colonias})
    srcs = ["inegi_denue"] + (["inegi_asentamientos"] if cat else [])
    manifest.layer("names", "ok", srcs)
    n_ageb = sum(1 for a in agebs if a.get("col"))
    print(f"  colonias: {len(colonias)} placed ({matched} matched to the INEGI catalog), {n_ageb} AGEBs named")
    return {"n": len(colonias), "matched": matched, "agebs": n_ageb}
