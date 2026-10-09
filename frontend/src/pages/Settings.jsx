import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, RefreshCw, Bot, ShieldCheck, Cpu } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({
    ollamaModel: 'qwen2.5-coder',
    ollamaBaseUrl: 'http://localhost:11434',
    aiServiceUrl: 'http://localhost:8000',
    enableDryRun: true,
    requireApproval: true,
    observabilityMode: 'full'
  });
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-wide">System Settings & AI Model Configuration</h1>
        <p className="text-xs text-gray-400">Configure Ollama model parameters, remediation policies, and observability settings</p>
      </div>

      <div className="max-w-2xl bg-[#111827] border border-gray-800 rounded-lg p-6 space-y-6">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-gray-800 pb-2">
              <Bot className="w-4 h-4 text-indigo-400" />
              <span>Ollama AI Troubleshooting Configuration</span>
            </h3>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Ollama Model Name</label>
              <input
                type="text"
                value={settings.ollamaModel}
                onChange={(e) => setSettings({ ...settings, ollamaModel: e.target.value })}
                className="w-full bg-[#0D1117] border border-gray-700 text-xs text-gray-200 rounded p-2.5 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Ollama Base Endpoint URL</label>
              <input
                type="text"
                value={settings.ollamaBaseUrl}
                onChange={(e) => setSettings({ ...settings, ollamaBaseUrl: e.target.value })}
                className="w-full bg-[#0D1117] border border-gray-700 text-xs text-gray-200 rounded p-2.5 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-800">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-gray-800 pb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Remediation Safety Controls</span>
            </h3>

            <div className="flex items-center justify-between p-3 bg-gray-900 border border-gray-800 rounded-lg text-xs">
              <div>
                <span className="font-semibold text-gray-200 block">Require Human Approval</span>
                <span className="text-gray-400 text-[11px]">Enforce explicit engineer confirmation prior to allowed action execution</span>
              </div>
              <input
                type="checkbox"
                checked={settings.requireApproval}
                onChange={(e) => setSettings({ ...settings, requireApproval: e.target.checked })}
                className="w-4 h-4 accent-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition flex items-center space-x-2 shadow-lg shadow-blue-900/40"
            >
              <Save className="w-4 h-4" />
              <span>{saved ? 'Settings Saved!' : 'Save System Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
