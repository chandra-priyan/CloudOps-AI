import React, { useState, useEffect } from 'react';
import { FlaskConical, Play, CheckCircle2, RefreshCw, AlertTriangle, ShieldAlert, Bot } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { useNavigate } from 'react-router-dom';

export default function FailureSimulationLab() {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggeringId, setTriggeringId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const res = await fetch('/api/v1/simulations');
        const data = await res.json();
        if (data.status === 'success') {
          setScenarios(data.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchScenarios();
  }, []);

  const handleTrigger = async (id) => {
    setTriggeringId(id);
    try {
      const res = await fetch('/api/v1/simulations/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId: id })
      });
      const data = await res.json();
      if (data.status === 'success' && data.data?.incident?.incidentId) {
        navigate(`/incidents/${data.data.incident.incidentId}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTriggeringId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400 space-x-2">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
        <span>Loading Failure Simulation Lab...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-wide flex items-center space-x-2">
          <FlaskConical className="w-6 h-6 text-indigo-400" />
          <span>Failure Simulation Lab</span>
        </h1>
        <p className="text-xs text-gray-400">Controlled failure triggers for testing telemetry evidence collection, AI diagnosis, and approval recovery</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scenarios.map((sc) => (
          <div key={sc.id} className="bg-[#111827] border border-gray-800 hover:border-indigo-800/60 rounded-lg p-5 flex flex-col justify-between space-y-4 transition shadow-md">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-indigo-400">{sc.id}</span>
                <StatusBadge status={sc.severity} type="severity" />
              </div>

              <h3 className="text-sm font-bold text-white">{sc.name}</h3>
              <p className="text-xs text-gray-400">Target Service: <span className="font-mono text-gray-200">{sc.targetService}</span></p>

              <div className="p-3 bg-gray-900 border border-gray-800 rounded text-xs text-gray-300 space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-400 block">Observable Symptoms</span>
                <p className="text-[11px] leading-relaxed text-gray-300">{sc.symptoms}</p>
              </div>
            </div>

            <button
              onClick={() => handleTrigger(sc.id)}
              disabled={triggeringId === sc.id}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition shadow-lg shadow-indigo-900/40 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {triggeringId === sc.id ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Simulating Failure...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Trigger Simulation Scenario</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
