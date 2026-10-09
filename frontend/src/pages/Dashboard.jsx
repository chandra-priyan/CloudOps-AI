import React, { useState, useEffect } from 'react';
import { 
  Server, 
  AlertTriangle, 
  Activity, 
  Cpu, 
  HardDrive, 
  Clock, 
  RefreshCw, 
  CheckCircle2, 
  XCircle,
  GitCommit,
  TrendingUp,
  Zap
} from 'lucide-react';

import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/v1/dashboard/overview');
      const result = await response.json();
      if (result.status === 'success') {
        setData(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400 space-x-2">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
        <span>Loading Operations Telemetry...</span>
      </div>
    );
  }

  const overview = data?.overview || {
    monitoredServicesCount: 4,
    healthyServicesCount: 2,
    unhealthyServicesCount: 2,
    activeIncidentsCount: 2,
    recentAlertsCount: 3,
    avgCpuPercent: 48.4,
    avgMemoryPercent: 62.1,
    avgRequestErrorRatePercent: 8.5,
    avgResponseTimeMs: 462,
    totalRestartCount: 20
  };

  const services = data?.services || [];
  const timeSeries = data?.timeSeries || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">Operations Dashboard</h1>
          <p className="text-xs text-gray-400">Real-time application health, infrastructure telemetry, and active incident telemetry</p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium transition flex items-center space-x-1.5 border border-gray-700"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Top Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Monitored Services"
          value={`${overview.healthyServicesCount} / ${overview.monitoredServicesCount}`}
          unit="Healthy"
          trend={`${overview.unhealthyServicesCount} degraded`}
          trendType={overview.unhealthyServicesCount > 0 ? 'bad' : 'good'}
          icon={Server}
          color={overview.unhealthyServicesCount > 0 ? 'rose' : 'emerald'}
        />

        <MetricCard
          title="Active Incidents"
          value={overview.activeIncidentsCount}
          unit="Open"
          trend="2 require diagnosis"
          trendType="bad"
          icon={AlertTriangle}
          color="rose"
        />

        <MetricCard
          title="Avg CPU & Memory"
          value={`${overview.avgCpuPercent}%`}
          unit={`/ ${overview.avgMemoryPercent}% RAM`}
          trend="88% peak on banking-api"
          trendType="bad"
          icon={Cpu}
          color="purple"
        />

        <MetricCard
          title="Request Error Rate"
          value={`${overview.avgRequestErrorRatePercent}%`}
          unit="HTTP 5xx"
          trend="Elevated threshold alert"
          trendType="bad"
          icon={Activity}
          color="amber"
        />
      </div>

      {/* Middle Grid: Services Overview & Prometheus Telemetry Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monitored Services Table */}
        <div className="lg:col-span-2 bg-[#111827] border border-gray-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white">Monitored Service Status</h2>
            </div>
            <Link to="/services" className="text-xs text-blue-400 hover:text-blue-300 font-medium">View All Services →</Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 font-medium uppercase text-[10px]">
                  <th className="pb-2.5">Service Name</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5">Replicas</th>
                  <th className="pb-2.5">Restarts</th>
                  <th className="pb-2.5">CPU / Memory</th>
                  <th className="pb-2.5">Error Rate</th>
                  <th className="pb-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {services.map((svc) => (
                  <tr key={svc.name} className="hover:bg-gray-800/30 transition">
                    <td className="py-3 font-semibold text-gray-200">
                      <div>{svc.displayName || svc.name}</div>
                      <div className="text-[10px] font-mono text-gray-400">{svc.name} • {svc.lastDeploymentVersion}</div>
                    </td>
                    <td className="py-3">
                      <StatusBadge status={svc.status} type="health" />
                    </td>
                    <td className="py-3 text-gray-300 font-mono">
                      {svc.availableReplicas} / {svc.replicaCount}
                    </td>
                    <td className="py-3 text-gray-300 font-mono">
                      <span className={svc.restartCount > 5 ? 'text-rose-400 font-bold' : ''}>
                        {svc.restartCount}
                      </span>
                    </td>
                    <td className="py-3 text-gray-300 font-mono">
                      {svc.cpuUtilization}% / {svc.memoryUtilization}MB
                    </td>
                    <td className="py-3 font-mono">
                      <span className={svc.requestErrorRate > 0.05 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                        {(svc.requestErrorRate * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/services/${svc.name}`}
                        className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-blue-400 text-[11px] font-medium"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Telemetry Chart & Kubernetes Pod Status */}
        <div className="bg-[#111827] border border-gray-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-bold text-white">Prometheus Metrics Trend</h2>
            </div>
            <span className="text-[10px] text-gray-400">Live Scrape (5m)</span>
          </div>

          <div className="space-y-3">
            <div className="text-xs text-gray-400 flex justify-between">
              <span>CPU & Memory Load Curve</span>
              <span className="text-rose-400 font-mono font-semibold">Spike at 10:15 UTC</span>
            </div>

            {/* Time Series Visual Bar Graph */}
            <div className="h-40 bg-[#0D1117] border border-gray-800 rounded-lg p-3 flex items-end justify-between space-x-1.5">
              {timeSeries.map((pt, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-8 bg-gray-900 text-[10px] text-white px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-20 border border-gray-700">
                    {pt.time}: CPU {pt.cpu}% | Err {pt.errorRate}%
                  </div>

                  <div
                    className={`w-full rounded-t transition-all ${pt.cpu > 70 ? 'bg-rose-500' : pt.cpu > 40 ? 'bg-indigo-500' : 'bg-blue-600/70'}`}
                    style={{ height: `${Math.max(15, pt.cpu)}%` }}
                  ></div>
                  <span className="text-[9px] text-gray-500 font-mono mt-1">{pt.time.substr(0, 5)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-gray-800 space-y-2">
            <div className="text-xs font-semibold text-gray-300">Kubernetes Cluster Health</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-900 p-2.5 rounded border border-gray-800">
                <span className="text-gray-400 text-[10px] block uppercase">Ready Nodes</span>
                <span className="font-bold text-emerald-400 text-sm">3 / 3 Ready</span>
              </div>
              <div className="bg-gray-900 p-2.5 rounded border border-gray-800">
                <span className="text-gray-400 text-[10px] block uppercase">Running Pods</span>
                <span className="font-bold text-blue-400 text-sm">11 / 12 Pods</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Active Incidents Quick Callout & Recent Deployments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111827] border border-gray-800 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Active Incident Queue</span>
            </div>
            <Link to="/incidents" className="text-xs text-blue-400 hover:text-blue-300">Manage Incidents →</Link>
          </div>

          <div className="space-y-2.5">
            <div className="p-3.5 bg-rose-950/30 border border-rose-800/50 rounded-lg flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-rose-400">INC-1001</span>
                  <StatusBadge status="Critical" type="severity" />
                  <StatusBadge status="Investigating" type="incident_status" />
                </div>
                <h4 className="text-xs font-bold text-white mt-1">Repeated Pod Restraints & OOMKilled Termination in banking-api</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">Trigger: ENOTFOUND mongodb-primary hostname resolution loss</p>
              </div>

              <Link
                to="/incidents/INC-1001"
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded transition shrink-0"
              >
                AI Diagnosis
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div className="flex items-center space-x-2 text-blue-400 font-bold text-sm">
              <GitCommit className="w-4 h-4" />
              <span>Recent CI/CD Deployments</span>
            </div>
            <Link to="/deployments" className="text-xs text-blue-400 hover:text-blue-300">Deployment Logs →</Link>
          </div>

          <div className="space-y-2.5">
            {[
              { id: 'DEP-401', service: 'banking-api', version: 'v2.1.0', time: '1 hr ago', status: 'Failed', sha: 'a8f4c21e' },
              { id: 'DEP-400', service: 'user-auth-service', version: 'v1.8.4', time: '1 day ago', status: 'Success', sha: '4b92e10a' }
            ].map(dep => (
              <div key={dep.id} className="p-3 bg-gray-900 border border-gray-800 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-gray-200">{dep.service} ({dep.version})</div>
                  <div className="text-[11px] text-gray-400 font-mono">Commit #{dep.sha} • {dep.time}</div>
                </div>
                <StatusBadge status={dep.status === 'Success' ? 'Healthy' : 'Critical'} type="health" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
