import React from 'react';

export default function MetricCard({ title, value, unit = '', trend, trendType = 'neutral', icon: Icon, color = 'blue' }) {
  const colorMap = {
    blue: 'border-blue-800/40 text-blue-400 bg-blue-950/20',
    emerald: 'border-emerald-800/40 text-emerald-400 bg-emerald-950/20',
    rose: 'border-rose-800/40 text-rose-400 bg-rose-950/20',
    amber: 'border-amber-800/40 text-amber-400 bg-amber-950/20',
    purple: 'border-purple-800/40 text-purple-400 bg-purple-950/20'
  };

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-lg p-4 flex flex-col justify-between shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-lg border ${colorMap[color] || colorMap.blue}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline space-x-1.5">
        <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
        {unit && <span className="text-xs text-gray-400 font-medium">{unit}</span>}
      </div>

      {trend && (
        <div className="mt-2 text-xs flex items-center space-x-1">
          <span className={trendType === 'good' ? 'text-emerald-400 font-medium' : trendType === 'bad' ? 'text-rose-400 font-medium' : 'text-gray-400'}>
            {trend}
          </span>
          <span className="text-[10px] text-gray-400">vs last hour</span>
        </div>
      )}
    </div>
  );
}
