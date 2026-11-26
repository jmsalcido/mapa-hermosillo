import type { StyleSpecification } from 'maplibre-gl'
import { dataUrl } from '../data'

export const INK = '#2a1d12'

/** Fully custom style: no basemap tiles, only our data + a DEM hillshade on parchment. */
export function baseStyle(): StyleSpecification {
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
      roads: { type: 'geojson', data: dataUrl('roads_major.geojson') },
    },
    layers: [
      {
        id: 'hillshade',
        type: 'hillshade',
        source: 'dem',
        paint: {
          'hillshade-exaggeration': ['interpolate', ['linear'], ['zoom'], 9, 0.55, 14, 0.35],
          'hillshade-shadow-color': '#6b4526',
          'hillshade-highlight-color': '#fff6df',
          'hillshade-accent-color': '#8a6038',
          'hillshade-illumination-direction': 315,
        },
      },
      {
        id: 'parks',
        type: 'fill',
        source: 'water',
        filter: ['==', ['get', 'kind'], 'park'],
        minzoom: 12,
        paint: { 'fill-color': '#8fa86a', 'fill-opacity': ['interpolate', ['linear'], ['zoom'], 12, 0, 13, 0.55], 'fill-outline-color': '#4f6a3a' },
      },
      {
        id: 'riverbed',
        type: 'line',
        source: 'water',
        filter: ['==', ['get', 'kind'], 'river'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#e8d3a6', 'line-width': ['interpolate', ['linear'], ['zoom'], 9, 2, 14, 9], 'line-opacity': 0.9 },
      },
      {
        id: 'river',
        type: 'line',
        source: 'water',
        filter: ['==', ['get', 'kind'], 'river'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#5f8fa8', 'line-width': ['interpolate', ['linear'], ['zoom'], 9, 0.8, 14, 2], 'line-dasharray': [2, 2] },
      },
      {
        id: 'water',
        type: 'fill',
        source: 'water',
        filter: ['==', ['get', 'kind'], 'water'],
        paint: { 'fill-color': '#7fa9b8', 'fill-opacity': 0.85 },
      },
      {
        id: 'water-edge',
        type: 'line',
        source: 'water',
        filter: ['==', ['get', 'kind'], 'water'],
        paint: { 'line-color': '#3c6476', 'line-width': 1.4 },
      },
    ],
  }
}
