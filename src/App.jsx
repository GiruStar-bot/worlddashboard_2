import React, { useEffect, useState, useMemo } from 'react';
import WorldMap from './components/WorldMap.jsx';
import CountryDetails from './components/CountryDetails.jsx';
import GlobalAnalytics from './components/GlobalAnalytics.jsx';
import { Globe, ChevronUp, ChevronDown, Activity } from 'lucide-react';

/*
 * App Component - Cyberpunk HUD Layout
 * Refactored to maximize map visibility. Panels are now overlays.
 */
export default function App() {
  const [data, setData] = useState(null);
  const [selectedIso, setSelectedIso] = useState(null);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false); // ボトムパネルの開閉状態

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}worlddash_global_master.json`)
      .then((res) => {
        if (!res.ok) throw new Error("JSON not found");
        return res.json();
      })
      .then((json) => setData(json))
      .catch((err) => console.error('Failed to load data', err));
  }, []);

  const countryByIso3 = useMemo(() => {
    const map = {};
    if (!data) return map;
    Object.values(data.regions).forEach((region) => {
      region.forEach((entry) => {
        map[entry.master.iso3] = entry;
      });
    });
    return map;
  }, [data]);

  const selectedCountry = selectedIso ? countryByIso3[selectedIso] : null;

  const handleCountryClick = (iso3) => {
    // 同じ国をクリックしたら選択解除、別の国なら選択
    setSelectedIso((prev) => (prev === iso3 ? null : iso3));
  };

  const handleHover = (iso3, position) => {
    if (!iso3) {
      setHoverInfo(null);
    } else {
      setHoverInfo({ iso3, x: position.x, y: position.y });
    }
  };

  if (!data) {
    return (
      <div className="h-screen flex items-center justify-center text-xl text-secondary animate-pulse font-mono bg-slate-950">
        INITIALIZING SYSTEM...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950 relative font-sans text-slate-200">
      {/* Background Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none scanline-effect z-50 opacity-10"></div>

      {/* Header - Transparent overlay */}
      <header className="absolute top-0 left-0 right-0 h-14 flex items-center px-6 justify-between z-40 bg-gradient-to-b from-slate-950/90 to-transparent pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <Globe className="text-primary animate-pulse" size={20} />
          <h1 className="text-lg font-bold tracking-widest text-slate-100 font-mono">
            WORLD<span className="text-primary text-glow">DASH</span> <span className="text-[10px] text-slate-500 ml-1">v2.1</span>
          </h1>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            LIVE
          </div>
          <div className="hidden sm:block text-slate-500">COUNTRIES: {data.meta?.stats?.total_countries || 0}</div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden">
        
        {/* 1. Map Layer (Background) */}
        <div className="absolute inset-0 z-0 bg-slate-950">
          <WorldMap
            data={data}
            onCountryClick={handleCountryClick}
            onHover={handleHover}
            selectedIso={selectedIso}
          />
        </div>

        {/* 2. Tooltip Overlay */}
        {hoverInfo && (
          <div
            className="fixed z-50 px-3 py-2 text-xs bg-slate-900/90 backdrop-blur border border-primary/30 text-slate-100 font-mono shadow-[0_0_15px_rgba(6,182,212,0.2)] pointer-events-none"
            style={{ left: hoverInfo.x + 15, top: hoverInfo.y + 15 }}
          >
            <div className="font-bold text-primary mb-1">
              {countryByIso3[hoverInfo.iso3]?.master?.name || hoverInfo.iso3}
            </div>
            {(() => {
              const country = countryByIso3[hoverInfo.iso3];
              if (!country) return null;
              const risk = country.canonical?.risk?.fsi_total?.value;
              return risk != null ? (
                <div className="flex items-center gap-2">
                  <span className={risk > 80 ? "text-red-400" : "text-emerald-400"}>
                    FSI: {risk.toFixed(1)}
                  </span>
                </div>
              ) : null;
            })()}
          </div>
        )}

        {/* 3. Right Sidebar (Country Details) - Slide-in Overlay */}
        <aside
          className={`
            absolute top-14 bottom-0 right-0 w-80 md:w-96
            bg-slate-900/85 backdrop-blur-md border-l border-primary/20
            transform transition-transform duration-500 ease-out z-20
            ${selectedCountry ? 'translate-x-0' : 'translate-x-full'}
          `}
        >
          {selectedCountry && (
            <CountryDetails 
              country={selectedCountry} 
              onClose={() => setSelectedIso(null)} 
            />
          )}
        </aside>

        {/* 4. Bottom Analytics Panel - Collapsible Overlay */}
        <footer
          className={`
            absolute bottom-0 left-0 right-0 z-30
            bg-slate-900/90 backdrop-blur-lg border-t border-white/10
            transition-all duration-300 ease-in-out flex flex-col
            ${isAnalyticsOpen ? 'h-80' : 'h-10'}
            ${selectedCountry ? 'md:pr-96' : ''} /* サイドバーがあるときは右端を空ける */
          `}
        >
          {/* Toggle Button */}
          <button
            onClick={() => setIsAnalyticsOpen(!isAnalyticsOpen)}
            className="h-10 w-full flex items-center justify-center gap-2 text-xs font-mono text-slate-400 hover:text-primary hover:bg-white/5 transition-colors border-b border-white/5 shrink-0"
          >
            <Activity size={14} />
            {isAnalyticsOpen ? 'COLLAPSE ANALYTICS' : 'EXPAND GLOBAL ANALYTICS'}
            {isAnalyticsOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>

          {/* Analytics Content */}
          <div className="flex-1 overflow-hidden p-4">
            <GlobalAnalytics data={data} />
          </div>
        </footer>

      </div>
    </div>
  );
}
