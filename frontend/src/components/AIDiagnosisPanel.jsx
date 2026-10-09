import React from 'react';
import { Bot, CheckCircle2, AlertTriangle, Terminal, ShieldAlert, Cpu, Sparkles } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function AIDiagnosisPanel({ diagnosis, onRequestRemediation }) {
  if (!diagnosis) {
    return (
      <div className="bg-[#111827] border border-gray-800 rounded-lg p-6 text-center">
        <Bot className="w-10 h-10 text-blue-400 mx-auto mb-3 animate-pulse" />
        <h3 className="text-base font-semibold text-white mb-1">AI Diagnostic Analysis Ready</h3>
        <p className="text-xs text-gray-400 max-w-md mx-auto mb-4">
          Click below to query the FastAPI Ollama engine for structured root cause diagnosis and evidence analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#111827] border border-indigo-900/60 rounded-lg p-6 space-y-6 shadow-xl relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Header Banner */}
      <div className="flex items-start justify-between border-b border-gray-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-950 border border-indigo-700/60 flex items-center justify-center text-indigo-400 shadow-inner">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-white tracking-wide">AI Root Cause Diagnosis</h3>
              <StatusBadge status={diagnosis.confidenceLevel + ' Confidence'} type="health" />
            </div>
            <p className="text-xs text-gray-400">Powered by Ollama Model: {diagnosis.modelName || 'qwen2.5-coder'}</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-gray-400 block">Risk Level</span>
          <span className={`text-xs font-semibold ${diagnosis.riskLevel === 'High' ? 'text-rose-400' : 'text-amber-400'}`}>
            {diagnosis.riskLevel || 'Medium'} Operational Risk
          </span>
        </div>
      </div>

      {/* Executive Summary & Probable Root Cause */}
      <div className="space-y-3">
        <div className="bg-indigo-950/40 border border-indigo-800/40 rounded-lg p-4">
          <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1 flex items-center space-x-1.5">
            <Bot className="w-4 h-4" />
            <span>Probable Root Cause</span>
          </div>
          <p className="text-sm font-semibold text-white leading-relaxed">
            {diagnosis.probableRootCause}
          </p>
          <p className="text-xs text-gray-300 mt-2 leading-relaxed">
            {diagnosis.summary}
          </p>
        </div>
      </div>

      {/* Supporting Evidence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-900/90 border border-gray-800 p-4 rounded-lg">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Supporting Evidence ({diagnosis.supportingEvidence?.length || 0})</span>
          </div>
          <ul className="space-y-1.5 text-xs text-gray-300">
            {diagnosis.supportingEvidence?.map((ev, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{ev}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-900/90 border border-gray-800 p-4 rounded-lg">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
            <AlertTriangle className="w-4 h-4" />
            <span>Alternative Hypotheses</span>
          </div>
          <ul className="space-y-1.5 text-xs text-gray-400">
            {diagnosis.alternativeExplanations?.map((alt, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-amber-500">•</span>
                <span>{alt}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Suggested Diagnostic Commands */}
      {diagnosis.diagnosticCommands?.length > 0 && (
        <div className="bg-[#0D1117] border border-gray-800 rounded-lg p-4">
          <div className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
            <Terminal className="w-4 h-4 text-blue-400" />
            <span>Recommended kubectl Diagnostic Commands</span>
          </div>
          <div className="space-y-1 font-mono text-xs text-blue-300 bg-[#161B22] p-3 rounded border border-gray-800">
            {diagnosis.diagnosticCommands.map((cmd, idx) => (
              <div key={idx} className="select-all hover:text-white">$ {cmd}</div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Remediation & Action Trigger */}
      <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
            <ShieldAlert className="w-4 h-4" />
            <span>Recommended Human Remediation</span>
          </div>
          <p className="text-xs font-medium text-white">{diagnosis.recommendedRemediation}</p>
        </div>

        {onRequestRemediation && (
          <button
            onClick={onRequestRemediation}
            className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-900/40 shrink-0 flex items-center space-x-2"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Request Human Approval & Fix</span>
          </button>
        )}
      </div>
    </div>
  );
}
