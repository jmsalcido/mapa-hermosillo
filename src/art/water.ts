// Tokens for the Agua mode: one per kind of water use (CONAGUA REPDA). Each has its own silhouette
// (not just a colour) so they stay distinguishable for colour-blind readers. viewBox 0 0 48 48.

const INK = '#24170d'
const ow = (w: number) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`
const o = ow(1.8)

export type WaterUse = 'agricola' | 'urbano' | 'industria' | 'ganado' | 'otros'
export const WATER_USES: WaterUse[] = ['agricola', 'urbano', 'industria', 'ganado', 'otros']

export const WATER_INFO: Record<WaterUse, { name: string; one: string; color: string }> = {
  agricola: { name: 'Campo y riego', one: 'riego del campo', color: '#5f8a3a' },
  urbano: { name: 'Agua para la ciudad', one: 'agua potable para la ciudad o un pueblo', color: '#2f6fa3' },
  industria: { name: 'Industria y energía', one: 'industria o energía', color: '#5a5f66' },
  ganado: { name: 'Ganado', one: 'ganado', color: '#8b5a35' },
  otros: { name: 'Otros usos', one: 'varios usos, servicios o casa', color: '#2f8a86' },
}

const BODY: Record<WaterUse, string> = {
  // matita con surcos
  agricola: `<path d="M24 38V20" stroke="#4d7a2e" stroke-width="3.2" stroke-linecap="round"/>
        <path d="M24 26c-9 0-12-6-12-11 6 0 12 3 12 11zM24 22c0-8 5-12 12-12 0 6-4 12-12 12z" fill="#7fae4c" ${o}/>
        <path d="M7 40c5-3 9-3 13 0s9 3 14 0 6-2 7-1" fill="none" stroke="#8b5a35" stroke-width="2.6" stroke-linecap="round"/>`,
  // llave de agua con gota
  urbano: `<path d="M9 14h18v6H9z" fill="#9aa7b0" ${o}/>
        <path d="M27 14h6a5 5 0 0 1 5 5v4h-6v-3h-5z" fill="#9aa7b0" ${o}/>
        <path d="M15 9h6v5h-6z" fill="#6f7b84" ${o}/><path d="M12 9h12" ${ow(2.6)}/>
        <path d="M35 28c2.6 3.6 4 5.6 4 7.4a4 4 0 0 1-8 0c0-1.8 1.4-3.8 4-7.4z" fill="#68a5cf" ${o}/>`,
  // engrane
  industria: `<path d="M21 6h6l1 5 4 2 4-3 4 4-3 4 2 4 5 1v6l-5 1-2 4 3 4-4 4-4-3-4 2-1 5h-6l-1-5-4-2-4 3-4-4 3-4-2-4-5-1v-6l5-1 2-4-3-4 4-4 4 3 4-2z"
        fill="#8c9299" ${o}/><circle cx="24" cy="24" r="6" fill="#e9e3d3" ${o}/>`,
  // herradura
  ganado: `<path d="M13 40V22a11 11 0 0 1 22 0v18h-7V22a4 4 0 0 0-8 0v18z" fill="#a8713f" ${o}/>
        <path d="M16 26h1M16 33h1M31 26h1M31 33h1" stroke="#f2e4c4" stroke-width="2.6" stroke-linecap="round"/>`,
  // gota
  otros: `<path d="M24 7c7 9.5 12 15.5 12 21.5a12 12 0 0 1-24 0C12 22.5 17 16.5 24 7z" fill="#5fb3ad" ${o}/>
        <path d="M18 29a6 6 0 0 0 5.5 6" fill="none" stroke="#f2f6f2" stroke-width="2.6" stroke-linecap="round"/>`,
}

/** `kind` 0 = pozo (round badge), 1 = toma de río o presa (square badge): shape, not only colour. */
export function waterSVG(u: WaterUse, size = 48, halo = true, kind: 0 | 1 = 0): string {
  const c = WATER_INFO[u].color
  const badge = kind === 1
    ? `<rect x="3" y="3" width="42" height="42" rx="6" fill="#eef3f2" fill-opacity=".92" stroke="${c}" stroke-width="2.6"/>`
    : `<circle cx="24" cy="24" r="21" fill="#f2e4c4" fill-opacity=".92" stroke="${c}" stroke-width="2.6"/>`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="${size}" height="${size}">
  ${halo ? badge : ''}<g transform="translate(6 6) scale(.75)">${BODY[u]}</g></svg>`
}

/** Loads the water icons into a MapLibre map as images named `a-<use>-<kind>`. */
export async function addWaterImages(map: { addImage: (id: string, img: HTMLImageElement, o: { pixelRatio: number }) => void; hasImage: (id: string) => boolean }) {
  await Promise.all(
    WATER_USES.flatMap(u => ([0, 1] as const).map(k => ({ u, k }))).map(
      ({ u, k }) =>
        new Promise<void>(resolve => {
          const id = `a-${u}-${k}`
          if (map.hasImage(id)) return resolve()
          const img = new Image(96, 96)
          img.onerror = () => resolve() // a broken icon must never block the layer
          img.onload = () => {
            if (!map.hasImage(id)) map.addImage(id, img, { pixelRatio: 2 })
            resolve()
          }
          img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(waterSVG(u, 96, true, k))
        }),
    ),
  )
}

/** "1,234,567 m³" in plain words: Olympic pools (2,500 m³ each), a rounded comparison. */
export const pools = (m3: number) => Math.round(m3 / 2500)
