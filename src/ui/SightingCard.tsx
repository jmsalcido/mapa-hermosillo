import { critterSVG, GROUP_INFO } from '../art/critters'
import type { SightingInfo } from '../map/MapView'
import { SIZE_LABEL, WORK_INFO, workSVG } from '../art/work'

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

const LICENSE: Record<string, string> = {
  cc0: 'dominio público (CC0)', 'cc-by': 'CC BY', 'cc-by-nc': 'CC BY-NC', 'cc-by-sa': 'CC BY-SA',
  'cc-by-nd': 'CC BY-ND', 'cc-by-nc-sa': 'CC BY-NC-SA', 'cc-by-nc-nd': 'CC BY-NC-ND',
}

/** Card for one iNaturalist sighting. Hover shows it; a click pins it with a link to the photo. */
export function SightingCard({ info, onClose }: { info: SightingInfo; onClose: () => void }) {
  if (info.b) return <BizCard info={info} onClose={onClose} />
  const { pinned } = info
  const s = info.s!
  const g = GROUP_INFO[s.g]
  const date = s.d ? new Date(s.d + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) : null
  const left = Math.min(info.x + 16, window.innerWidth - 290)
  const top = Math.min(Math.max(info.y - 30, 70), window.innerHeight - 220)
  return (
    <div className={`sighting card${pinned ? ' pinned' : ''}`} style={{ left, top }} role={pinned ? 'dialog' : 'status'}>
      <div className="sighting-head">
        <span dangerouslySetInnerHTML={{ __html: critterSVG(s.g, 42) }} />
        <div>
          <div className="tt-title">{s.n}</div>
          {s.s && s.s !== s.n && <div className="tt-sub"><i>{s.s}</i></div>}
        </div>
        {pinned && <button className="close" onClick={onClose} aria-label="Cerrar">✕</button>}
      </div>
      <div className="tt-stat">
        Un {g.one} visto{date ? ` el ${date}` : ''}.{s.w ? <b> ¡Nuevo esta semana!</b> : null}
      </div>
      <div className="sighting-credit">Foto y registro: {s.u ?? 'anónimo'} en iNaturalist · {LICENSE[s.l] ?? s.l}</div>
      {pinned ? (
        <a className="sighting-link" href={`https://www.inaturalist.org/observations/${s.i}`} target="_blank" rel="noreferrer">
          Ver la foto en iNaturalist ↗
        </a>
      ) : (
        <div className="tt-hint">Haz clic para ver la foto</div>
      )}
    </div>
  )
}

/** Card for one DENUE business. No phone, e-mail or address is shown: only what it is and its size. */
function BizCard({ info, onClose }: { info: SightingInfo; onClose: () => void }) {
  const b = info.b!
  const g = WORK_INFO[b.g]
  const [y, m] = (b.a ?? '').split('-')
  const left = Math.min(info.x + 16, window.innerWidth - 290)
  const top = Math.min(Math.max(info.y - 30, 70), window.innerHeight - 200)
  return (
    <div className={`sighting card${info.pinned ? ' pinned' : ''}`} style={{ left, top }} role={info.pinned ? 'dialog' : 'status'}>
      <div className="sighting-head">
        <span dangerouslySetInnerHTML={{ __html: workSVG(b.g, 42) }} />
        <div>
          <div className="tt-title">{b.n}</div>
          <div className="tt-sub">{b.act ?? g.name}</div>
        </div>
        {info.pinned && <button className="close" onClick={onClose} aria-label="Cerrar">✕</button>}
      </div>
      <div className="tt-stat">
        {b.s >= 0 ? <>Trabajan aquí <b>{SIZE_LABEL[b.s]} personas</b>.</> : <>No se sabe cuánta gente trabaja aquí.</>}
      </div>
      {y && <div className="sighting-credit">En el directorio del INEGI desde {m ? `${MONTHS[Number(m) - 1]} de ` : ''}{y}.</div>}
    </div>
  )
}
