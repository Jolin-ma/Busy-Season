'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { DEVICE_DATA } from '@/lib/mock-data';

const COLORS = ['#6366f1', '#10b981'];

export default function DeviceChart() {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 flex flex-col">
      <div className="mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1">Device Breakdown</h2>
        <p className="text-sm font-semibold text-stone-800">OS distribution of scanners</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={DEVICE_DATA}
              cx="50%" cy="50%"
              innerRadius={52}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {DEVICE_DATA.map((entry, i) => (
                <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 12, fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              formatter={(v: number) => [`${v}%`, '']}
              itemStyle={{ color: '#1c1917', fontWeight: 600 }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="w-full space-y-2 mt-2">
          {DEVICE_DATA.map((d, i) => (
            <div key={d.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-xs text-stone-500">{d.name}</span>
              </div>
              <span className="text-xs font-semibold text-stone-700 tabular-nums">{d.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
