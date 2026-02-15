import React, { useMemo, useCallback } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { GEO_URL, ISO_MAP } from '../constants/isoMap';
import { mixColours, COLOUR_LOW, COLOUR_MID, COLOUR_HIGH } from '../utils/colorUtils';
import { getChinaColour, getNaturalResourceColour } from '../utils/layerColorUtils';
import { getUSColour } from '../utils/usLayerUtils';

const WorldMap = React.memo(({ data, activeLayer, chinaInfluenceData, resourcesData, usInfluenceData, onCountryClick, onHover, selectedIso }) => {
  // ── データ処理 ───────────────────────────────────────────────
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

  // ── 色計算 ──────────────────────────────────────────────────
  const getColour = useCallback((risk) => {
    if (risk == null) return '#1e293b'; // slate-800
    // FSIは通常 0-120 の範囲だが、データの実測値に合わせて調整
    const t = (risk - minR) / (maxR - minR || 1);
    if (t < 0.5) return mixColours(COLOUR_LOW, COLOUR_MID, t / 0.5);
    return mixColours(COLOUR_MID, COLOUR_HIGH, (t - 0.5) / 0.5);
  }, [minR, maxR]);

  const geoStyle = useMemo(() => ({
    default: { outline: 'none', transition: 'all 0.2s ease' },
    hover:   { fill: '#f8fafc', stroke: '#cbd5e1', strokeWidth: 1.5, cursor: 'pointer', outline: 'none' },
    pressed: { fill: '#e2e8f0', outline: 'none' },
  }), []);

  // ── 凡例（Legend）設定 ──────────────────────────────────────
  const legendConfig = useMemo(() => {
    switch (activeLayer) {
      case 'us':
        return {
          title: 'US Influence Score',
          gradient: 'linear-gradient(to right, #0f172a, #2563eb, #dbeafe)',
          labels: ['0', '25', '50', '75', '100'],
          colorClass: 'text-blue-400'
        };
      case 'china':
        return {
          title: 'China Influence Score',
          gradient: 'linear-gradient(to right, #6b7280, #fbbf24, #dc2626)',
          labels: ['0', '25', '50', '75', '100'],
          colorClass: 'text-amber-400'
        };
      case 'resources':
        return {
          title: 'Resource Strat. Index',
          gradient: 'linear-gradient(to right, #475569, #50C878, #D4AF37, #CD7F32)',
          labels: ['0', '25', '50', '75', '100'],
          colorClass: 'text-emerald-400'
        };
      default: // fsi
        return {
          title: 'Fragile States Index (FSI)',
          // FSIの色配分: Low(Cyan) -> Mid(Purple) -> High(Red)
          gradient: 'linear-gradient(to right, #06b6d4, #8b5cf6, #ef4444)',
          labels: ['0', '30', '60', '90', '120'], // FSIはMAX120
          colorClass: 'text-rose-400'
        };
    }
  }, [activeLayer]);

  // ── レンダリング ────────────────────────────────────────────
  return (
    <div className="w-full h-full bg-[#020617]">
      <ComposableMap projectionConfig={{ scale: 220 }} className="w-full h-full outline-none">
        <ZoomableGroup center={[10, 15]} zoom={1.5} minZoom={1} maxZoom={8} translateExtent={[[-500, -200], [1300, 800]]}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const isoAlpha3 = ISO_MAP[geo.id];
                const iso = isoAlpha3 || geo.id;
                
                // レイヤーに応じた色決定
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
                    stroke={isSelected ? "#fff" : "rgba(255,255,255,0.08)"}
                    strokeWidth={isSelected ? 1.5 : 0.5}
                    style={geoStyle}
                    onMouseEnter={(evt) => onHover(iso, { x: evt.clientX, y: evt.clientY })}
                    onMouseLeave={() => onHover(null)}
                    onClick={() => { if (isoAlpha3) onCountryClick(iso); }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>

        {/* 凡例パネル (Legend Panel) - Matte Style */}
        <div className="absolute bottom-8 right-8 z-20 font-sans select-none">
          <div className="bg-[#0f172a]/95 backdrop-blur-md border border-white/[0.08] rounded-lg p-4 shadow-2xl min-w-[200px]">
            {/* タイトル */}
            <div className="flex justify-between items-end mb-2">
              <span className={`text-[11px] uppercase font-bold tracking-wider ${legendConfig.colorClass}`}>
                {legendConfig.title}
              </span>
            </div>
            
            {/* カラーバー */}
            <div className="h-3 w-full rounded-[2px] mb-1.5 relative border border-white/10" 
                 style={{ background: legendConfig.gradient }}>
              {/* メモリ線（Ticks） */}
              <div className="absolute inset-0 flex justify-between px-[1px]">
                {[0, 1, 2, 3, 4].map(i => (
                   <div key={i} className="w-[1px] h-full bg-white/20" />
                ))}
              </div>
            </div>

            {/* 数値ラベル */}
            <div className="flex justify-between text-[9px] text-slate-400 font-mono font-medium">
              {legendConfig.labels.map((label, i) => (
                <span key={i} className={i === 0 ? "text-left" : i === 4 ? "text-right" : "text-center"}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </ComposableMap>
    </div>
  );
});

WorldMap.displayName = 'WorldMap';
export default WorldMap;
