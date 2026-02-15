import React, { useState, useEffect } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { RSS_API, NEWS_SOURCES } from '../constants/isoMap';

// 個別フィードカラム
const FeedColumn = ({ source, isExpanded }) => {
  const [news, setNews]       = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isExpanded && news.length === 0) {
      setLoading(true);
      fetch(`${RSS_API}${encodeURIComponent(source.url)}`)
        .then(res => res.json())
        .then(json => {
          if (json.status === "ok") setNews(json.items.slice(0, 8));
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isExpanded, news.length, source.url]);

  return (
    <div className="flex flex-col h-full bg-[#0f172a]/40 border border-white/[0.06] rounded-lg overflow-hidden">
      {/* ヘッダー */}
      <div className="px-4 py-3 border-b border-white/[0.06] flex justify-between items-center bg-white/[0.02]">
        <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-2">
          {source.name}
        </h4>
        {loading && <RefreshCw size={12} className="animate-spin text-slate-500" />}
      </div>

      {/* ニュースリスト */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {news.map((item, i) => (
          <a
            key={i}
            href={item.link}
            target="_blank"
            rel="noreferrer"
            className="block p-4 border-b border-white/[0.04] hover:bg-white/[0.04] transition-colors group"
          >
            <div className="flex justify-between items-start gap-3 mb-1">
              <span className="text-[10px] text-slate-500 font-medium">
                {new Date(item.pubDate).toLocaleDateString()}
              </span>
              <ExternalLink size={10} className="text-slate-600 group-hover:text-slate-400" />
            </div>
            <h5 className="text-xs font-medium text-slate-300 group-hover:text-white leading-relaxed line-clamp-2">
              {item.title}
            </h5>
          </a>
        ))}
      </div>
    </div>
  );
};

const GlobalStreamPanel = ({ isExpanded }) => {
  return (
    <div className={`grid gap-4 h-full transition-all duration-700 w-full px-6 pb-6 ${isExpanded ? 'grid-cols-1 md:grid-cols-3 opacity-100' : 'grid-cols-1 opacity-0'}`}>
      {NEWS_SOURCES.map((source) => (
        <FeedColumn key={source.id} source={source} isExpanded={isExpanded} />
      ))}
    </div>
  );
};

export default GlobalStreamPanel;
