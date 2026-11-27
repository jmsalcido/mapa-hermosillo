import { useEffect, useMemo, useRef, useState } from 'react'
import { loadColonias, type Ageb, type Colonias, type CoreData, type Realm } from '../data'
import { realmLabel } from '../atlasNames'
import { track } from '../analytics'
import type { Skin } from '../skin'

export interface SearchPick {
  cvegeos: string[]
  /** barrio to open in the ficha, if any */
  select: string | null
}

type Kind = 'colonia' | 'pueblo' | 'zona'
interface Entry { name: string; hint: string; kind: Kind; key: string; cvegeos: string[]; select: string | null }

/** lower-case, no accents, single spaces: "Bahía  de Kino" → "bahia de kino" */
export const fold = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9ñ]+/g, ' ').trim()

const MAX = 8

/** "Busca tu colonia": colonias (INEGI DENUE + catálogo), towns and Zonas, accent-insensitive. */
export function Search({ data, skin, onPick }: { data: CoreData; skin: Skin; onPick: (p: SearchPick) => void }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(false) // phones: the field opens from a button
  const [active, setActive] = useState(0)
  const [cols, setCols] = useState<Colonias | null | undefined>(undefined) // undefined = not loaded yet
  const input = useRef<HTMLInputElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const namesOk = data.manifest.layers.names?.status === 'ok'

  const ensure = () => {
    if (cols === undefined && namesOk) {
      setCols(null)
      loadColonias().then(c => setCols(c ?? null))
    }
  }

  const entries = useMemo(() => {
    const out: (Entry & { f: string })[] = []
    const byRealm = new Map<string, Ageb[]>()
    for (const f of data.agebs.features) {
      const a = f.properties as Ageb
      if (!byRealm.has(a.realm)) byRealm.set(a.realm, [])
      byRealm.get(a.realm)!.push(a)
    }
    for (const f of data.realms.features) {
      const r = f.properties as Realm
      const town = r.id.startsWith('L')
      const name = realmLabel(r, skin).zone
      const ag = byRealm.get(r.id) ?? []
      const biggest = town && ag.length ? ag.reduce((m, a) => ((a.pop ?? 0) > (m.pop ?? 0) ? a : m)).cvegeo : null
      const e = { name, hint: town ? 'Pueblo' : 'Zona', kind: (town ? 'pueblo' : 'zona') as Kind, key: 'r' + r.id, cvegeos: ag.map(a => a.cvegeo), select: biggest }
      out.push({ ...e, f: fold(name) })
      if (r.name && fold(r.name) !== fold(name)) out.push({ ...e, f: fold(r.name) })
    }
    for (const [i, c] of (cols?.c ?? []).entries()) {
      const n = c.a.length
      const hint = `${c.t || 'Colonia'} · ${n} ${n === 1 ? 'barrio' : 'barrios'}`
      out.push({ name: c.n, hint, kind: 'colonia', key: 'c' + i, cvegeos: c.a, select: c.a[0], f: fold(c.n) })
    }
    return out
  }, [data, cols, skin])

  const results = useMemo(() => {
    const k = fold(q)
    if (!k) return []
    const starts: Entry[] = [], word: Entry[] = [], inside: Entry[] = []
    const seen = new Set<string>()
    for (const e of entries) {
      if (seen.has(e.key)) continue
      const where = e.f.indexOf(k)
      if (where < 0) continue
      seen.add(e.key)
      ;(where === 0 ? starts : e.f[where - 1] === ' ' ? word : inside).push(e)
    }
    // towns and zones before colonias of the same name, then alphabetical
    const byName = (a: Entry, b: Entry) => Number(a.kind === 'colonia') - Number(b.kind === 'colonia') || a.name.localeCompare(b.name, 'es')
    return [...starts.sort(byName), ...word.sort(byName), ...inside.sort(byName)].slice(0, MAX)
  }, [q, entries])

  useEffect(() => setActive(0), [q])
  // Enter pressed while colonias.json was still loading: pick once results arrive
  const pending = useRef(false)
  useEffect(() => {
    if (pending.current && cols !== null && results[0]) {
      pending.current = false
      pick(results[0])
    }
  })
  useEffect(() => {
    if (expanded) input.current?.focus()
  }, [expanded])
  useEffect(() => {
    const away = (e: PointerEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) {
        setOpen(false)
        if (!q) setExpanded(false)
      }
    }
    document.addEventListener('pointerdown', away)
    return () => document.removeEventListener('pointerdown', away)
  }, [q])

  const pick = (e: Entry) => {
    track({ event: 'buscar_colonia', tipo: e.kind })
    onPick({ cvegeos: e.cvegeos, select: e.select })
    setQ(e.name)
    setOpen(false)
    setExpanded(false) // phones: give the map back to the ficha
    input.current?.blur()
  }

  const onKey = (ev: React.KeyboardEvent) => {
    if (ev.key === 'ArrowDown') { ev.preventDefault(); setOpen(true); setActive(i => Math.min(i + 1, results.length - 1)) }
    else if (ev.key === 'ArrowUp') { ev.preventDefault(); setActive(i => Math.max(i - 1, 0)) }
    else if (ev.key === 'Enter') {
      ev.preventDefault()
      if (cols === null && namesOk) pending.current = true
      else if (results[active]) pick(results[active])
    }
    else if (ev.key === 'Escape') {
      ev.stopPropagation()
      if (q) setQ('')
      else { setOpen(false); setExpanded(false); input.current?.blur() }
    }
  }

  const loading = cols === null && namesOk
  const showList = open && fold(q).length > 0
  return (
    <div ref={box} className={`search${expanded ? ' expanded' : ''}`} role="search">
      <button className="search-open card" aria-label="Buscar una colonia" onClick={() => setExpanded(true)}>
        <SearchIcon />
      </button>
      <div className="search-field card">
        <SearchIcon />
        <input
          ref={input}
          type="search"
          value={q}
          placeholder="Busca tu colonia…"
          aria-label="Busca tu colonia, pueblo o zona"
          role="combobox"
          aria-expanded={showList}
          aria-controls="search-list"
          aria-autocomplete="list"
          aria-activedescendant={showList && results[active] ? `search-opt-${active}` : undefined}
          autoComplete="off"
          spellCheck={false}
          onFocus={() => { ensure(); setOpen(true) }}
          onChange={e => { setQ(e.target.value); setOpen(true); pending.current = false }}
          onKeyDown={onKey}
        />
        {q && <button className="search-clear" aria-label="Borrar" onClick={() => { setQ(''); input.current?.focus() }}>✕</button>}
      </div>
      {showList && (
        <ul id="search-list" className="search-list card" role="listbox" aria-label="Resultados">
          {results.map((e, i) => (
            <li
              key={e.key}
              id={`search-opt-${i}`}
              role="option"
              aria-selected={i === active}
              className={i === active ? 'on' : undefined}
              onPointerEnter={() => setActive(i)}
              onPointerDown={ev => { ev.preventDefault(); pick(e) }}
            >
              <span className="search-name">{e.name}</span>
              <span className="search-hint">{e.hint}</span>
            </li>
          ))}
          {!results.length && (
            <li className="search-empty" role="presentation">
              {loading ? 'Buscando…' : namesOk
                ? 'No encontramos esa colonia. Solo aparecen las que tienen negocios registrados en el INEGI.'
                : 'Los nombres de colonias no están disponibles ahora. Puedes buscar pueblos y zonas.'}
            </li>
          )}
          {results.some(e => e.kind === 'colonia') && (
            <li className="search-note" role="presentation">
              Ubicación aproximada, según dónde están los negocios registrados en el INEGI.
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5 21 21" />
    </svg>
  )
}
