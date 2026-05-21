'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { DashboardStats } from '@/lib/types';

const COLORS = {
  positive: '#10b981',
  neutral: '#f59e0b',
  negative: '#f43f5e',
};

interface Props {
  stats: DashboardStats;
}

export default function SentimentChart({ stats }: Props) {
  const data = [
    { name: 'Positive', value: stats.positive, color: COLORS.positive },
    { name: 'Neutral', value: stats.neutral, color: COLORS.neutral },
    { name: 'Negative', value: stats.negative, color: COLORS.negative },
  ].filter((d) => d.value > 0);

  const total = stats.total;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
        Sentiment Breakdown
      </h2>

      <div className="flex items-center gap-6">
        <div className="w-32 h-32 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={38}
                outerRadius={56}
                paddingAngle={2}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f1f5f9',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [
                  `${value} (${Math.round((value / total) * 100)}%)`,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-3">
          {[
            { label: 'Positive', count: stats.positive, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
            { label: 'Neutral', count: stats.neutral, color: 'bg-amber-500', textColor: 'text-amber-400' },
            { label: 'Negative', count: stats.negative, color: 'bg-rose-500', textColor: 'text-rose-400' },
          ].map(({ label, count, color, textColor }) => (
            <div key={label} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-sm text-slate-300">{label}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${color} rounded-full transition-all`}
                    style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }}
                  />
                </div>
                <span className={`text-sm font-semibold ${textColor} w-6 text-right`}>
                  {count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
