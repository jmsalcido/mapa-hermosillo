import type { Key } from './i18n'
import type { Manifest, Stats } from './data'

export type ModeId = 'realm' | 'people' | 'wealth' | 'heat' | 'green' | 'wildlife' | 'work' | 'water'

export const MODES: { id: ModeId; label: Key; hint: string }[] = [
  { id: 'realm', label: 'm_realm', hint: 'Los territorios de la ciudad' },
  { id: 'people', label: 'm_people', hint: '¿Dónde vive más gente?' },
  { id: 'wealth', label: 'm_wealth', hint: '¿Qué tanto le falta a la gente?' },
  { id: 'heat', label: 'm_heat', hint: '¿Qué barrios son más calientes?' },
  { id: 'green', label: 'm_green', hint: '¿Dónde hay más plantas y árboles?' },
  { id: 'wildlife', label: 'm_wildlife', hint: '¿Qué animales se han visto?' },
  { id: 'work', label: 'm_work', hint: '¿Dónde está la chamba?' },
  { id: 'water', label: 'm_water', hint: '¿Quién tiene el agua?' },
]

export type ModeState = 'ok' | 'unavailable' | 'soon'

export function modeState(m: Manifest, id: ModeId): ModeState {
  const s = m.layers[id]?.status
  if (s === 'ok' || s === 'partial') return 'ok'
  if (s === 'unavailable') return 'unavailable'
  return 'soon'
}

/* Palettes are chosen for colour-vision deficiency: People uses a single-hue-family
   ramp with monotonic lightness (readable in greyscale); Wealth uses a blue↔orange
   diverging ramp, safe for deuteranopia/protanopia/tritanopia. */
export const PEOPLE_RAMP = ['#f6ecd0', '#f0d49a', '#e7b46c', '#d88c4c', '#bb6339', '#8f3e31', '#5a2530']
export const IMU_RAMP = ['#2f5f8f', '#78a3c6', '#ecdfbd', '#e29a58', '#a64d24'] // muy bajo → muy alto
export const GRS_RAMP = IMU_RAMP // CONEVAL also uses five grades, muy bajo → muy alto
export const NO_DATA = '#bfb39a'

export const IMU_LABELS = ['Muy baja', 'Baja', 'Media', 'Alta', 'Muy alta']
export const GRS_LABELS = ['Muy bajo', 'Bajo', 'Medio', 'Alto', 'Muy alto']

export function peopleColorExpr(stats: Stats): unknown {
  const b = stats.breaks.dens
  const steps: unknown[] = []
  b.forEach((v, i) => steps.push(v, PEOPLE_RAMP[i + 1]))
  return ['case', ['==', ['get', 'dens'], null], NO_DATA, ['step', ['get', 'dens'], PEOPLE_RAMP[0], ...steps]]
}

export function wealthColorExpr(primary: 'imu' | 'grs' | null): unknown {
  if (primary === 'imu')
    return ['match', ['coalesce', ['get', 'imu_grade'], 0], 1, IMU_RAMP[0], 2, IMU_RAMP[1], 3, IMU_RAMP[2], 4, IMU_RAMP[3], 5, IMU_RAMP[4], NO_DATA]
  if (primary === 'grs')
    return ['match', ['coalesce', ['get', 'grs_grade'], 0], 1, GRS_RAMP[0], 2, GRS_RAMP[1], 3, GRS_RAMP[2], 4, GRS_RAMP[3], 5, GRS_RAMP[4], NO_DATA]
  return NO_DATA
}

export function blockPeopleColorExpr(stats: Stats): unknown {
  // blocks are smaller and denser than AGEB averages; same breaks keep the legend honest
  return ['case', ['==', ['get', 'dens'], null], NO_DATA, ['step', ['get', 'dens'], PEOPLE_RAMP[0],
    ...stats.breaks.dens.flatMap((v, i) => [v, PEOPLE_RAMP[i + 1]])]]
}

// Fauna: sightings per barrio. Single-hue turquoise ramp with monotonic lightness (CVD-safe).
export const WILD_RAMP = ['#efe9d2', '#cfe3d3', '#9fd0c4', '#68b2a8', '#3a8f8a', '#1f6a69']
export function wildlifeColorExpr(stats: Stats): unknown {
  const b = stats.breaks.w_n ?? []
  return ['case', ['==', ['get', 'w_n'], null], NO_DATA,
    ['step', ['get', 'w_n'], WILD_RAMP[0], ...b.flatMap((v, i) => [v, WILD_RAMP[Math.min(i + 1, WILD_RAMP.length - 1)]])]]
}

