// Cartoon tokens for the Chamba mode. Each kind of business has its own silhouette (not just a
// colour) so they stay distinguishable for colour-blind readers. viewBox 0 0 48 48.

const INK = '#24170d'
const ow = (w: number) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`
const o = ow(1.8)

export type WorkGroup = 'tienda' | 'comida' | 'taller' | 'oficina' | 'fabrica' | 'escuela'
export const WORK_GROUPS: WorkGroup[] = ['tienda', 'comida', 'taller', 'oficina', 'fabrica', 'escuela']

export const WORK_INFO: Record<WorkGroup, { name: string; one: string; color: string }> = {
  tienda: { name: 'Tiendas y comercios', one: 'tienda o comercio', color: '#b5482f' },
  comida: { name: 'Comida y hoteles', one: 'lugar de comida u hotel', color: '#d08a2c' },
  taller: { name: 'Talleres y oficios', one: 'taller u oficio', color: '#6b5a48' },
  oficina: { name: 'Oficinas y gobierno', one: 'oficina', color: '#35607f' },
  fabrica: { name: 'Fábricas, obras y bodegas', one: 'fábrica, obra o bodega', color: '#5a5f66' },
  escuela: { name: 'Escuelas, salud y diversión', one: 'escuela, clínica o lugar de diversión', color: '#4f7f4a' },
}

export const SIZE_LABEL = ['de 0 a 5', 'de 6 a 10', 'de 11 a 30', 'de 31 a 50', 'de 51 a 100', 'de 101 a 250', 'más de 250']

const BODY: Record<WorkGroup, string> = {
  // tiendita con toldo de rayas
  tienda: `<path d="M10 22h28v18H10z" fill="#f3e4c0" ${o}/>
        <path d="M8 14h32l2 8H6z" fill="#b5482f" ${o}/>
        <path d="M14 14l-2 8M22 14v8M30 14l1 8M37 14l2 8" stroke="#f3e4c0" stroke-width="2.6"/>
        <path d="M8 14h32l2 8H6z" fill="none" ${o}/>
        <path d="M14 27h8v13h-8z" fill="#8b5a35" ${o}/><path d="M26 27h8v7h-8z" fill="#9fc0d6" ${o}/>`,
  // taco
  comida: `<path d="M7 34c0-11 8-19 17-19s17 8 17 19z" fill="#e8c46a" ${o}/>
        <path d="M11 30c2-6 6-9 9-9M28 21c3 1 6 4 8 8" stroke="#5f8a3a" stroke-width="3.4" stroke-linecap="round" fill="none"/>
        <path d="M14 32c3-5 7-7 10-7s7 2 10 7" stroke="#b5482f" stroke-width="3.2" stroke-linecap="round" fill="none"/>
        <path d="M7 34h34" ${o}/>`,
  // llave y martillo
  taller: `<path d="M13 37l15-15" stroke="#8a7a68" stroke-width="5" stroke-linecap="round"/>
        <path d="M13 37l15-15" fill="none" ${ow(1.4)}/>
        <circle cx="31" cy="18" r="6" fill="#a99a86" ${o}/><path d="M31 18l5-5" stroke="#f3e4c0" stroke-width="3.4" stroke-linecap="round"/>
        <path d="M35 37L19 21" stroke="#8b5a35" stroke-width="4" stroke-linecap="round"/>
        <path d="M12 16l6-6 6 6-3 3-6-6-3 3z" fill="#5a5f66" ${o}/>`,
  // edificio de oficinas
  oficina: `<path d="M13 9h22v31H13z" fill="#6f93b3" ${o}/>
        <path d="M17 13h4v4h-4zM27 13h4v4h-4zM17 21h4v4h-4zM27 21h4v4h-4zM17 29h4v4h-4zM27 29h4v4h-4z" fill="#e6eef2" ${ow(1.2)}/>
        <path d="M21 34h6v6h-6z" fill="#35607f" ${o}/>`,
  // fábrica con chimenea
  fabrica: `<path d="M8 40V24l8-5v5l8-5v5l8-5v21z" fill="#8c9299" ${o}/>
        <path d="M32 40V12h6v28z" fill="#5a5f66" ${o}/>
        <path d="M35 9c-2-3 1-5 4-4 1-3 6-2 6 1" fill="none" stroke="#9a9289" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M12 30h4v4h-4zM20 30h4v4h-4zM27 30h3v4h-3z" fill="#f0c95a" ${ow(1.2)}/>
        <path d="M6 40h36" ${o}/>`,
  // escuelita con campana
  escuela: `<path d="M9 23l15-11 15 11" fill="#b5482f" ${o}/>
        <path d="M12 23h24v17H12z" fill="#e9d6ae" ${o}/>
        <path d="M20 9h8v5h-8z" fill="#e9d6ae" ${o}/><circle cx="24" cy="11.5" r="1.4" fill="#c7962f"/>
        <path d="M21 30h6v10h-6z" fill="#4f7f4a" ${o}/><path d="M14 27h4v4h-4zM30 27h4v4h-4z" fill="#9fc0d6" ${ow(1.2)}/>`,
}

export function workSVG(g: WorkGroup, size = 48, halo = true): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="${size}" height="${size}">
  ${halo ? `<rect x="3" y="3" width="42" height="42" rx="9" fill="#f2e4c4" fill-opacity=".9" stroke="${WORK_INFO[g].color}" stroke-width="2.4"/>` : ''}
  <g transform="translate(4 4) scale(.83)">${BODY[g]}</g></svg>`
}

/** Loads the business icons into a MapLibre map as images named `j-<group>`. */
export async function addWorkImages(map: { addImage: (id: string, img: HTMLImageElement, o: { pixelRatio: number }) => void; hasImage: (id: string) => boolean }) {
  await Promise.all(
    WORK_GROUPS.map(
      g =>
        new Promise<void>(resolve => {
          if (map.hasImage(`j-${g}`)) return resolve()
          const img = new Image(96, 96)
          img.onerror = () => resolve() // a broken icon must never block the layer
          img.onload = () => {
            if (!map.hasImage(`j-${g}`)) map.addImage(`j-${g}`, img, { pixelRatio: 2 })
            resolve()
          }
          img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(workSVG(g, 96))
        }),
    ),
  )
}
