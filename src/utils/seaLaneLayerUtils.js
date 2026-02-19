// src/utils/seaLaneLayerUtils.js

import { SEA_LANES } from '../constants/seaLanes';

export const SEA_LANE_SOURCE_ID = 'sealane-source';
export const SEA_LANE_LAYER_ID = 'sealane-lines';

/**
 * Converts the SEA_LANES array into a GeoJSON FeatureCollection of LineString
 * features suitable for rendering as a MapLibre line layer.
 */
export function buildSeaLaneGeojson() {
  return {
    type: 'FeatureCollection',
    features: SEA_LANES.map((lane) => ({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: lane.coordinates,
      },
      properties: {
        id: lane.id,
        name: lane.name,
        type: lane.type,
      },
    })),
  };
}

/**
 * Returns the MapLibre layer style definition for sea lane lines.
 *
 * Visual rules:
 *   - energy routes  → orange (#f59e0b)
 *   - trade routes   → cyan   (#06b6d4)
 *   - Dashed line to convey shipping-route aesthetic
 */
export function getSeaLaneLayerStyle() {
  return {
    type: 'line',
    paint: {
      'line-color': [
        'match', ['get', 'type'],
        'energy', '#f59e0b',
        'trade', '#06b6d4',
        '#94a3b8', // fallback
      ],
      'line-width': 2.0,
      'line-opacity': 0.6,
      'line-dasharray': [2, 2],
    },
  };
}
