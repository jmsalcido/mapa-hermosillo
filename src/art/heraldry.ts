// Fierros de herrar: each territory gets a hanging painted plank with its own cattle
// brand burned in, in the style of a Sonoran ranch sign.

const BURN = '#24170d'
const ROPE = '#c9a66b'

// Brands are drawn as thick burnt strokes inside a 60×60 box (centre 30,34).
const strokeAttrs = (c: string, w = 3.6) => `stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"`
const s = strokeAttrs(BURN)
const brands = (s: string): Record<string, string> => ({
  sun: `<circle cx="30" cy="34" r="6" ${s}/>` +
    Array.from({ length: 8 }, (_, i) => {
      const a = (i * Math.PI) / 4
      return `<path d="M${(30 + Math.cos(a) * 10).toFixed(1)} ${(34 + Math.sin(a) * 10).toFixed(1)}L${(30 + Math.cos(a) * 14).toFixed(1)} ${(34 + Math.sin(a) * 14).toFixed(1)}" ${s}/>`
    }).join(''),
  saguaro: `<path d="M30 49V21M30 38h-6v-8M30 33h6v-8" ${s}/>`,
  mountain: `<path d="M16 46l9-16 5 7 4-6 10 15" ${s}/>`,
  river: `<path d="M17 29q4-4 8 0t8 0t8 0M17 37q4-4 8 0t8 0t8 0M17 45q4-4 8 0t8 0t8 0" ${s}/>`,
  star: `<path d="M30 21l3.8 8.6 9.2.9-7 6.1 2.1 9.1L30 41l-8.1 4.7 2.1-9.1-7-6.1 9.2-.9z" ${s}/>`,
  // "tower" → herradura (horseshoe)
  tower: `<path d="M22 47V33a8 8 0 0 1 16 0v14" ${s} stroke-width="5"/><path d="M19 47h6M35 47h6" ${s}/>`,
  horse: `<path d="M19 47l4-11c-3-3-2-7 1-10l6-6 2-3 1 4c4 1 7 4 8 8l-4 1-3-2-1 5 4 14" ${s}/>`,
  // "wheat" → mazorca (corn)
  wheat: `<path d="M30 49V22" ${s}/><path d="M25 26c0 7 2 13 5 17 3-4 5-10 5-17-2-3-8-3-10 0z" ${s} stroke-width="3"/><path d="M23 44c3-3 5-3 7-1 2-2 4-2 7 1" ${s}/>`,
  key: `<circle cx="30" cy="26" r="5" ${s}/><path d="M30 31v17M30 42h5M30 37h4" ${s}/>`,
  crescent: `<path d="M35 21a13 13 0 1 0 0 26 10 10 0 1 1 0-26z" ${s}/>`,
  bird: `<path d="M15 34c5-6 10-6 15 0 5-6 10-6 15 0" ${s}/><path d="M24 44c2-2 4-2 6 0 2-2 4-2 6 0" ${s} stroke-width="2.8"/>`,
  // "gear" → espuela (spur rowel)
  gear: `<circle cx="30" cy="34" r="4" ${s}/>` +
    Array.from({ length: 6 }, (_, i) => `<path d="M30 28.5L30 20" ${s} transform="rotate(${i * 60} 30 34)"/>`).join('') +
    `<path d="M14 34h8" ${s}/>`,
})
const BRANDS = brands(s)

/** Hanging ranch plank, painted with the territory colour and branded. */
export function bannerSVG(color: string, charge: string, size = 46): string {
  const id = `w${color.slice(1)}${charge}`
  return `<svg viewBox="0 0 60 84" width="${size}" height="${(size * 84) / 60}" aria-hidden="true">
  <defs>
    <linearGradient id="${id}" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/>
    </linearGradient>
    <radialGradient id="${id}b"><stop offset=".2" stop-color="#3a1f0c" stop-opacity=".35"/><stop offset="1" stop-color="#3a1f0c" stop-opacity="0"/></radialGradient>
  </defs>
  <path d="M30 2L13 18M30 2L47 18" stroke="${ROPE}" stroke-width="2.2" stroke-dasharray="3 1.5" fill="none"/>
  <circle cx="30" cy="3" r="2.6" fill="#b08a4a" stroke="${BURN}" stroke-width="1"/>
  <path d="M8 18h44l-2 46c-.2 4-3 6-7 7l-13 5-13-5c-4-1-6.8-3-7-7z" fill="${color}" stroke="${BURN}" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="M10 28h40M10 40h40M10 52h40" stroke="${BURN}" stroke-opacity=".18" stroke-width="1"/>
  <path d="M8 18h44l-2 46c-.2 4-3 6-7 7l-13 5-13-5c-4-1-6.8-3-7-7z" fill="url(#${id})"/>
  <path d="M12.5 22h35l-1.7 41c-.2 3-2.4 4.6-5.4 5.4L30 72l-10.4-3.6c-3-.8-5.2-2.4-5.4-5.4z" fill="none" stroke="#f3e2bd" stroke-opacity=".7" stroke-width="1.1" stroke-dasharray="2.4 2"/>
  <circle cx="30" cy="44" r="16" fill="url(#${id}b)"/>
  <g transform="translate(0 10)">${BRANDS[charge] ?? BRANDS.star}</g>
  <circle cx="13" cy="21" r="1.6" fill="#d9b25c" stroke="${BURN}" stroke-width=".6"/><circle cx="47" cy="21" r="1.6" fill="#d9b25c" stroke="${BURN}" stroke-width=".6"/>
</svg>`
}

