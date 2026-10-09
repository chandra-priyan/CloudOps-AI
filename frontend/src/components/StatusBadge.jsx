import React from 'react';

export default function StatusBadge({ status, type = 'health' }) {
  let colorStyle = 'bg-gray-800 text-gray-300 border-gray-700';

  if (type === 'health') {
    switch (status?.toLowerCase()) {
      case 'healthy':
        colorStyle = 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80';
        break;
      case 'degraded':
        colorStyle = 'bg-amber-950/80 text-amber-400 border-amber-800/80';
        break;
      case 'unhealthy':
      case 'critical':
        colorStyle = 'bg-rose-950/80 text-rose-400 border-rose-800/80';
        break;
      default:
        colorStyle = 'bg-gray-800 text-gray-400 border-gray-700';
    }
  } else if (type === 'severity') {
    switch (status?.toLowerCase()) {
      case 'critical':
        colorStyle = 'bg-rose-950 text-rose-300 border-rose-700 font-bold';
        break;
      case 'high':
        colorStyle = 'bg-orange-950 text-orange-300 border-orange-700 font-semibold';
        break;
      case 'medium':
        colorStyle = 'bg-amber-950 text-amber-300 border-amber-700';
        break;
      case 'low':
        colorStyle = 'bg-blue-950 text-blue-300 border-blue-700';
        break;
    }
  } else if (type === 'incident_status') {
    switch (status?.toLowerCase()) {
      case 'open':
        colorStyle = 'bg-rose-900/60 text-rose-200 border-rose-700';
        break;
      case 'investigating':
        colorStyle = 'bg-indigo-900/60 text-indigo-200 border-indigo-700';
        break;
      case 'remediating':
        colorStyle = 'bg-amber-900/60 text-amber-200 border-amber-700';
        break;
      case 'resolved':
        colorStyle = 'bg-emerald-900/60 text-emerald-200 border-emerald-700';
        break;
    }
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border font-medium ${colorStyle}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80"></span>
      {status}
    </span>
  );
}