// Calor: summer ground temperature per barrio. Pale = cooler, dark maroon = hottest
// (monotonic lightness, same ramp as the satellite image).
export const HEAT_RAMP = ['#fff7d6', '#fdd68c', '#f7a552', '#e26a34', '#b03426', '#6e1824', '#3a0c1e']
export function heatColorExpr(stats: Stats): unknown {
  const b = stats.breaks.lst ?? []
  return ['case', ['==', ['get', 'lst'], null], NO_DATA,
    ['step', ['get', 'lst'], HEAT_RAMP[0], ...b.flatMap((v, i) => [v, HEAT_RAMP[Math.min(i + 1, HEAT_RAMP.length - 1)]])]]
}

// Verde: NDVI per barrio, sand → deep green with monotonic lightness (CVD-safe).
export const GREEN_RAMP = ['#efe3c2', '#d9d5a2', '#b4c282', '#86a865', '#5a8a4d', '#2f6a3c']
export const GREEN_PLAIN = ['Casi nada verde', 'Poco verde', 'Algo verde', 'Regular', 'Bastante verde', 'Muy verde']
export function greenColorExpr(stats: Stats): unknown {
  const b = stats.breaks.ndvi ?? []
  return ['case', ['==', ['get', 'ndvi'], null], NO_DATA,
    ['step', ['get', 'ndvi'], GREEN_RAMP[0], ...b.flatMap((v, i) => [v, GREEN_RAMP[Math.min(i + 1, GREEN_RAMP.length - 1)]])]]
}
export function greenClass(stats: Stats, v: number | null | undefined): number | null {
  if (v == null) return null
  return (stats.breaks.ndvi ?? []).filter(b => v >= b).length
}

// Chamba: estimated jobs per km² (DENUE size ranges). "Mezclilla" blues, monotonic lightness (CVD-safe).
export const WORK_RAMP = ['#efe8d4', '#cfd6db', '#a6b9cb', '#7896b3', '#4d6f94', '#2a4a6e']
export const WORK_PLAIN = ['Casi nada de chamba', 'Poquita chamba', 'Algo de chamba', 'Bastante chamba', 'Mucha chamba', 'Muchísima chamba']
export function workColorExpr(stats: Stats): unknown {
  const b = stats.breaks.j_dens ?? []
  return ['case', ['==', ['get', 'j_dens'], null], NO_DATA,
    ['step', ['coalesce', ['get', 'j_dens'], 0], WORK_RAMP[0], ...b.flatMap((v, i) => [v, WORK_RAMP[Math.min(i + 1, WORK_RAMP.length - 1)]])]]
}
export function workClass(stats: Stats, v: number | null | undefined): number | null {
  if (v == null) return null
  return (stats.breaks.j_dens ?? []).filter(b => v >= b).length
}

// Agua: share of homes with a rooftop water tank (tinaco), Censo 2020. Sand → deep water blue,
// monotonic lightness (CVD-safe). Wells and intakes (REPDA) are drawn on top as silhouettes.
export const WATER_RAMP = ['#f1ecd6', '#cfe2ea', '#9fc8df', '#68a5cf', '#3b7cb6', '#1d528a']
export function waterColorExpr(stats: Stats): unknown {
  const b = stats.breaks.p_tinaco ?? []
  return ['case', ['==', ['get', 'p_tinaco'], null], NO_DATA,
    ['step', ['get', 'p_tinaco'], WATER_RAMP[0], ...b.flatMap((v, i) => [v, WATER_RAMP[Math.min(i + 1, WATER_RAMP.length - 1)]])]]
}
export const DROUGHT_PLAIN = ['Sin sequía', 'Anormalmente seco', 'Sequía moderada', 'Sequía severa', 'Sequía extrema', 'Sequía excepcional']
// drought colours: pale → dark brown, monotonic lightness
export const DROUGHT_RAMP = ['#d9e6d0', '#f3e3a1', '#e8bd73', '#cf8a4a', '#9c5530', '#5e2b1c']
