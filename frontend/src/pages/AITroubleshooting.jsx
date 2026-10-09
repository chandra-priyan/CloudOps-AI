import React, { useState } from 'react';
import { Bot, Sparkles, Terminal, ShieldAlert, Cpu, CheckCircle2 } from 'lucide-react';
import AIDiagnosisPanel from '../components/AIDiagnosisPanel';
import LogViewer from '../components/LogViewer';

export default function AITroubleshooting() {
  const [serviceName, setServiceName] = useState('banking-api');
  const [logsInput, setLogsInput] = useState(
    '2026-10-09T10:01:12.412Z [ERROR] Failed to connect to mongodb-primary:27017: Connection timed out\n' +
    '2026-10-09T10:01:14.901Z [FATAL] MongoNetworkError: getaddrinfo ENOTFOUND mongodb-primary\n' +
    '2026-10-09T10:01:18.889Z [K8S] Pod banking-api-7945d8b8c-x9z2p exited with code 137 (OOMKilled)'
  );
  const [diagnosis, setDiagnosis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Call AI backend or generate structured evidence analysis
    setTimeout(() => {
      setDiagnosis({
        summary: `Evidence-based diagnosis for ${serviceName} diagnostic telemetry.`,
        probableRootCause: `Database connection hostname resolution failure (ENOTFOUND mongodb-primary) leading to memory pool exhaustion.`,
        confidenceLevel: 'High',
        supportingEvidence: [
          'Logs confirm ENOTFOUND error resolving host mongodb-primary',
          'Pod exit code 137 indicates kernel OOMKilled signal'
        ],
        alternativeExplanations: ['CoreDNS internal service disruption'],
        diagnosticCommands: [
          `kubectl logs -n default deployment/${serviceName} --tail=100`,
          `kubectl get configmap ${serviceName}-config -o yaml`
        ],
        recommendedRemediation: `Rollback ${serviceName} deployment or verify MONGODB_URI secret hostname configuration.`,
        riskLevel: 'Medium',
        modelName: 'qwen2.5-coder'
      });
      setLoading(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-wide">AI Evidence Diagnostic Analyzer</h1>
        <p className="text-xs text-gray-400">Inspect raw telemetry context sent to Ollama Qwen model and validate evidence hypotheses</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diagnostic Input Form */}
        <div className="bg-[#111827] border border-gray-800 p-5 rounded-lg space-y-4">
          <div className="flex items-center space-x-2 border-b border-gray-800 pb-3">
            <Bot className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Diagnostic Context Payload</h3>
          </div>

          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Target Service</label>
              <input
                type="text"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="w-full bg-[#0D1117] border border-gray-700 text-xs text-gray-200 rounded p-2.5 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Diagnostic Logs & Telemetry Context</label>
              <textarea
                value={logsInput}
                onChange={(e) => setLogsInput(e.target.value)}
                rows={6}
                className="w-full bg-[#0D1117] border border-gray-700 font-mono text-xs text-blue-300 rounded p-3 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs transition shadow-lg shadow-indigo-900/40 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Analyzing Telemetry with Ollama...' : 'Analyze Evidence with AI'}</span>
            </button>
          </form>
        </div>

        {/* AI Response Output */}
        <div className="space-y-4">
          {diagnosis ? (
            <AIDiagnosisPanel diagnosis={diagnosis} />
          ) : (
            <div className="bg-[#111827] border border-gray-800 rounded-lg p-12 text-center text-gray-400 text-xs space-y-3">
              <Bot className="w-12 h-12 text-indigo-400/40 mx-auto" />
              <p>Submit diagnostic logs on the left to generate structured AI analysis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
