import React, { useState, useEffect } from 'react';
import { History, ShieldCheck, Filter, RefreshCw } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/v1/audit-logs');
      const data = await res.json();
      if (data.status === 'success') {
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400 space-x-2">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
        <span>Loading Audit Trail Logs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">Audit Trail & Security Logs</h1>
          <p className="text-xs text-gray-400">Complete immutable record of remediation approvals, simulations, and user actions</p>
        </div>

        <button
          onClick={fetchAuditLogs}
          className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium border border-gray-700 flex items-center space-x-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-lg p-5 space-y-3">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 font-medium uppercase text-[10px]">
                <th className="pb-2.5">Timestamp</th>
                <th className="pb-2.5">Action</th>
                <th className="pb-2.5">Category</th>
                <th className="pb-2.5">User</th>
                <th className="pb-2.5">Target Resource</th>
                <th className="pb-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 font-mono">
              {logs.map((log, idx) => (
                <tr key={idx} className="hover:bg-gray-800/30 transition">
                  <td className="py-3 text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="py-3 font-semibold text-blue-400">{log.action}</td>
                  <td className="py-3 text-gray-300">{log.category}</td>
                  <td className="py-3 text-gray-300 font-sans">{log.user}</td>
                  <td className="py-3 text-gray-200">{log.targetResource}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.status === 'Success' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-blue-950 text-blue-400 border border-blue-800'}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
