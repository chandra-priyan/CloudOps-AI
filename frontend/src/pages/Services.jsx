import React, { useState, useEffect } from 'react';
import { Server, RefreshCw, Cpu, HardDrive, AlertTriangle, Activity } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { Link } from 'react-router-dom';

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/v1/services');
      const data = await res.json();
      if (data.status === 'success') {
        setServices(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400 space-x-2">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
        <span>Loading Monitored Services...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">Monitored Services & Workloads</h1>
          <p className="text-xs text-gray-400">Kubernetes deployments, replica availability, resource utilization, and health status</p>
        </div>

        <button
          onClick={fetchServices}
          className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium transition border border-gray-700 flex items-center space-x-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((svc) => (
          <div key={svc.name} className="bg-[#111827] border border-gray-800 rounded-lg p-5 space-y-4 hover:border-gray-700 transition shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-lg bg-gray-900 border border-gray-800 text-blue-400">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{svc.displayName || svc.name}</h3>
                  <div className="text-[11px] font-mono text-gray-400">
                    Namespace: default • Image Tag: {svc.lastDeploymentVersion}
                  </div>
                </div>
              </div>

              <StatusBadge status={svc.status} type="health" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0D1117] border border-gray-800 p-3 rounded-lg text-xs font-mono">
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-sans">Replicas</span>
                <span className="font-bold text-gray-200">{svc.availableReplicas} / {svc.replicaCount}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-sans">Restarts</span>
                <span className={svc.restartCount > 5 ? 'font-bold text-rose-400' : 'text-gray-200'}>{svc.restartCount}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-sans">CPU</span>
                <span className="text-purple-300 font-bold">{svc.cpuUtilization}%</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-sans">Memory</span>
                <span className="text-blue-300 font-bold">{svc.memoryUtilization} MB</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-800 text-xs text-gray-400">
              <div className="flex items-center space-x-2">
                <span>Error Rate:</span>
                <span className={svc.requestErrorRate > 0.05 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {(svc.requestErrorRate * 100).toFixed(1)}%
                </span>
                <span>• Avg Latency: {svc.avgResponseTimeMs}ms</span>
              </div>

              <Link
                to={`/services/${svc.name}`}
                className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-400 rounded text-xs font-medium transition"
              >
                Service Telemetry →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
