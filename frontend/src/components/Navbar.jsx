import React from 'react';
import { Activity, ShieldCheck, Cpu, Bell, Terminal, RefreshCw } from 'lucide-react';

export default function Navbar({ systemStatus = 'healthy', activeIncidents = 2, mode = 'Full Observability' }) {
  return (
    <header className="h-16 bg-[#111827] border-b border-gray-800 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
          <Activity className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg tracking-wide text-white">CloudOps <span className="text-blue-500">AI</span></span>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-900/50 border border-blue-700/50 text-blue-300 font-mono">v1.0.0</span>
          </div>
          <p className="text-xs text-gray-400">DevOps Monitoring & AI Incident Recovery Platform</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* System Health Status Indicator */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs">
          <span className={`w-2.5 h-2.5 rounded-full ${systemStatus === 'healthy' ? 'bg-emerald-500 animate-ping' : 'bg-rose-500 animate-pulse'}`}></span>
          <span className="text-gray-300">Cluster Status:</span>
          <span className={`font-semibold uppercase ${systemStatus === 'healthy' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {systemStatus}
          </span>
        </div>

        {/* Operational Mode Badge */}
        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-800/50 text-xs text-indigo-300 font-medium">
          <Cpu className="w-3.5 h-3.5" />
          <span>Mode: {mode}</span>
        </div>

        {/* Active Alerts Badge */}
        {activeIncidents > 0 && (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 border border-rose-800/60 text-xs text-rose-300 font-medium">
            <Bell className="w-3.5 h-3.5 animate-bounce text-rose-400" />
            <span>{activeIncidents} Active Incidents</span>
          </div>
        )}

        {/* DevOps User Pill */}
        <div className="flex items-center space-x-2 pl-3 border-l border-gray-800">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-gray-700 flex items-center justify-center text-xs font-semibold text-blue-400">
            DE
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-medium text-gray-200">DevOps Admin</div>
            <div className="text-[10px] text-gray-400">devops@cloudops.ai</div>
          </div>
        </div>
      </div>
    </header>
  );
}
