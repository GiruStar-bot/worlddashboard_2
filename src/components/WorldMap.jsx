import React, { useMemo, useCallback } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { GEO_URL, ISO_MAP } from '../constants/isoMap';
import { mixColours, COLOUR_LOW, COLOUR_MID, COLOUR_HIGH } from '../utils/colorUtils';
import { getChinaColour, getNaturalResourceColour } from '../utils/layerColorUtils';
import { getUSColour } from '../utils/usLayerUtils';

const WorldMap = React.memo(({ data, activeLayer, chinaInfluenceData, resourcesData, usInfluenceData, onCountryClick, onHover, selectedIso }) => {
  // データ処理ロジックは変更なし
  const riskByIso = useMemo(() => {
    const map = {};
    if (data && data.regions) {
      Object.values(data.regions).forEach((region) => {
        region.forEach((entry) => {
          map[entry.master.iso3] = entry.canonical?.risk?.fsi_total?.value;
        });
      });
    }
    return map;
  }, [data]);

  const influenceByIso = useMemo(() => chinaInfluenceData?.countries || {}, [chinaInfluenceData]);
  const resourcesByIso = useMemo(() => resourcesData?.countries || {}, [resourcesData]);
  const usByIso = useMemo(() => usInfluenceData?.countries || {}, [usInfluenceData]);

  const [minR, maxR] = useMemo(() => {
    const values = Object.values(riskByIso).filter((v) => v != null);
    if (!values.length) return [0, 120];
    return [Math.min(...values), Math.max(...values)];
  }, [riskByIso]);

  const getColour = useCallback((risk) => {
    if (risk == null) return '#1e293b'; // slate-800
    const t = (risk - minR) / (maxR - minR || 1);
    if (t < 0.5) return mixColours(COLOUR_LOW, COLOUR_MID, t / 0.5);
    return mixColours(COLOUR_MID, COLOUR_HIGH, (t - 0.5) / 0.5);
  }, [minR, maxR]);

  // スタイルの刷新: 発光ではなく、明度変化で表現
  const geoStyle = useMemo(() => ({
    default: { outline: 'none', transition: 'all 0.2s ease' },
    hover:   { fill: '#f8fafc', stroke: '#cbd5e1', strokeWidth: 1.5, cursor: 'pointer', outline: 'none' }, // white-ish
    pressed: { fill: '#e2e8f0', outline: 'none' },
  }), []);

  return (
    <div className="w-full h-full bg-[#020617]"> {/* 背景を完全なダークへ */}
      <ComposableMap projectionConfig={{ scale: 220 }} className="w-full h-full outline-none">
        <ZoomableGroup center={[10, 15]} zoom={1.5} minZoom={1} maxZoom={8} translateExtent={[[-500, -200], [1300, 800]]}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const isoAlpha3 = ISO_MAP[geo.id];
                const iso = isoAlpha3 || geo.id;
                const baseFill =
                  activeLayer === 'us'        ? getUSColour(usByIso[iso]?.score) :
                  activeLayer === 'resources' ? getNaturalResourceColour(resourcesByIso[iso]?.score) :
                  activeLayer === 'china'     ? getChinaColour(influenceByIso[iso]?.score) :
                  getColour(riskByIso[iso]);
                
                const isSelected = iso === selectedIso;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={baseFill}
                    // 選択時は白枠で強調、通常時は薄い境界線
                    stroke={isSelected ? "#fff" : "rgba(255,255,255,0.08)"}
                    strokeWidth={isSelected ? 1.5 : 0.5}
                    style={geoStyle}
                    onMouseEnter={(evt) => onHover(iso, { x: evt.clientX, y: evt.clientY })}
                    onMouseLeave={() => onHover(null)}
                    onClick={() => { if (isoAlpha3) onCountryClick(iso); }}
                    // SVG filter (glow) を削除
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>

        {/* 凡例 (Legend): マットなカードデザインに変更 */}
        <div className="absolute bottom-8 right-8 z-20 font-sans select-none">
          <div className="bg-[#0f172a]/90 backdrop-blur-md border border-white/[0.06] rounded-lg p-4 shadow-xl">
            <div className="text-[10px] uppercase font-semibold text-slate-400 mb-2 tracking-wider">
              {activeLayer === 'us' ? 'US Influence Sphere' :
               activeLayer === 'china' ? 'China Influence Sphere' :
               activeLayer === 'resources' ? 'Resource Strategy Index' :
               'Geopolitical Fragility (FSI)'}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-slate-500 font-medium">Low</span>
              <div className="h-2 w-32 rounded-sm" style={{
                background: activeLayer === 'us'
                  ? 'linear-gradient(to right, #0f172a, #2563eb, #dbeafe)'
                  : activeLayer === 'china'
                  ? 'linear-gradient(to right, #6b7280, #fbbf24, #dc2626)'
                  : activeLayer === 'resources'
                  ? 'linear-gradient(to right, #475569, #50C878, #D4AF37, #CD7F32)'
                  : 'linear-gradient(to right, #06b6d4, #8b5cf6, #ef4444)'
              }} />
              <span className="text-[9px] text-slate-500 font-medium">High</span>
            </div>
          </div>
        </div>
      </ComposableMap>
    </div>
  );
});

WorldMap.displayName = 'WorldMap';
export default WorldMap;