/** Small branded leather tag for the ficha and tooltips. */
export function shieldSVG(color: string, charge: string, size = 34): string {
  return `<svg viewBox="8 12 44 60" width="${size}" height="${(size * 60) / 44}" aria-hidden="true">
  <path d="M10 14h40l-1.5 36c-.3 5-3 8-8 10L30 70l-10.5-10c-5-2-7.7-5-8-10z" fill="${color}" stroke="${BURN}" stroke-width="2.2"/>
  <path d="M14 18h32l-1.3 31c-.3 4-2.5 6.4-6.5 8L30 65l-8.2-8c-4-1.6-6.2-4-6.5-8z" fill="none" stroke="#f3e2bd" stroke-opacity=".7" stroke-width="1" stroke-dasharray="2.2 1.8"/>
  <g transform="translate(0 4)">${BRANDS[charge] ?? BRANDS.star}</g>
</svg>`
}

// ---------- Atlas skin: heater shields with a gilt edge and pale heraldic charges ----------
const GILT = '#c9a646'
const ATLAS_INK = '#1f1a12'
const ARGENT = '#f6eed8'
const as = strokeAttrs(ARGENT, 3.2)
const ATLAS_CHARGES: Record<string, string> = {
  ...brands(as),
  // tower: a small crenellated keep
  tower: `<path d="M22 48V30h-2v-6h4v3h4v-3h4v3h4v-3h4v6h-2v18z" ${as}/><path d="M28 48v-6a2 2 0 0 1 4 0v6" ${strokeAttrs(ARGENT, 2.4)}/>`,
  // wheat: a bound sheaf
  wheat: `<path d="M30 49V24M30 40l-7-14M30 40l7-14M30 34l-4-12M30 34l4-12" ${as}/><path d="M24 40h12" ${strokeAttrs(ARGENT, 2.6)}/>`,
  // gear: a cog wheel
  gear: `<circle cx="30" cy="34" r="8" ${as}/><circle cx="30" cy="34" r="2.5" ${strokeAttrs(ARGENT, 2.4)}/>` +
    Array.from({ length: 8 }, (_, i) => `<path d="M30 23.5V20" ${strokeAttrs(ARGENT, 3.6)} transform="rotate(${i * 45} 30 34)"/>`).join(''),
}
const HEATER = 'M10 16h40v20c0 15-9 25-20 32C19 61 10 51 10 36z'
const HEATER_IN = 'M14 20h32v16c0 12-7 20-16 26-9-6-16-14-16-26z'

/** Atlas banner: a crowned heater shield with a gilt edge, tinted with the territory colour. */
export function atlasBannerSVG(color: string, charge: string, size = 46): string {
  const id = `a${color.slice(1)}${charge}`
  // a three-point coronet with pearls, drawn above the shield
  const crown = `<path d="M17 17l-2-9 7 5 8-9 8 9 7-5-2 9z" fill="url(#${id}g)" stroke="${ATLAS_INK}" stroke-width="1.3" stroke-linejoin="round"/>` +
    `<path d="M17 17h26" stroke="${ATLAS_INK}" stroke-width="1.3"/>` +
    [[15, 8], [30, 4], [45, 8]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="${ARGENT}" stroke="${ATLAS_INK}" stroke-width=".8"/>`).join('') +
    `<circle cx="30" cy="13" r="1.6" fill="#8e2a22" stroke="${ATLAS_INK}" stroke-width=".6"/>`
  return `<svg viewBox="0 0 60 80" width="${size}" height="${(size * 80) / 60}" aria-hidden="true">
  <defs>
    <linearGradient id="${id}" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/>
    </linearGradient>
    <linearGradient id="${id}g" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#f3dc8e"/><stop offset=".6" stop-color="${GILT}"/><stop offset="1" stop-color="#7a5e1c"/>
    </linearGradient>
  </defs>
  ${crown}
  <g transform="translate(0 3)">
    <path d="${HEATER}" fill="url(#${id}g)" stroke="${ATLAS_INK}" stroke-width="1.6" stroke-linejoin="round" transform="translate(30 42) scale(1.1) translate(-30 -42)"/>
    <path d="${HEATER}" fill="${color}" stroke="${ATLAS_INK}" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="${HEATER}" fill="url(#${id})"/>
    <path d="${HEATER_IN}" fill="none" stroke="${ARGENT}" stroke-opacity=".55" stroke-width="1"/>
    <g transform="translate(0 6)">${ATLAS_CHARGES[charge] ?? ATLAS_CHARGES.star}</g>
  </g>
</svg>`
}

/** Small atlas coat of arms for the ficha and tooltips. */
export function atlasShieldSVG(color: string, charge: string, size = 34): string {
  return `<svg viewBox="8 14 44 56" width="${size}" height="${(size * 56) / 44}" aria-hidden="true">
  <path d="${HEATER}" fill="${color}" stroke="${ATLAS_INK}" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="${HEATER_IN}" fill="none" stroke="${GILT}" stroke-width="1.6"/>
  <g transform="translate(0 4)">${ATLAS_CHARGES[charge] ?? ATLAS_CHARGES.star}</g>
</svg>`
}

/** Pick the territory badge for the current skin. */
export const crestSVG = (skin: 'norteno' | 'atlas', color: string, charge: string, size?: number) =>
  skin === 'atlas' ? atlasShieldSVG(color, charge, size) : shieldSVG(color, charge, size)
export const realmBannerSVG = (skin: 'norteno' | 'atlas', color: string, charge: string, size?: number) =>
  skin === 'atlas' ? atlasBannerSVG(color, charge, size) : bannerSVG(color, charge, size)
