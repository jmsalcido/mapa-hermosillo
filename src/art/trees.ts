// Cartoon desert tree (palo verde / mezquite style) for the Verde mode. viewBox 0 0 48 48.
const INK = '#24170d'

export function treeSVG(size = 48): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="${size}" height="${size}">
  <ellipse cx="24" cy="44" rx="13" ry="3" fill="${INK}" opacity=".22"/>
  <path d="M23 44l1-14M24 32l-6-6M24 30l7-7" stroke="#6b4426" stroke-width="3.4" stroke-linecap="round" fill="none"/>
  <path d="M8 22c-3-6 2-12 8-11 2-6 11-8 15-3 6-2 12 3 10 9 4 3 2 10-4 10-2 4-9 5-12 2-4 3-11 2-12-2-5 0-8-3-5-5z"
        fill="#7fa65a" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M14 17c3-2 6-1 8 1M27 13c3 0 5 2 6 4M20 25c3 1 6 1 8-1" stroke="#a9c97c" stroke-width="2" stroke-linecap="round" fill="none"/>
  <circle cx="17" cy="20" r="1.6" fill="#e0c23a"/><circle cx="31" cy="19" r="1.6" fill="#e0c23a"/><circle cx="25" cy="26" r="1.6" fill="#e0c23a"/>
</svg>`
}

export function addTreeImage(map: { addImage: (id: string, img: HTMLImageElement, o: { pixelRatio: number }) => void; hasImage: (id: string) => boolean }) {
  return new Promise<void>(resolve => {
    if (map.hasImage('tree')) return resolve()
    const img = new Image(96, 96)
    img.onerror = () => resolve()
    img.onload = () => {
      if (!map.hasImage('tree')) map.addImage('tree', img, { pixelRatio: 2 })
      resolve()
    }
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(treeSVG(96))
  })
}
