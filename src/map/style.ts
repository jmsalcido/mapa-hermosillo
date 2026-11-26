import type { StyleSpecification } from 'maplibre-gl'
import { dataUrl } from '../data'
import type { Skin } from '../skin'

export const INK = '#2a1d12'

/** Every colour of the base map and our line layers, per skin (data ramps live in modes.ts and never change). */
export const PALETTES = {
  sencillo: {
    // plain light-grey base so the data colours stand out
    ink: '#3e4c59', shadow: '#9aa5b1', highlight: '#ffffff', accent: '#cbd2d9',
    park: '#b7d7a8', parkEdge: '#7fa86e', riverbed: '#e4e7eb', river: '#5b8fb0', water: '#a8cbe0', waterEdge: '#5b8fb0',
    road: '#ffffff', hover: '#1f2933', sel: '#2563eb',
    sea: '#b9d6e6', seaEdge: '#5b8fb0', ripple: '#5b8fb0', rippleOpacity: 0,
  },
  norteno: {
    ink: INK, shadow: '#6b4526', highlight: '#fff6df', accent: '#8a6038',
    park: '#8fa86a', parkEdge: '#4f6a3a', riverbed: '#e8d3a6', river: '#5f8fa8', water: '#7fa9b8', waterEdge: '#3c6476',
    road: '#f3e4c0', hover: '#fff3cf', sel: '#e2b23c',
    sea: '#86aebb', seaEdge: '#3c6476', ripple: '#3c6476', rippleOpacity: 0,
  },
  atlas: {
    // aged vellum: deep sepia relief, inky water
    ink: '#1c160d', shadow: '#3e3220', highlight: '#f4e8c8', accent: '#5a4a2e',
    park: '#6f7a48', parkEdge: '#323a1e', riverbed: '#d8c9a0', river: '#2f5260', water: '#5f818a', waterEdge: '#1d3640',
    road: '#efe2bf', hover: '#fff6dc', sel: '#a8701e',
    sea: '#7d9a9a', seaEdge: '#1d3640', ripple: '#1d3640', rippleOpacity: 0.35,
  },
}
export type Palette = typeof PALETTES.norteno

/** [layer id, paint property, palette key]: applied on load and whenever the skin changes. */
export const SKIN_PAINT: [string, string, keyof Palette][] = [
  ['sea', 'fill-color', 'sea'],
  ['sea-edge', 'line-color', 'seaEdge'],
  ['sea-ripple', 'line-color', 'ripple'],
  ['sea-ripple', 'line-opacity', 'rippleOpacity'],
  ['sea-ripple-2', 'line-color', 'ripple'],
  ['sea-ripple-2', 'line-opacity', 'rippleOpacity'],
  ['hillshade', 'hillshade-shadow-color', 'shadow'],
  ['hillshade', 'hillshade-highlight-color', 'highlight'],
  ['hillshade', 'hillshade-accent-color', 'accent'],
  ['parks', 'fill-color', 'park'],
  ['parks', 'fill-outline-color', 'parkEdge'],
  ['riverbed', 'line-color', 'riverbed'],
  ['river', 'line-color', 'river'],
  ['water', 'fill-color', 'water'],
  ['water-edge', 'line-color', 'waterEdge'],
  ['no-census', 'line-color', 'ink'],
  ['roads-casing', 'line-color', 'ink'],
  ['roads', 'line-color', 'road'],
  ['ageb-line', 'line-color', 'ink'],
  ['realm-line', 'line-color', 'ink'],
  ['hover-line', 'line-color', 'hover'],
  ['sel-line', 'line-color', 'sel'],
  ['sel-line-ink', 'line-color', 'ink'],
  ['blocks-line', 'line-color', 'ink'],
  ['roads-minor', 'line-color', 'road'],
]

/** Fully custom style: no basemap tiles, only our data + a DEM hillshade on parchment. */
export function baseStyle(skin: Skin = 'sencillo'): StyleSpecification {
  const P = PALETTES[skin]
  return {
    version: 8,
    sources: {
      dem: {
        type: 'raster-dem',
        tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
        encoding: 'terrarium',
        tileSize: 256,
        maxzoom: 13,
        attribution: 'Relieve: AWS Terrain Tiles (SRTM/USGS, ETOPO1)',
      },
      water: { type: 'geojson', data: dataUrl('water_parks.geojson') },
      sea: { type: 'geojson', data: dataUrl('sea.geojson'), attribution: 'Mar: Natural Earth' },
      roads: { type: 'geojson', data: dataUrl('roads_major.geojson') },
    },
    layers: [
      // the Gulf of California (Natural Earth 1:10m), under everything else
      { id: 'sea', type: 'fill', source: 'sea', paint: { 'fill-color': P.sea, 'fill-opacity': 0.9 } },
      // old-map ripple lines following the shore (Atlas only; opacity 0 in Norteño)
      {
        id: 'sea-ripple', type: 'line', source: 'sea', maxzoom: 12.5,
        paint: { 'line-color': P.ripple, 'line-opacity': P.rippleOpacity, 'line-width': 0.8, 'line-offset': ['interpolate', ['linear'], ['zoom'], 8, 4, 12, 10] },
      },
      {
        id: 'sea-ripple-2', type: 'line', source: 'sea', maxzoom: 12.5,
        paint: { 'line-color': P.ripple, 'line-opacity': P.rippleOpacity, 'line-width': 0.5, 'line-offset': ['interpolate', ['linear'], ['zoom'], 8, 9, 12, 20] },
      },
      { id: 'sea-edge', type: 'line', source: 'sea', paint: { 'line-color': P.seaEdge, 'line-width': ['interpolate', ['linear'], ['zoom'], 8, 1, 13, 2] } },
      {
        id: 'hillshade',
        type: 'hillshade',
        source: 'dem',
        paint: {
          'hillshade-exaggeration': ['interpolate', ['linear'], ['zoom'], 9, 0.55, 14, 0.35],
          'hillshade-shadow-color': P.shadow,
          'hillshade-highlight-color': P.highlight,
          'hillshade-accent-color': P.accent,
          'hillshade-illumination-direction': 315,
        },
      },
      {
        id: 'parks',
        type: 'fill',
        source: 'water',
        filter: ['==', ['get', 'kind'], 'park'],
        minzoom: 12,
        paint: { 'fill-color': P.park, 'fill-opacity': ['interpolate', ['linear'], ['zoom'], 12, 0, 13, 0.55], 'fill-outline-color': P.parkEdge },
      },
      {
        id: 'riverbed',
        type: 'line',
        source: 'water',
        filter: ['==', ['get', 'kind'], 'river'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': P.riverbed, 'line-width': ['interpolate', ['linear'], ['zoom'], 9, 2, 14, 9], 'line-opacity': 0.9 },
      },
      {
        id: 'river',
        type: 'line',
        source: 'water',
        filter: ['==', ['get', 'kind'], 'river'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': P.river, 'line-width': ['interpolate', ['linear'], ['zoom'], 9, 0.8, 14, 2], 'line-dasharray': [2, 2] },
      },
      {
        id: 'water',
        type: 'fill',
        source: 'water',
        filter: ['==', ['get', 'kind'], 'water'],
        paint: { 'fill-color': P.water, 'fill-opacity': 0.85 },
      },
      {
        id: 'water-edge',
        type: 'line',
        source: 'water',
        filter: ['==', ['get', 'kind'], 'water'],
        paint: { 'line-color': P.waterEdge, 'line-width': 1.4 },
      },
    ],
  }
}
