import { t } from '../i18n'
import { SKINS, type Skin } from '../skin'

/** Style switch: three buttons on wide screens, one "next style" button on narrow ones. */
export function SkinToggle({ skin, setSkin }: { skin: Skin; setSkin: (s: Skin) => void }) {
  const next = SKINS[(SKINS.indexOf(skin) + 1) % SKINS.length]
  return (
    <div className="skin-toggle" role="group" aria-label={t('skin_label')} title={t('skin_label')}>
      {SKINS.map(s => (
        <button key={s} aria-label={t(`skin_${s}`)} className={`skin-opt${skin === s ? ' on' : ''}`} aria-pressed={skin === s} onClick={() => setSkin(s)}>
          {s === 'atlas' ? <>Atlas<span className="skin-long"> antiguo</span></> : t(`skin_${s}`)}
        </button>
      ))}
      <button className="skin-cycle" aria-label={`${t('skin_label')}: ${t(`skin_${skin}`)}. Cambiar a ${t(`skin_${next}`)}`} onClick={() => setSkin(next)}>
        {next === 'atlas' ? 'Atlas' : t(`skin_${next}`)} ›
      </button>
    </div>
  )
}
