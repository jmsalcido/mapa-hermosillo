// Cartoon critters for the Fauna mode. Each group has its own silhouette (not just a colour),
// so they stay distinguishable for colour-blind readers. viewBox 0 0 48 48.

const INK = '#24170d'
const ow = (w: number) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`
const o = ow(1.8)

export type Group = 'ave' | 'rep' | 'mam' | 'ins' | 'otr'
export const GROUPS: Group[] = ['ave', 'rep', 'mam', 'ins', 'otr']

export const GROUP_INFO: Record<Group, { name: string; one: string; color: string }> = {
  ave: { name: 'Aves', one: 'ave', color: '#35607f' },
  rep: { name: 'Reptiles', one: 'reptil', color: '#6f7f3f' },
  mam: { name: 'Mamíferos', one: 'mamífero', color: '#8b5a35' },
  ins: { name: 'Insectos y arañas', one: 'insecto o araña', color: '#c7962f' },
  otr: { name: 'Sapos, peces y otros', one: 'otro animal', color: '#7c3f6a' },
}

const BODY: Record<Group, string> = {
  // pajarito (like a cactus wren)
  ave: `<path d="M12 28c0-8 6-13 13-13 5 0 8 3 9 6l7 1-6 3c0 8-7 12-14 12-5 0-9-3-9-9z" fill="#5b86a8" ${o}/>
        <path d="M17 27c4-1 8 1 10 5-5 2-9 1-11-2z" fill="#35607f" ${o}/>
        <path d="M12 29l-6 3 7 1" fill="#35607f" ${o}/><circle cx="30" cy="21" r="2" fill="${INK}"/>
        <path d="M22 38v4M27 38v4" ${o}/>`,
  // lagartija
  rep: `<path d="M24 7c3 0 4 3 4 6s-1 4-1 6v9c0 5 1 8 4 11 2 2 0 4-2 2-4-4-5-7-5-12v-6c-2-2-3-4-3-7s0-9 3-9z" fill="#8aa05a" ${o}/>
        <path d="M21 20l-6-3M27 20l6-3M21 28l-6 4M27 28l6 4" ${ow(2.4)}/>
        <circle cx="22.5" cy="10" r="1.2" fill="${INK}"/><circle cx="25.5" cy="10" r="1.2" fill="${INK}"/>`,
  // liebre del desierto (jackrabbit)
  mam: `<path d="M14 34c0-7 5-12 12-12 6 0 10 4 10 9 0 6-5 9-11 9h-8c-2 0-3-2-3-6z" fill="#b08458" ${o}/>
        <path d="M29 23c-1-6 0-14 3-15 2 0 2 8 0 15M33 24c1-6 4-13 7-13 1 1-1 8-4 14" fill="#c89d6e" ${o}/>
        <circle cx="34" cy="28" r="1.6" fill="${INK}"/><circle cx="13" cy="33" r="3" fill="#f3e4c0" ${o}/>
        <path d="M20 40l-2 3M30 40l2 3" ${o}/>`,
  // mariposa
  ins: `<path d="M24 16c-4-7-14-8-15-2-1 5 5 9 13 10-7 1-11 5-9 9 2 4 8 2 11-5" fill="#e0a43a" ${o}/>
        <path d="M24 16c4-7 14-8 15-2 1 5-5 9-13 10 7 1 11 5 9 9-2 4-8 2-11-5" fill="#e0a43a" ${o}/>
        <circle cx="15" cy="16" r="2" fill="${INK}" opacity=".6"/><circle cx="33" cy="16" r="2" fill="${INK}" opacity=".6"/>
        <path d="M24 14v20" ${ow(3)}/><path d="M24 14l-3-5M24 14l3-5" ${o}/>`,
  // sapo
  otr: `<path d="M10 33c0-8 6-13 14-13s14 5 14 13c0 4-3 6-7 6H17c-4 0-7-2-7-6z" fill="#9a6a8e" ${o}/>
        <circle cx="18" cy="21" r="4" fill="#9a6a8e" ${o}/><circle cx="30" cy="21" r="4" fill="#9a6a8e" ${o}/>
        <circle cx="18" cy="21" r="1.5" fill="${INK}"/><circle cx="30" cy="21" r="1.5" fill="${INK}"/>
        <path d="M18 31q6 3 12 0" ${o} fill="none"/><path d="M10 37l-4 3M38 37l4 3" ${o}/>`,
}

export function critterSVG(g: Group, size = 48, halo = true): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="${size}" height="${size}">
  ${halo ? `<circle cx="24" cy="25" r="21" fill="#f2e4c4" fill-opacity=".85" stroke="${GROUP_INFO[g].color}" stroke-width="2.2"/>` : ''}
  <g transform="translate(4 4) scale(.83)">${BODY[g]}</g></svg>`
}

/** Loads the critter icons into a MapLibre map as images named `c-<group>`. */
export async function addCritterImages(map: { addImage: (id: string, img: HTMLImageElement, o: { pixelRatio: number }) => void; hasImage: (id: string) => boolean }) {
  await Promise.all(
    GROUPS.map(
      g =>
        new Promise<void>(resolve => {
          if (map.hasImage(`c-${g}`)) return resolve()
          const img = new Image(96, 96)
          img.onerror = () => resolve() // a broken icon must never block the layer
          img.onload = () => {
            if (!map.hasImage(`c-${g}`)) map.addImage(`c-${g}`, img, { pixelRatio: 2 })
            resolve()
          }
          img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(critterSVG(g, 96))
        }),
    ),
  )
}
