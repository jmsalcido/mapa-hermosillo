// Skins: the same real data dressed three ways.
//   sencillo → plain, modern and easy to read: white panels, Inter, no ornaments (default)
//   norteno  → leather, conchos and cattle brands
//   atlas   → an old hand-inked fantasy atlas (parchment, wax seals, coats of arms).
// Inspired by classic fantasy cartography in general; no names, words, scripts or art from any book or game.
import { useEffect, useState } from 'react'

export type Skin = 'sencillo' | 'norteno' | 'atlas'
export const SKINS: Skin[] = ['sencillo', 'norteno', 'atlas']

const KEY = 'hlm-estilo'
const THEME: Record<Skin, string> = { sencillo: '#ffffff', norteno: '#2e1c10', atlas: '#2b2418' }

const isSkin = (x: unknown): x is Skin => SKINS.includes(x as Skin)

let current: Skin = readSkin()
apply(current)

/** `?skin=` wins over the saved choice, so a link can open a given look. */
export function readSkin(): Skin {
  try {
    const q = new URLSearchParams(window.location.search).get('skin')
    if (isSkin(q)) return q
    const s = localStorage.getItem(KEY)
    if (isSkin(s)) return s
  } catch {
    /* private mode etc. */
  }
  return 'sencillo'
}

export const getSkin = () => current

function apply(s: Skin) {
  document.documentElement.dataset.skin = s
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME[s])
}

export function useSkin(): [Skin, (s: Skin) => void] {
  const [skin, setState] = useState<Skin>(current)
  useEffect(() => {
    current = skin
    apply(skin)
  }, [skin])
  const set = (s: Skin) => {
    current = s // update before React re-renders so t() reads the new skin
    try {
      localStorage.setItem(KEY, s)
      const u = new URL(window.location.href)
      if (u.searchParams.has('skin')) {
        u.searchParams.set('skin', s)
        history.replaceState(null, '', u)
      }
    } catch {
      /* ignore */
    }
    setState(s)
  }
  return [skin, set]
}
