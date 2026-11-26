// Little 3D-ish illustrated tokens for OSM landmarks. viewBox 0 0 64 64, ground at y≈54.

const INK = '#2a1d12'
const S = `stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"`
const shadow = `<ellipse cx="32" cy="55" rx="24" ry="5" fill="#2a1d12" opacity=".22"/>`

// isometric box helper: front-left face, front-right face, roof
function box(x: number, y: number, w: number, d: number, h: number, c: [string, string, string]) {
  const dx = d * 0.87, dy = d * 0.5
  const L = `${x},${y} ${x + w},${y + w * 0.0} ${x + w},${y - h} ${x},${y - h}`
  const R = `${x + w},${y} ${x + w + dx},${y - dy} ${x + w + dx},${y - dy - h} ${x + w},${y - h}`
  const T = `${x},${y - h} ${x + w},${y - h} ${x + w + dx},${y - dy - h} ${x + dx},${y - dy - h}`
  return `<polygon points="${L}" fill="${c[0]}" ${S}/><polygon points="${R}" fill="${c[1]}" ${S}/><polygon points="${T}" fill="${c[2]}" ${S}/>`
}

const TOKENS: Record<string, string> = {
  factory: `${shadow}${box(8, 52, 30, 16, 14, ['#b7a58a', '#8f7d64', '#d9c9a8'])}
    <path d="M8 38l7-7v7l7-7v7l7-7v7l9-0" fill="#a35a3c" ${S}/>
    <rect x="42" y="18" width="6" height="26" fill="#8a4a35" ${S}/>
    <g class="smoke"><circle cx="45" cy="13" r="4" fill="#efe6d6" opacity=".85"/><circle cx="50" cy="8" r="5" fill="#efe6d6" opacity=".6"/><circle cx="56" cy="3" r="5" fill="#efe6d6" opacity=".35"/></g>`,
  university: `${shadow}${box(10, 52, 34, 12, 16, ['#e8dcc0', '#c4b494', '#f3ead4'])}
    <polygon points="8,36 27,24 46,36" fill="#6f8fa6" ${S}/>
    ${[14, 20, 26, 32, 38].map(x => `<rect x="${x}" y="38" width="3" height="13" fill="#fff8e6" ${S}/>`).join('')}
    <rect x="25" y="12" width="5" height="12" fill="#c9a24a" ${S}/><path d="M30 12h8l-3 3 3 3h-8z" fill="#b5523b" ${S}/>`,
  cathedral: `${shadow}${box(16, 52, 24, 12, 18, ['#e6d0a8', '#c2a678', '#efdfbf'])}
    <rect x="10" y="22" width="9" height="30" fill="#e6d0a8" ${S}/><rect x="37" y="22" width="9" height="30" fill="#c2a678" ${S}/>
    <path d="M10 22l4.5-9 4.5 9zM37 22l4.5-9 4.5 9z" fill="#3f6e8c" ${S}/>
    <path d="M22 34a7 7 0 0 1 14 0z" fill="#c9a24a" ${S}/><path d="M29 26v-6M27 22h4" stroke="${INK}" stroke-width="1.6"/>
    <path d="M25 52v-7a4 4 0 0 1 8 0v7z" fill="#5a3a22" ${S}/>`,
  stadium: `${shadow}<ellipse cx="32" cy="44" rx="25" ry="11" fill="#cdbb98" ${S}/>
    <ellipse cx="32" cy="38" rx="25" ry="11" fill="#e9dcc0" ${S}/><ellipse cx="32" cy="38" rx="17" ry="6.5" fill="#7fa05a" ${S}/>
    <path d="M7 38v6M57 38v6" stroke="${INK}" stroke-width="1.6"/><path d="M32 33v10" stroke="#f4efe0" stroke-width="1" opacity=".8"/>
    <rect x="10" y="20" width="2" height="14" fill="${INK}"/><rect x="52" y="20" width="2" height="14" fill="${INK}"/>
    <rect x="8" y="18" width="6" height="3" fill="#ffe9a8" ${S}/><rect x="50" y="18" width="6" height="3" fill="#ffe9a8" ${S}/>`,
  mall: `${shadow}${box(8, 52, 36, 14, 15, ['#e7c9a2', '#c29a6e', '#f2dfc2'])}
    <path d="M8 40h36l-3 5H11z" fill="#b5523b" ${S}/>${[12, 20, 28, 36].map(x => `<rect x="${x}" y="45" width="5" height="7" fill="#9fc2d6" ${S}/>`).join('')}
    <rect x="18" y="28" width="16" height="6" rx="1" fill="#2f5f8f" ${S}/>`,
  peak: `${shadow}<path d="M4 54L24 18l8 10 6-8 22 34z" fill="#b88a5e" ${S}/>
    <path d="M24 18l-6 14 6-3 4 5 4-6zM38 20l-4 8 5-2 4 4z" fill="#e3c79c" ${S}/>
    <path d="M14 54l8-12 5 4 6-9 8 17z" fill="#9a6c45" opacity=".6"/>
    <path d="M24 18V8" stroke="${INK}" stroke-width="1.6"/><path d="M24 8h8l-3 3 3 3h-8z" fill="#b5523b" ${S}/>`,
  hospital: `${shadow}${box(12, 52, 28, 12, 20, ['#f4f0e6', '#d6cfbf', '#fffaf0'])}
    <rect x="20" y="36" width="12" height="12" rx="1.5" fill="#fff" ${S}/><path d="M24.5 38h3v3h3v3h-3v3h-3v-3h-3v-3h3z" fill="#b5523b"/>`,
  airport: `${shadow}<path d="M6 46h52l-4 6H10z" fill="#9a8a6f" ${S}/>
    <path d="M14 36l30-6 8 2-6 3-14 3 4 9h-4l-7-8-9 1z" fill="#e8eef2" ${S}/>`,
  museum: `${shadow}${box(10, 52, 34, 10, 14, ['#efe4cc', '#cbbd9e', '#f6eedb'])}
    <polygon points="8,38 27,27 46,38" fill="#e3d2ae" ${S}/>${[14, 21, 28, 35].map(x => `<rect x="${x}" y="40" width="3.5" height="12" fill="#fffaf0" ${S}/>`).join('')}`,
  zoo: `${shadow}<path d="M10 52c0-10 6-14 10-14s6 4 6 14z" fill="#5b7f4f" ${S}/><circle cx="20" cy="30" r="10" fill="#6f9b5f" ${S}/>
    <path d="M32 52v-8c0-4 4-6 8-6h8l4-6 3 2-3 7v11h-3v-6h-12v6z" fill="#c9a24a" ${S}/>`,
  attraction: `${shadow}<path d="M32 10l5 12h13l-10 8 4 13-12-8-12 8 4-13-10-8h13z" fill="#c9a24a" ${S}/>`,
}

export function tokenSVG(kind: string, size = 44): string {
  return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true">${TOKENS[kind] ?? TOKENS.attraction}</svg>`
}

/** Zoom from which a landmark kind is drawn (city-defining ones first). */
export const TOKEN_MINZOOM: Record<string, number> = {
  factory: 11, airport: 11, stadium: 13, peak: 13, cathedral: 13, university: 13.5, mall: 14,
  hospital: 14.8, museum: 14.8, zoo: 13.5, attraction: 15,
}
/** A handful of iconic landmarks stay visible from the realm view. */
const ICONIC = /Campana|Ford|Nacozari|Catedral Metropolitana|^Universidad de Sonora$|Galer[ií]as Mall/i
export const tokenMinZoom = (kind: string, name: string) =>
  ICONIC.test(name) ? 10 : (TOKEN_MINZOOM[kind] ?? 14.5)
