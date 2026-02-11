import React, { useMemo, useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, Legend, ScatterChart, Scatter, CartesianGrid, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer,
} from 'recharts';
import { Newspaper, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

/*
 * GlobalAnalytics Component - v2.3
 * Integrated Real-time RSS Feed with Proxy.
 * Layout adapts to Full-screen mode.
 */

const PIE_COLOURS = ['#06b6d4', '#8b5cf6', '#ef4444', '#facc15', '#22c55e', '#e879f9'];

// RSS Proxy URL (rss2json.com is free and reliable for this)
const RSS_API = "https://api.rss2json.com/v1/api.json?rss_url=";
// Default News Feed (BBC World News or similar)
// User can replace this with their Google Alerts RSS URL
const DEFAULT_FEED = "https://www.google.com/alerts/feeds/08185291032701299485/6950656386178969119";

export default function GlobalAnalytics({ data, isExpanded }) {
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(false);

  // --- RSS Fetching Logic ---
  useEffect(() => {
    if (isExpanded) {
      setLoadingNews(true);
      fetch(`${RSS_API}${encodeURIComponent(DEFAULT_FEED)}`)
        .then(res => res.json())
        .then(json => {
          if (json.status === "ok") {
            setNews(json.items.slice(0, 10)); // Top 10 news
          }
          setLoadingNews(false);
        })
        .catch(err => {
          console.error("RSS Load Error", err);
          setLoadingNews(false);
        });
    }
  }, [isExpanded]);

  const countries = useMemo(() => {
    const arr = [];
    if (data && data.regions) {
      Object.values(data.regions).forEach((region) => {
        region.forEach((entry) => arr.push(entry));
      });
    }
    return arr;
  }, [data]);

  // Chart Data Calculations
  const { pieData, scatterData, xDomain, yDomain } = useMemo(() => {
    let totalGDP = 0;
    countries.forEach((c) => { totalGDP += c.canonical?.economy?.gdp_nominal?.value ?? 0; });
    const sorted = [...countries].sort((a, b) => (b.canonical?.economy?.gdp_nominal?.value ?? 0) - (a.canonical?.economy?.gdp_nominal?.value ?? 0));
    const top5 = sorted.slice(0, 5);
    const pie = top5.map((c) => ({ name: c.master.name, value: c.canonical?.economy?.gdp_nominal?.value ?? 0 }));
    if (totalGDP - top5.reduce((s, c) => s + (c.canonical?.economy?.gdp_nominal?.value ?? 0), 0) > 0) 
      pie.push({ name: 'Rest of World', value: totalGDP - top5.reduce((s, c) => s + (c.canonical?.economy?.gdp_nominal?.value ?? 0), 0) });
    
    const scatter = [];
    countries.forEach((c) => {
      const gdp = c.canonical?.economy?.gdp_nominal?.value ?? 0;
      const pop = c.canonical?.society?.population?.value ?? 0;
      if (!gdp || !pop) return;
      const x = gdp / pop;
      let y = c.canonical?.politics?.vdem_score ? c.canonical.politics.vdem_score * 100 : 100 - (c.canonical?.risk?.fsi_total?.value || 0);
      if (x < 150000) scatter.push({ name: c.master.name, x, y });
    });
    const xVals = scatter.map(d => d.x);
    const yVals = scatter.map(d => d.y);
    return { pieData: pie, scatterData: scatter, xDomain: [0, Math.max(...xVals, 1000)], yDomain: [0, 100] };
  }, [countries]);

  return (
    <div className={`grid gap-6 h-full transition-all ${isExpanded ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1 lg:grid-cols-2'}`}>
      
      {/* LEFT / TOP SECTION: CHARTS */}
      <div className={`${isExpanded ? 'lg:col-span-8' : ''} grid grid-cols-1 md:grid-cols-2 gap-4 h-full`}>
        {/* Chart 1: Pie */}
        <div className="glassmorphic p-4 flex flex-col border border-primary/10">
          <h4 className="text-[10px] text-primary font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-primary animate-pulse"></div>
            Economic Power Distribution
          </h4>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius="50%" outerRadius="80%" paddingAngle={4} stroke="none">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLOURS[i % PIE_COLOURS.length]} />)}
                </Pie>
                <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: '10px', color: '#cbd5e1' }} />
                <ChartTooltip 
                   contentStyle={{ backgroundColor: '#020617', border: '1px solid #334155', color: '#f1f5f9', fontSize: '11px' }}
                   itemStyle={{ color: '#f1f5f9' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Scatter */}
        <div className="glassmorphic p-4 flex flex-col border border-primary/10">
          <h4 className="text-[10px] text-primary font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-primary animate-pulse"></div>
            Correlation: Wealth vs Stability
          </h4>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" opacity={0.2} />
                <XAxis type="number" dataKey="x" name="GDP/Cap" tickFormatter={v => `$${(v/1000).toFixed(0)}k`} tick={{fill:'#64748b', fontSize:10}} />
                <YAxis type="number" dataKey="y" name="Stability" tick={{fill:'#64748b', fontSize:10}} />
                <ChartTooltip 
                  cursor={{strokeDasharray:'3 3', stroke:'#06b6d4'}}
                  contentStyle={{ backgroundColor: '#020617', border: '1px solid #334155', color: '#f1f5f9', fontSize: '11px' }}
                  itemStyle={{ color: '#f1f5f9' }}
                />
                <Scatter data={scatterData} fill="#8b5cf6" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION: NEWS FEED (Only prominent when expanded) */}
      <div className={`${isExpanded ? 'lg:col-span-4 block' : 'hidden'} flex flex-col h-full glassmorphic border border-primary/20 bg-primary/5 overflow-hidden`}>
        <div className="p-4 border-b border-primary/20 flex justify-between items-center bg-primary/10">
          <h4 className="text-[10px] text-primary font-bold uppercase tracking-[0.2em] flex items-center gap-2">
            <Newspaper size={14} /> LIVE INTELLIGENCE FEED
          </h4>
          {loadingNews && <RefreshCw size={14} className="animate-spin text-primary" />}
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {news.length > 0 ? (
            news.map((item, idx) => (
              <a 
                key={idx} 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block group p-3 border border-white/5 bg-slate-900/40 hover:bg-primary/10 hover:border-primary/40 transition-all rounded"
              >
                <div className="text-[10px] text-slate-500 mb-1 flex justify-between">
                   <span>{new Date(item.pubDate).toLocaleDateString()}</span>
                   <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h5 className="text-xs font-bold text-slate-200 group-hover:text-primary transition-colors leading-snug">
                  {item.title}
                </h5>
                <p className="text-[10px] text-slate-500 line-clamp-2 mt-2 group-hover:text-slate-400">
                  {item.content.replace(/<[^>]*>?/gm, '').slice(0, 100)}...
                </p>
              </a>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2">
               <AlertCircle size={24} />
               <span className="text-[10px] tracking-widest uppercase">No Intel Found / Check Proxy</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
