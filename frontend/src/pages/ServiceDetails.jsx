import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Server, ArrowLeft, RefreshCw, Cpu, HardDrive, Activity, Terminal, AlertTriangle } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import LogViewer from '../components/LogViewer';

export default function ServiceDetails() {
  const { name } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await fetch(`/api/v1/services/${name}`);
        const data = await res.json();
        if (data.status === 'success') {
          setService(data.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [name]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400 space-x-2">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
        <span>Loading service telemetry for {name}...</span>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="p-8 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Service '{name}' Not Found</h2>
        <Link to="/services" className="text-blue-400 text-xs hover:underline">← Back to Services</Link>
      </div>
    );
  }

  const sampleLogs = [
    `2026-10-09T10:00:01Z [INFO] Initializing ${service.name} container v${service.lastDeploymentVersion}...`,
    `2026-10-09T10:00:03Z [INFO] Express API listening on port 5000`,
    `2026-10-09T10:05:12Z [WARN] Elevated heap memory consumption: ${service.memoryUtilization}MB / ${service.memoryLimit}MB`,
    service.status === 'Unhealthy' ? `2026-10-09T10:10:44Z [ERROR] Failed to establish connection to mongodb-primary:27017 (ENOTFOUND)` : `2026-10-09T10:10:44Z [INFO] Health check HTTP 200 OK`
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Link to="/services" className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-white tracking-wide">{service.displayName || service.name}</h1>
            <StatusBadge status={service.status} type="health" />
          </div>
          <p className="text-xs font-mono text-gray-400">Kubernetes Deployment: deployment.apps/{service.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#111827] border border-gray-800 p-4 rounded-lg">
          <span className="text-xs text-gray-400 uppercase font-medium">Replicas Ready</span>
          <div className="text-2xl font-bold text-white font-mono mt-1">{service.availableReplicas} / {service.replicaCount}</div>
        </div>

        <div className="bg-[#111827] border border-gray-800 p-4 rounded-lg">
          <span className="text-xs text-gray-400 uppercase font-medium">Container Restarts</span>
          <div className={`text-2xl font-bold font-mono mt-1 ${service.restartCount > 5 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {service.restartCount}
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 p-4 rounded-lg">
          <span className="text-xs text-gray-400 uppercase font-medium">CPU Utilization</span>
          <div className="text-2xl font-bold text-purple-300 font-mono mt-1">{service.cpuUtilization}%</div>
        </div>

        <div className="bg-[#111827] border border-gray-800 p-4 rounded-lg">
          <span className="text-xs text-gray-400 uppercase font-medium">Memory Usage</span>
          <div className="text-2xl font-bold text-blue-300 font-mono mt-1">{service.memoryUtilization} MB</div>
        </div>
      </div>

      <div className="bg-[#111827] border border-gray-800 p-5 rounded-lg space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Activity className="w-4 h-4 text-blue-400" />
          <span>Active Pod Workloads</span>
        </h3>

        <div className="space-y-2">
          {Array.from({ length: service.replicaCount }).map((_, idx) => {
            const isReady = idx < service.availableReplicas;
            return (
              <div key={idx} className="p-3 bg-gray-900 border border-gray-800 rounded-lg flex items-center justify-between text-xs">
                <div className="font-mono text-gray-300">
                  pod/{service.name}-7945d8b8c-0{idx + 1}
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-gray-400 font-mono">IP: 10.244.0.{12 + idx}</span>
                  <StatusBadge status={isReady ? 'Healthy' : 'Unhealthy'} type="health" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <LogViewer logs={sampleLogs} title={`Live Pod Logs — ${service.name}`} />
    </div>
  );
}
