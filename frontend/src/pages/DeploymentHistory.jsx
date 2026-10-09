import React from 'react';
import { GitCommit, CheckCircle2, XCircle, Clock } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function DeploymentHistory() {
  const deployments = [
    { id: 'DEP-401', service: 'banking-api', version: 'v2.1.0', commitSha: 'a8f4c21e', deployedBy: 'GitHub Actions CI/CD', time: '1 hr ago', status: 'Failed', changelog: 'Updated database configuration parameters' },
    { id: 'DEP-400', service: 'user-auth-service', version: 'v1.8.4', commitSha: '4b92e10a', deployedBy: 'GitHub Actions CI/CD', time: '1 day ago', status: 'Success', changelog: 'Refactored JWT verification logic' },
    { id: 'DEP-399', service: 'notification-worker', version: 'v1.1.2', commitSha: '91c83b0f', deployedBy: 'DevOps Pipeline', time: '2 days ago', status: 'Success', changelog: 'Optimized Redis queue task listener batching' },
    { id: 'DEP-398', service: 'payment-gateway', version: 'v3.0.1', commitSha: '01df82c3', deployedBy: 'GitHub Actions CI/CD', time: '3 days ago', status: 'Success', changelog: 'Added Stripe webhook retry handler' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-wide">CI/CD Deployment History</h1>
        <p className="text-xs text-gray-400">Track application releases, commit SHAs, and rollout verification results</p>
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-lg p-5 space-y-4">
        <div className="space-y-3">
          {deployments.map((dep) => (
            <div key={dep.id} className="p-4 bg-gray-900 border border-gray-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start space-x-3">
                <div className="p-2.5 rounded-lg bg-gray-800 border border-gray-700 text-blue-400">
                  <GitCommit className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-blue-400">{dep.id}</span>
                    <span className="text-sm font-bold text-white">{dep.service}</span>
                    <span className="text-xs font-mono text-gray-400">({dep.version})</span>
                  </div>
                  <p className="text-xs text-gray-300 mt-1">{dep.changelog}</p>
                  <div className="text-[11px] font-mono text-gray-400 mt-1">
                    Commit #{dep.commitSha} • Triggered by: {dep.deployedBy} • {dep.time}
                  </div>
                </div>
              </div>

              <StatusBadge status={dep.status === 'Success' ? 'Healthy' : 'Critical'} type="health" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
