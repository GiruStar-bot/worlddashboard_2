// src/utils/chokePointLayerUtils.js
import { CHOKE_POINTS } from '../constants/chokePoints';

export const CHOKE_POINT_SOURCE_ID = 'chokepoint-source';
export const CHOKE_POINT_HALO_LAYER_ID = 'chokepoint-halo';
export const CHOKE_POINT_RING_LAYER_ID = 'chokepoint-ring';
export const CHOKE_POINT_DIAMOND_LAYER_ID = 'chokepoint-diamond';
export const CHOKE_POINT_LABEL_LAYER_ID = 'chokepoint-label';

/**
 * Risk-level colour mapping:
 *   high   → alert orange (#f97316)
 *   medium → cyan (#06b6d4)
 *   low    → light cyan (#22d3ee)
 */
const RISK_COLOR_EXPR = [
  'match', ['get', 'riskLevel'],
  'high', '#f97316',
  'medium', '#06b6d4',
  '#22d3ee',
];

/**
 * Converts the CHOKE_POINTS array into a GeoJSON FeatureCollection.
 */
export function buildChokePointGeojson() {
  return {
    type: 'FeatureCollection',
    features: CHOKE_POINTS.map((cp) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: cp.coordinates,
      },
      properties: {
        id: cp.id,
        name: cp.name,
        type: cp.type,
        riskLevel: cp.riskLevel,
      },
    })),
  };
}

/**
 * Outer glow / halo — large blurred circle behind the marker.
 * Opacity is driven by animation in the map component.
 */
export function getChokePointHaloStyle() {
  return {
    type: 'circle',
    paint: {
      'circle-radius': 18,
      'circle-color': RISK_COLOR_EXPR,
      'circle-opacity': 0.0,
      'circle-blur': 0.6,
    },
  };
}

/**
 * Target-scope ring — hollow circle (transparent fill, visible stroke).
 * Gives the HUD / cyberpunk crosshair aesthetic.
 */
export function getChokePointRingStyle() {
  return {
    type: 'circle',
    paint: {
      'circle-radius': 10,
      'circle-color': 'transparent',
      'circle-stroke-width': 1.8,
      'circle-stroke-color': RISK_COLOR_EXPR,
      'circle-stroke-opacity': 0.85,
    },
  };
}

/**
 * Centre diamond marker — uses a symbol layer rendering ◆ (U+25C6).
 */
export function getChokePointDiamondStyle() {
  return {
    type: 'symbol',
    layout: {
      'text-field': '◆',
      'text-size': 14,
      'text-allow-overlap': true,
      'text-ignore-placement': true,
    },
    paint: {
      'text-color': RISK_COLOR_EXPR,
      'text-halo-color': '#020617',
      'text-halo-width': 1.2,
    },
  };
}

/**
 * Name label — displayed above the marker.
 */
export function getChokePointLabelStyle() {
  return {
    type: 'symbol',
    layout: {
      'text-field': ['get', 'name'],
      'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
      'text-size': 10,
      'text-offset': [0, -1.8],
      'text-anchor': 'bottom',
      'text-allow-overlap': false,
      'text-optional': true,
      'text-letter-spacing': 0.05,
    },
    paint: {
      'text-color': RISK_COLOR_EXPR,
      'text-halo-color': '#020617',
      'text-halo-width': 1.5,
      'text-opacity': 0.9,
    },
  };
}
