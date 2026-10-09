import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, XCircle, RefreshCw, AlertTriangle, Cpu, Terminal } from 'lucide-react';

export default function RemediationApprovalDialog({ isOpen, onClose, incident, onExecuteSuccess }) {
  const [selectedAction, setSelectedAction] = useState('RESTART_DEPLOYMENT');
  const [dryRun, setDryRun] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  if (!isOpen || !incident) return null;

  const handleExecute = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/v1/remediation/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId: incident.incidentId,
          action: selectedAction,
          serviceName: incident.serviceName,
          dryRun
        })
      });

      const data = await response.json();
      if (!response.ok || data.status !== 'success') {
        throw new Error(data.message || 'Remediation execution failed');
      }

      setResult(data.data);
      if (onExecuteSuccess) {
        onExecuteSuccess(data.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#111827] border border-gray-800 rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-5 relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-700/60 text-emerald-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Human Approval — Remediation Action</h3>
              <p className="text-xs text-gray-400">Incident {incident.incidentId} • Target: {incident.serviceName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">✕</button>
        </div>

        {/* Action Selection */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
            Select Allowlisted Action
          </label>

          <div className="grid grid-cols-1 gap-2">
            {[
              { id: 'RESTART_DEPLOYMENT', title: 'Restart Deployment Rollout', desc: 'Perform rolling restart of all pods (Zero downtime)' },
              { id: 'ROLLBACK_DEPLOYMENT', title: 'Rollback to Previous Revision', desc: 'Revert deployment image tag to last known-good revision' },
              { id: 'SCALE_REPLICAS', title: 'Scale Pod Replicas', desc: 'Increase replica count to relieve memory pressure' },
              { id: 'CLEAR_CONNECTION_POOL', title: 'Reset Connection Pool', desc: 'Flush stale database connection pool sockets' }
            ].map(act => (
              <label
                key={act.id}
                onClick={() => setSelectedAction(act.id)}
                className={`p-3 rounded-lg border cursor-pointer transition flex items-start space-x-3 ${
                  selectedAction === act.id
                    ? 'bg-blue-950/40 border-blue-600 text-white'
                    : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:bg-gray-800/40'
                }`}
              >
                <input
                  type="radio"
                  name="action"
                  checked={selectedAction === act.id}
                  onChange={() => setSelectedAction(act.id)}
                  className="mt-1 accent-blue-500"
                />
                <div>
                  <div className="text-xs font-bold text-gray-200">{act.title}</div>
                  <div className="text-[11px] text-gray-400">{act.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Dry-Run Safety Switch */}
        <div className="bg-gray-900 border border-gray-800 p-3.5 rounded-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-200 block">Dry-Run Simulation Mode</span>
            <span className="text-[11px] text-gray-400">Simulate expected changes without mutating live production cluster</span>
          </div>
          <button
            onClick={() => setDryRun(!dryRun)}
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${dryRun ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${dryRun ? 'translate-x-6' : 'translate-x-0'}`}></div>
          </button>
        </div>

        {/* Execution Error Message */}
        {error && (
          <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-lg flex items-center space-x-2">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Execution Result Banner */}
        {result && (
          <div className="p-4 bg-emerald-950/50 border border-emerald-800 text-emerald-200 text-xs rounded-lg space-y-2">
            <div className="flex items-center space-x-2 font-bold text-emerald-400">
              <CheckCircle className="w-4 h-4" />
              <span>Remediation Execution Complete ({result.dryRun ? 'Dry Run' : 'Live'})</span>
            </div>
            <p className="font-mono text-[11px] bg-black/40 p-2 rounded text-emerald-300">{result.executionResult}</p>
            <div className="text-[11px] text-emerald-400 font-semibold">
              Post-Recovery Verification: {result.verificationStatus}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-2 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition"
          >
            Cancel
          </button>

          <button
            onClick={handleExecute}
            disabled={loading}
            className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition flex items-center space-x-2 shadow-lg shadow-emerald-900/40 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Executing...</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4" />
                <span>Approve & Execute {dryRun ? '(Dry Run)' : '(Live)'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
