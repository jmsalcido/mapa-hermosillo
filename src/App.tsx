import { useEffect, useMemo, useRef, useState } from 'react'
import { loadCore, type Ageb, type CoreData, type Realm } from './data'
import { t } from './i18n'
import { track } from './analytics'
import { useSkin } from './skin'
import { MapView, type HoverInfo, type SightingInfo, type Tier } from './map/MapView'
import { GROUPS, type Group } from './art/critters'
import { WORK_GROUPS, type WorkGroup } from './art/work'
import { SightingCard } from './ui/SightingCard'
import { Welcome } from './ui/Welcome'
import { MODES, modeState, type ModeId } from './modes'
import { Chronicle } from './ui/Chronicle'
import { Credits } from './ui/Credits'
import { Ledger } from './ui/Ledger'
import { Legend } from './ui/Legend'
import { ModeBar } from './ui/ModeBar'
import { ProvincePanel } from './ui/ProvincePanel'
import { Tooltip } from './ui/Tooltip'
import { AtlasOverlay } from './art/AtlasOverlay'

export default function App() {
  const [data, setData] = useState<CoreData | null>(null)
  const [err, setErr] = useState(false)
  useEffect(() => {
    loadCore().then(setData, () => setErr(true))
  }, [])
  return data ? <Game data={data} /> : <Splash error={err} />
}

function Splash({ error }: { error: boolean }) {
  return (
    <div className="splash">
      <div className="splash-title">{t('title')}</div>
      <div className="splash-sub">{t('subtitle')}</div>
      <p>{error ? t('load_error') : t('loading')}</p>
    </div>
  )
}

function Game({ data }: { data: CoreData }) {
  const [mode, setMode] = useState<ModeId>('realm')
  const [skin, setSkin] = useSkin()
  const [hover, setHover] = useState<HoverInfo | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [tier, setTier] = useState<Tier>('realm')
  const [groups, setGroups] = useState<Set<Group>>(() => new Set(GROUPS))
  const [workGroups, setWorkGroups] = useState<Set<WorkGroup>>(() => new Set(WORK_GROUPS))
  const [sighting, setSighting] = useState<SightingInfo | null>(null)
  // a pinned card (clicked) survives hover-out; only an explicit map click or ✕ clears it
  const showSighting = (next: SightingInfo | null, explicit = false) =>
    setSighting(cur => (next ? (next.pinned || !cur?.pinned ? next : cur) : explicit || !cur?.pinned ? null : cur))

  const wealthPrimary = (data.manifest.layers.wealth?.primary as 'imu' | 'grs' | null) ?? null
  const agebById = useMemo(() => {
    const m = new Map<string, Ageb>()
    for (const f of data.agebs.features) m.set((f.properties as Ageb).cvegeo, f.properties as Ageb)
    return m
  }, [data])
  const realmById = useMemo(() => {
    const m = new Map<string, Realm>()
    for (const f of data.realms.features) m.set((f.properties as Realm).id, f.properties as Realm)
    return m
  }, [data])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return
      const n = Number(e.key)
      if (n >= 1 && n <= MODES.length) setMode(MODES[n - 1].id)
      if (e.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // analytics: mode switches, barrios opened, and pinned animal / business cards
  const lastMode = useRef(mode)
  useEffect(() => {
    if (lastMode.current === mode) return
    lastMode.current = mode
    track({ event: 'cambio_modo', modo: mode })
  }, [mode])
  const lastSkin = useRef(skin)
  useEffect(() => {
    if (lastSkin.current === skin) return
    lastSkin.current = skin
    track({ event: 'cambio_estilo', estilo: skin })
  }, [skin])
  useEffect(() => {
    const a = selected ? agebById.get(selected) : null
    if (a) track({ event: 'abrir_barrio', barrio: a.cvegeo, territorio: realmById.get(a.realm)?.name ?? realmById.get(a.realm)?.title ?? '' })
  }, [selected, agebById, realmById])
  useEffect(() => {
    if (!sighting?.pinned) return
    if (sighting.b) track({ event: 'ver_ficha_punto', tipo: 'negocio', grupo: sighting.b.g })
    else if (sighting.s) track({ event: 'ver_ficha_punto', tipo: 'animal', grupo: sighting.s.g })
  }, [sighting])

  const sel = selected ? agebById.get(selected) : null
  const st = modeState(data.manifest, mode)

  return (
    <div className={`game mode-${mode} skin-${skin}${sel ? ' has-panel' : ''}`}>
      <MapView
        data={data}
        mode={mode}
        skin={skin}
        wealthPrimary={wealthPrimary}
        selected={selected}
        onHover={setHover}
        onSelect={setSelected}
        onTier={setTier}
        groups={groups}
        workGroups={workGroups}
        onSighting={showSighting}
      />
      <div className="fx-clouds" aria-hidden="true">
        <span /><span /><span />
      </div>
      {mode === 'heat' && <div className="fx-haze" aria-hidden="true" />}
      {mode === 'wildlife' && (
        <div className="fx-birds" aria-hidden="true">
          <span /><span /><span />
        </div>
      )}
      <div className="fx-vignette" aria-hidden="true" />
      {skin === 'atlas' && <AtlasOverlay />}

      <Ledger data={data} skin={skin} setSkin={setSkin} />
      <Chronicle data={data} />
      {st !== 'ok' && (
        <div className="mode-banner card" role="status">
          <strong>{t(`m_${mode}`)}</strong> — {st === 'soon' ? t('soon') : t('unavailable')}
        </div>
      )}
      <Legend data={data} mode={mode} wealthPrimary={wealthPrimary} groups={groups} setGroups={setGroups} workGroups={workGroups} setWorkGroups={setWorkGroups} />
      <ModeBar manifest={data.manifest} mode={mode} setMode={setMode} skin={skin} />
      {hover && !sel && !sighting && window.matchMedia('(hover: hover)').matches && <Tooltip h={hover} mode={mode} tier={tier} skin={skin} />}
      {sighting && <SightingCard info={sighting} onClose={() => showSighting(null, true)} />}
      {sel && <ProvincePanel data={data} ageb={sel} realm={realmById.get(sel.realm)!} skin={skin} onClose={() => setSelected(null)} />}
      <Credits manifest={data.manifest} />
      <Welcome skin={skin} />
    </div>
  )
}
