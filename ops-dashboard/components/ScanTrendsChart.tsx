'use client';
import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { SCAN_TRENDS } from '@/lib/mock-data';

type Range = '7d' | '30d' | 'all';
const RANGES: { label: string; value: Range }[] = [
  { label: '7 Days',   value: '7d'  },
  { label: '30 Days',  value: '30d' },
  { label: 'All Time', value: 'all' },
];

export default function ScanTrendsChart() {
  const [range, setRange] = useState<Range>('30d');
  const data = SCAN_TRENDS[range];

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1">QR Scan Trends</h2>
          <p className="text-sm font-semibold text-stone-800">Daily scans across all profiles</p>
        </div>
        <div className="flex gap-1 bg-stone-100 rounded-lg p-1">
          {RANGES.map(r => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={[
                'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                range === r.value
                  ? 'bg-white text-stone-800 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700',
              ].join(' ')}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"  stopColor="#6366f1" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0}  />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1ede8" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#a8a29e' }}
            tickLine={false}
            axisLine={false}
            interval={range === '7d' ? 0 : range === '30d' ? 4 : 9}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#a8a29e' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 12, fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
            labelStyle={{ color: '#78716c', marginBottom: 4 }}
            itemStyle={{ color: '#6366f1', fontWeight: 600 }}
            cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 2' }}
          />
          <Area
            type="monotone"
            dataKey="scans"
            stroke="#6366f1"
            strokeWidth={2.5}
            fill="url(#scanGrad)"
            dot={false}
            activeDot={{ r: 5, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
