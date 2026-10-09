import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Server, 
  AlertTriangle, 
  Bot, 
  FlaskConical, 
  GitCommit, 
  History, 
  Settings as SettingsIcon,
  ShieldAlert,
  Terminal,
  Activity
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Operations Dashboard', icon: LayoutDashboard },
  { path: '/services', label: 'Monitored Services', icon: Server },
  { path: '/incidents', label: 'Incidents & Alerts', icon: AlertTriangle },
  { path: '/ai-troubleshooting', label: 'AI Evidence Analyzer', icon: Bot },
  { path: '/failure-lab', label: 'Failure Simulation Lab', icon: FlaskConical },
  { path: '/deployments', label: 'Deployment History', icon: GitCommit },
  { path: '/audit-logs', label: 'Audit Trail Logs', icon: History },
  { path: '/settings', label: 'System Settings', icon: SettingsIcon }
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-[#0D1322] border-r border-gray-800 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 shrink-0">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Navigation Console
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/20 border border-blue-500/50 text-blue-400 shadow-sm shadow-blue-900/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="mt-8 p-3.5 rounded-lg bg-gray-900/80 border border-gray-800/80">
        <div className="flex items-center space-x-2 text-xs font-semibold text-gray-300 mb-1">
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          <span>Remediation Policy</span>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Allowlisted actions only. Human approval & post-recovery health check enforced.
        </p>
      </div>
    </aside>
  );
}
