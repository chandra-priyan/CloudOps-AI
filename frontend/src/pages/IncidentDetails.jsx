import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, RefreshCw, Bot, ShieldAlert, CheckCircle2, MessageSquare, Terminal } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import LogViewer from '../components/LogViewer';
import AIDiagnosisPanel from '../components/AIDiagnosisPanel';
import RemediationApprovalDialog from '../components/RemediationApprovalDialog';

export default function IncidentDetails() {
  const { id } = useParams();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [noteText, setNoteText] = useState('');

  const fetchIncident = async () => {
    try {
      const res = await fetch(`/api/v1/incidents/${id}`);
      const data = await res.json();
      if (data.status === 'success') {
        setIncident(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncident();
  }, [id]);

  const handleRequestAIDiagnosis = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/v1/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidentId: id })
      });
      const data = await res.json();
      if (data.status === 'success') {
        fetchIncident();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    try {
      const res = await fetch(`/api/v1/incidents/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: noteText })
      });
      if (res.ok) {
        setNoteText('');
        fetchIncident();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400 space-x-2">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
        <span>Loading Incident Details for {id}...</span>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="p-8 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Incident '{id}' Not Found</h2>
        <Link to="/incidents" className="text-blue-400 text-xs hover:underline">← Back to Incidents</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link to="/incidents" className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-white tracking-wide">{incident.incidentId}: {incident.title}</h1>
              <StatusBadge status={incident.severity} type="severity" />
              <StatusBadge status={incident.status} type="incident_status" />
            </div>
            <p className="text-xs text-gray-400">Target Service: {incident.serviceName} • First Detected: {new Date(incident.firstDetectedAt).toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRequestAIDiagnosis}
            disabled={aiLoading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition flex items-center space-x-2 shadow shadow-indigo-900/40 disabled:opacity-50"
          >
            <Bot className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
            <span>{aiLoading ? 'Querying AI Engine...' : 'Request AI Diagnosis'}</span>
          </button>

          <button
            onClick={() => setIsApprovalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition flex items-center space-x-2 shadow shadow-emerald-900/40"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Human Remediation</span>
          </button>
        </div>
      </div>

      {/* AI Diagnosis Section */}
      <AIDiagnosisPanel
        diagnosis={incident.aiDiagnosis}
        onRequestRemediation={() => setIsApprovalOpen(true)}
      />

      {/* Incident Diagnostic Evidence & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <LogViewer logs={incident.logsContext || []} title={`Application Diagnostic Logs — ${incident.serviceName}`} />

          {/* K8s Events Context */}
          {incident.k8sEventsContext?.length > 0 && (
            <div className="bg-[#111827] border border-gray-800 p-4 rounded-lg space-y-2 font-mono text-xs">
              <div className="font-sans font-bold text-gray-300 text-xs flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-purple-400" />
                <span>Kubernetes Cluster Diagnostic Events</span>
              </div>
              <div className="space-y-1.5 text-purple-200 bg-[#0D1117] p-3 rounded border border-gray-800">
                {incident.k8sEventsContext.map((evt, idx) => (
                  <div key={idx} className="hover:text-white">• {evt}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Audit Timeline & Notes */}
        <div className="space-y-6">
          <div className="bg-[#111827] border border-gray-800 p-5 rounded-lg space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span>Incident Notes & Audit Trail</span>
            </h3>

            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add investigative observation note..."
                rows={2}
                className="w-full bg-[#0D1117] border border-gray-700 text-xs text-gray-200 rounded p-2.5 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold transition"
              >
                Add Note
              </button>
            </form>

            <div className="space-y-3 pt-2">
              {incident.notes?.map((n, idx) => (
                <div key={idx} className="p-3 bg-gray-900 border border-gray-800 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between text-gray-400 text-[10px]">
                    <span className="font-semibold text-blue-400">{n.author}</span>
                    <span>{new Date(n.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-gray-200">{n.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Human Approval Remediation Modal */}
      <RemediationApprovalDialog
        isOpen={isApprovalOpen}
        onClose={() => setIsApprovalOpen(false)}
        incident={incident}
        onExecuteSuccess={() => fetchIncident()}
      />
    </div>
  );
}
