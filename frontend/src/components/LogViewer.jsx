import React, { useState } from 'react';
import { Terminal, Copy, Check, Filter } from 'lucide-react';

export default function LogViewer({ logs = [], title = 'Application Diagnostics Log' }) {
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState('');

  const handleCopy = () => {
    navigator.clipboard.writeText(logs.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredLogs = filter 
    ? logs.filter(l => l.toLowerCase().includes(filter.toLowerCase()))
    : logs;

  return (
    <div className="bg-[#0D1117] border border-gray-800 rounded-lg overflow-hidden font-mono text-xs shadow-inner">
      <div className="bg-[#161B22] px-4 py-2.5 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-gray-300 font-sans text-xs font-semibold">
          <Terminal className="w-4 h-4 text-blue-400" />
          <span>{title}</span>
          <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{logs.length} entries</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Filter logs..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-[#0D1117] border border-gray-700 text-gray-200 text-[11px] rounded px-2 py-1 pl-7 focus:outline-none focus:border-blue-500"
            />
            <Filter className="w-3 h-3 text-gray-400 absolute left-2 top-2" />
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-2.5 py-1 rounded transition text-[11px] font-sans"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      <div className="p-4 max-h-72 overflow-y-auto space-y-1.5 leading-relaxed text-gray-300 select-text selection:bg-blue-800 selection:text-white">
        {filteredLogs.length === 0 ? (
          <div className="text-gray-400 italic font-sans text-center py-4">No diagnostic logs found matching filter.</div>
        ) : (
          filteredLogs.map((log, idx) => {
            let textColor = 'text-gray-300';
            if (log.includes('[ERROR]') || log.includes('FATAL') || log.includes('OOMKilled')) {
              textColor = 'text-rose-400 font-semibold';
            } else if (log.includes('[WARN]')) {
              textColor = 'text-amber-300';
            } else if (log.includes('[INFO]')) {
              textColor = 'text-sky-300';
            } else if (log.includes('[SYSTEM]') || log.includes('[K8S]')) {
              textColor = 'text-purple-300';
            }

            return (
              <div key={idx} className={`hover:bg-gray-800/40 px-1 py-0.5 rounded ${textColor}`}>
                <span className="text-gray-600 select-none mr-3 text-[10px] font-mono">{idx + 1}</span>
                {log}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
