import React from 'react';
import { X, TrendingUp, Users, Activity, ExternalLink, ShieldAlert, Zap, Globe, AlertTriangle } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';

export default function CountryDetails({ country, onClose, data, onOpenDeepReport }) {
  if (!country) return null;

  // データ取得ロジック（安全なアクセス）
  const info = data?.regions?.['Global']?.find(c => c.master.iso3 === country) || {};
  const metrics = info.canonical || {};
  const master = info.master || {};

  // レーダーチャート用データ生成
  const radarData = [
    { subject: 'Economy', A: metrics.economy?.gdp_growth_annual?.value ? Math.min(metrics.economy.gdp_growth_annual.value * 10, 100) : 50, fullMark: 100 },
    { subject: 'Stability', A: metrics.risk?.fsi_total?.value ? 120 - metrics.risk.fsi_total.value : 50, fullMark: 120 }, // FSIは低いほど良いので反転
    { subject: 'Resilience', A: 60, fullMark: 100 }, // 仮データ
  ];

  return (
    // ── レスポンシブ対応のコンテナ ──
    // Mobile: fixed bottom-0 w-full h-[85vh] (下から出てくるシート)
    // Desktop (md以上): absolute right-0 top-0 w-[450px] h-full (右側のサイドバー)
    <div className="fixed md:absolute bottom-0 md:top-0 left-0 md:left-auto right-0 z-50
                    w-full h-[85vh] md:h-full md:w-[450px]
                    bg-[#0f172a]/95 backdrop-blur-xl border-t md:border-l border-white/10 
                    shadow-2xl transition-transform duration-300 ease-in-out
                    rounded-t-3xl md:rounded-none md:rounded-l-2xl overflow-hidden flex flex-col">
      
      {/* Mobile用: ドラッグハンドル（視覚的ヒント） */}
      <div className="md:hidden w-full flex justify-center pt-3 pb-1">
        <div className="w-12 h-1.5 bg-white/20 rounded-full" />
      </div>

      {/* Header Area */}
      <div className="p-6 border-b border-white/10 flex justify-between items-start shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 tracking-wider">
              TARGET_ACQUIRED
            </span>
            <span className="text-xs text-slate-500 font-mono">{master.iso3}</span>
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight mb-1 font-sans">
            {master.name || country}
          </h2>
          <p className="text-xs text-emerald-400 font-mono flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            LIVE MONITORING ACTIVE
          </p>
        </div>
        <button 
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar pb-20 md:pb-6">
        
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/[0.03] p-4 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Users size={14} />
              <span className="text-xs font-medium uppercase">Population</span>
            </div>
            <div className="text-xl font-bold text-slate-200 font-mono">
              {metrics.demographics?.population_total?.value 
                ? (metrics.demographics.population_total.value / 1000000).toFixed(1) + 'M' 
                : 'N/A'}
            </div>
          </div>
          <div className="bg-white/[0.03] p-4 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Activity size={14} />
              <span className="text-xs font-medium uppercase">GDP Growth</span>
            </div>
            <div className={`text-xl font-bold font-mono ${
              (metrics.economy?.gdp_growth_annual?.value || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {metrics.economy?.gdp_growth_annual?.value 
                ? `${metrics.economy.gdp_growth_annual.value}%` 
                : 'N/A'}
            </div>
          </div>
          <div className="bg-white/[0.03] p-4 rounded-xl border border-white/5 col-span-2">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2 text-slate-400">
                <ShieldAlert size={14} />
                <span className="text-xs font-medium uppercase">Fragile States Index</span>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                (metrics.risk?.fsi_total?.value || 0) > 80 ? 'bg-rose-500/20 text-rose-400' : 
                (metrics.risk?.fsi_total?.value || 0) > 60 ? 'bg-amber-500/20 text-amber-400' : 
                'bg-emerald-500/20 text-emerald-400'
              }`}>
                {(metrics.risk?.fsi_total?.value || 0) > 80 ? 'CRITICAL' : 
                 (metrics.risk?.fsi_total?.value || 0) > 60 ? 'WARNING' : 'STABLE'}
              </span>
            </div>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold text-white font-mono">
                {metrics.risk?.fsi_total?.value || 'N/A'}
                <span className="text-sm text-slate-500 ml-1">/ 120</span>
              </div>
              <div className="text-xs text-slate-500 mb-1">Risk Score</div>
            </div>
            {/* Simple Progress Bar */}
            <div className="w-full h-1.5 bg-slate-700 rounded-full mt-3 overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  (metrics.risk?.fsi_total?.value || 0) > 80 ? 'bg-rose-500' : 
                  (metrics.risk?.fsi_total?.value || 0) > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${(metrics.risk?.fsi_total?.value / 120) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Radar Chart (Strategic Balance) */}
        <div className="bg-white/[0.03] rounded-xl border border-white/5 p-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Zap size={14} className="text-yellow-400" />
            Strategic Balance
          </h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name={country}
                  dataKey="A"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Button: Deep Dive */}
        <button 
          onClick={() => onOpenDeepReport(country)}
          className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/25"
        >
          <div className="relative z-10 flex items-center justify-between">
            <div className="text-left">
              <div className="text-xs font-medium text-blue-200 mb-1">INTELLIGENCE ACCESS</div>
              <div className="text-lg font-bold text-white">Deep Dive Report</div>
            </div>
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm group-hover:bg-white/30 transition-colors">
              <ExternalLink className="text-white" size={20} />
            </div>
          </div>
          {/* Background Decor */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        </button>

      </div>
    </div>
  );
}
