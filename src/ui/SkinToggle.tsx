import { t } from '../i18n'
import { SKINS, type Skin } from '../skin'

/** Two-way switch between the Norteño and Atlas antiguo looks. */
export function SkinToggle({ skin, setSkin }: { skin: Skin; setSkin: (s: Skin) => void }) {
  return (
    <div className="skin-toggle" role="group" aria-label={t('skin_label')} title={t('skin_label')}>
      {SKINS.map(s => (
        <button key={s} aria-label={t(`skin_${s}`)} className={skin === s ? 'on' : ''} aria-pressed={skin === s} onClick={() => setSkin(s)}>
          {s === 'atlas' ? <>Atlas<span className="skin-long"> antiguo</span></> : t('skin_norteno')}
        </button>
      ))}
    </div>
  )
}
