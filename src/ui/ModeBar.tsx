import { Concho, LockIcon, ModeIcon } from '../art/icons'
import type { Manifest } from '../data'
import { t } from '../i18n'
import { MODES, modeState, type ModeId } from '../modes'

/** Map modes as silver conchos on a leather belt. */
export function ModeBar({ manifest, mode, setMode }: { manifest: Manifest; mode: ModeId; setMode: (m: ModeId) => void }) {
  return (
    <nav className="modebar" aria-label="Modos del mapa">
      {MODES.map((m, i) => {
        const st = modeState(manifest, m.id)
        const label = t(m.label)
        const sub = st === 'soon' ? t('soon') : st === 'unavailable' ? t('unavailable') : ''
        return (
          <button
            key={m.id}
            className={`mode-btn mode-${m.id}${mode === m.id ? ' active' : ''} ${st}`}
            onClick={() => setMode(m.id)}
            aria-pressed={mode === m.id}
            aria-label={sub ? `${label} — ${sub}` : label}
            title={`${m.hint}${sub ? ` (${sub.toLowerCase()})` : ''} · tecla ${i + 1}`}
          >
            <span className="concho">
              <Concho />
              <ModeIcon id={m.id} />
              {st !== 'ok' && <span className="mode-lock"><LockIcon /></span>}
            </span>
            <span className="mode-label">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
