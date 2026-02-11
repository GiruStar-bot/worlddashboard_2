import React, { useMemo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';

/*
 * WorldMap component renders an interactive map coloured by the Fragile
 * States Index (FSI).
 */

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json';

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }) {
  return (
    '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')
  );
}

function mixColours(a, b, t) {
  return rgbToHex({
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  });
}

const COLOUR_LOW = hexToRgb('#06b6d4');
const COLOUR_MID = hexToRgb('#8b5cf6');
const COLOUR_HIGH = hexToRgb('#ef4444');

export default function WorldMap({ data, onCountryClick, onHover, selectedIso }) {
  const riskByIso = useMemo(() => {
    const map = {};
    if (data && data.regions) {
      Object.values(data.regions).forEach((region) => {
        region.forEach((entry) => {
          const iso = entry.master.iso3;
          const risk = entry.canonical?.risk?.fsi_total?.value;
          map[iso] = risk;
        });
      });
    }
    return map;
  }, [data]);

  const [minRisk, maxRisk] = useMemo(() => {
    const values = Object.values(riskByIso).filter((v) => v != null);
    if (!values.length) return [0, 120];
    return [Math.min(...values), Math.max(...values)];
  }, [riskByIso]);

  const getColour = (risk) => {
    if (risk == null) return '#1e293b'; 
    if (minRisk === maxRisk) return rgbToHex(COLOUR_LOW);
    const t = (risk - minRisk) / (maxRisk - minRisk);
    if (t < 0.5) {
      return mixColours(COLOUR_LOW, COLOUR_MID, t / 0.5);
    }
    return mixColours(COLOUR_MID, COLOUR_HIGH, (t - 0.5) / 0.5);
  };

  return (
    <ComposableMap projectionConfig={{ scale: 140 }} className="w-full h-full">
      <ZoomableGroup center={[0, 20]} zoom={1} maxZoom={4} minZoom={0.7}>
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              // Ensure we use the correct ID property from TopoJSON
              const iso = geo.properties.ISO_A3 || geo.id;
              const risk = riskByIso[iso];
              const fill = getColour(risk);
              const isSelected = iso === selectedIso;
              
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fill}
                  stroke="#334155"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { fill: '#f472b6', cursor: 'pointer' },
                    pressed: { outline: 'none' },
                  }}
                  onMouseEnter={(evt) => {
                    const { clientX: x, clientY: y } = evt;
                    onHover(iso, { x, y });
                  }}
                  onMouseLeave={() => onHover(null)}
                  onClick={() => onCountryClick(iso)}
                  filter={isSelected ? 'url(#country-glow)' : undefined}
                />
              );
            })
          }
        </Geographies>
      </ZoomableGroup>
      <defs>
        <filter id="country-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </ComposableMap>
  );
}
