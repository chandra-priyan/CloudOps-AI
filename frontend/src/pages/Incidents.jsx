import React, { useState, useEffect } from 'react';
import { AlertTriangle, Filter, Plus, RefreshCw, Bot, ShieldAlert } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { Link } from 'react-router-dom';

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchIncidents = async () => {
    try {
      let url = '/api/v1/incidents?limit=20';
      if (severityFilter) url += `&severity=${severityFilter}`;
      if (statusFilter) url += `&status=${statusFilter}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.status === 'success') {
        setIncidents(data.incidents || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [severityFilter, statusFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400 space-x-2">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
        <span>Loading Incident Queue...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">Incident Queue & Alert Records</h1>
          <p className="text-xs text-gray-400">Persisted operational incidents, diagnostic evidence, AI root cause analysis, and remediation audit trail</p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/failure-lab"
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Simulate Failure Scenario</span>
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-[#111827] border border-gray-800 p-4 rounded-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs font-semibold text-gray-300">
            <Filter className="w-4 h-4 text-blue-400" />
            <span>Filters:</span>
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-[#0D1117] border border-gray-700 text-xs text-gray-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0D1117] border border-gray-700 text-xs text-gray-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Investigating">Investigating</option>
            <option value="Remediating">Remediating</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        <button
          onClick={fetchIncidents}
          className="text-xs text-gray-400 hover:text-white flex items-center space-x-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Incidents List */}
      <div className="space-y-3">
        {incidents.length === 0 ? (
          <div className="bg-[#111827] border border-gray-800 p-8 text-center text-gray-400 text-xs">
            No incidents found matching specified criteria.
          </div>
        ) : (
          incidents.map((inc) => (
            <div
              key={inc.incidentId}
              className="bg-[#111827] border border-gray-800 hover:border-gray-700 p-5 rounded-lg transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-3xl">
                <div className="flex items-center space-x-2.5">
                  <span className="text-xs font-mono font-bold text-blue-400">{inc.incidentId}</span>
                  <StatusBadge status={inc.severity} type="severity" />
                  <StatusBadge status={inc.status} type="incident_status" />
                  <span className="text-xs text-gray-400 font-mono">• Service: {inc.serviceName}</span>
                </div>

                <h3 className="text-sm font-bold text-white">{inc.title}</h3>
                <p className="text-xs text-gray-400 line-clamp-1">{inc.triggerReason}</p>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                {inc.aiDiagnosis?.summary && (
                  <span className="flex items-center space-x-1 text-xs text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-2.5 py-1 rounded">
                    <Bot className="w-3.5 h-3.5" />
                    <span>AI Diagnosed</span>
                  </span>
                )}

                <Link
                  to={`/incidents/${inc.incidentId}`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
                >
                  Inspect Incident & Remediation →
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
