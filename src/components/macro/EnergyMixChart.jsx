import React, { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import DashboardCard from './DashboardCard';
import CustomTooltip from './CustomTooltip';

const SERIES = [
  { key: 'coal', name: '石炭', colors: ['#64748b', '#334155'] },
  { key: 'oil', name: '石油', colors: ['#78716c', '#44403c'] },
  { key: 'gas', name: '天然ガス', colors: ['#a8a29e', '#57534e'] },
  { key: 'renewables', name: '再生可能エネルギー', colors: ['#10b981', '#84cc16'] },
  { key: 'hydrogen', name: '水素', colors: ['#06b6d4', '#3b82f6'] },
];

export default function EnergyMixChart({ data }) {
  const crossoverYear = useMemo(() => {
    if (!data) return null;
    for (const d of data) {
      if (d.renewables > d.coal) return d.year;
    }
    return null;
  }, [data]);

  const previousLookup = useMemo(() => {
    if (!data) return () => null;
    const byYear = {};
    data.forEach(d => { byYear[d.year] = d; });
    return (key, yearLabel) => {
      const prevYear = parseInt(yearLabel) - 2;
      return byYear[prevYear] ? byYear[prevYear][key] : null;
    };
  }, [data]);

  if (!data) return null;

  return (
    <DashboardCard title="世界のエネルギー" subtitle="一次エネルギー消費（供給源別、EJ）" source="IEA 2025">
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            {SERIES.map(s => (
              <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.colors[0]} stopOpacity={0.8} />
                <stop offset="100%" stopColor={s.colors[1]} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={false}
            tickLine={false}
            label={{ value: 'EJ', position: 'insideTopLeft', offset: 10, style: { fontSize: 9, fill: '#64748b' } }}
          />
          <Tooltip content={<CustomTooltip unitOverride="EJ" previousDataLookup={previousLookup} />} />
          {crossoverYear && (
            <ReferenceLine
              x={crossoverYear}
              stroke="#f59e0b"
              strokeDasharray="6 3"
              strokeWidth={1.5}
              label={{
                value: `逆転 ${crossoverYear}年`,
                position: 'top',
                style: { fontSize: 9, fill: '#f59e0b', fontFamily: 'Inter' }
              }}
            />
          )}
          {SERIES.map(s => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stackId="1"
              stroke={s.colors[0]}
              strokeWidth={1.5}
              fill={`url(#grad-${s.key})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </DashboardCard>
  );
}
