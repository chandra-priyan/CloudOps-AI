const config = require('../config');

/**
 * Returns Kubernetes cluster and pod status diagnostics.
 */
const getK8sClusterStatus = async () => {
  return {
    clusterName: 'cloudops-local-k8s',
    version: 'v1.30.2',
    nodesCount: 3,
    nodesReady: 3,
    totalPods: 12,
    runningPods: 11,
    restartingPods: 1,
    namespaces: ['default', 'kube-system', 'monitoring', 'cloudops'],
    deployments: [
      { name: 'banking-api', namespace: 'default', readyReplicas: 1, desiredReplicas: 3, status: 'Degraded' },
      { name: 'user-auth-service', namespace: 'default', readyReplicas: 2, desiredReplicas: 2, status: 'Healthy' },
      { name: 'notification-worker', namespace: 'default', readyReplicas: 3, desiredReplicas: 4, status: 'Degraded' },
      { name: 'payment-gateway', namespace: 'default', readyReplicas: 3, desiredReplicas: 3, status: 'Healthy' }
    ]
  };
};

const getPodLogs = async (podName, serviceName) => {
  return [
    `2026-10-09T10:00:01Z [INFO] Service ${serviceName || podName} starting on port 5000...`,
    `2026-10-09T10:00:03Z [INFO] Health probe handler registered on /health`,
    `2026-10-09T10:00:05Z [WARN] Retrying connection to upstream dependency...`
  ];
};

module.exports = { getK8sClusterStatus, getPodLogs };
