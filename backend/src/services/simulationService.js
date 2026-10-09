const { createIncident, updateServiceStatus } = require('./incidentService');
const { logAuditAction } = require('./auditService');
const { requestDiagnosis } = require('./aiService');

const SIMULATION_SCENARIOS = [
  {
    id: 'sim-1',
    name: 'Backend Application Crash',
    targetService: 'banking-api',
    severity: 'Critical',
    symptoms: 'Uncaught Promise Rejection leading to process exit code 1',
    triggerReason: 'Backend application process crashed unexpectedly due to database connection loss (ENOTFOUND mongodb-primary)',
    logs: [
      '2026-10-09T10:15:00Z [ERROR] Connection pool connection failure to mongodb-primary:27017',
      '2026-10-09T10:15:02Z [FATAL] UnhandledPromiseRejectionWarning: MongoNetworkError',
      '2026-10-09T10:15:03Z [SYSTEM] Node.js process exiting with status code 1'
    ],
    k8sEvents: [
      'Event [Warning] BackOff: Back-off restarting failed container banking-api',
      'Event [Warning] Unhealthy: Liveness probe failed HTTP 500'
    ]
  },
  {
    id: 'sim-2',
    name: 'Kubernetes CrashLoopBackOff',
    targetService: 'banking-api',
    severity: 'Critical',
    symptoms: 'Container restart count rapidly increments (>10 restarts/hr), Pod remains in CrashLoopBackOff',
    triggerReason: 'Container fails readiness probe on startup retry and enters K8s CrashLoopBackOff state',
    logs: [
      '2026-10-09T10:20:00Z [INFO] Application booting v2.1.0...',
      '2026-10-09T10:20:03Z [ERROR] Missing required secret environment variable JWT_SIGNING_KEY',
      '2026-10-09T10:20:04Z [FATAL] Critical startup requirement unmet. Exiting process.'
    ],
    k8sEvents: [
      'Event [Warning] BackOff: Back-off restarting failed container banking-api in pod banking-api-687f4c-89x2',
      'Event [Normal] Scheduled: Successfully assigned default/banking-api-687f4c-89x2 to node-k8s-worker-1'
    ]
  },
  {
    id: 'sim-3',
    name: 'Memory Pressure / OOMKilled',
    targetService: 'notification-worker',
    severity: 'High',
    symptoms: 'Worker heap memory reaches 100% capacity limit (512MB), Linux kernel sends SIGKILL (Exit 137)',
    triggerReason: 'Unmanaged task queue memory leakage exceeding 512MB memory boundary limit',
    logs: [
      '2026-10-09T10:25:00Z [WARN] Task queue buffer size exceeded 50,000 items',
      '2026-10-09T10:25:15Z [WARN] Heap memory allocation 508MB / 512MB max limit',
      '2026-10-09T10:25:16Z [K8S] Container notification-worker terminated by kernel with Exit Code 137 (OOMKilled)'
    ],
    k8sEvents: [
      'Event [Warning] OOMKilling: Memory limit 512Mi reached by process notification-worker'
    ]
  },
  {
    id: 'sim-4',
    name: 'Backend API HTTP 500 Spike',
    targetService: 'payment-gateway',
    severity: 'High',
    symptoms: 'HTTP 500 Error Rate spikes to 35% on POST /api/v1/payments endpoint',
    triggerReason: 'Third-party gateway timeout handling throwing unhandled 500 exceptions',
    logs: [
      '2026-10-09T10:30:00Z [ERROR] HTTP 500 Internal Server Error POST /api/v1/payments/charge - Timeout waiting for upstream provider',
      '2026-10-09T10:30:05Z [ERROR] Connection reset by peer at payment-vendor-api.internal:443'
    ],
    k8sEvents: [
      'Event [Warning] HighErrorRate: HTTP 500 rate exceeds threshold 5%'
    ]
  },
  {
    id: 'sim-5',
    name: 'Backend Service Unavailable',
    targetService: 'banking-api',
    severity: 'Critical',
    symptoms: 'Service endpoint returns 503 Service Unavailable, 0 endpoints active',
    triggerReason: 'Kubernetes Service selector mismatch resulting in 0 ready pod targets',
    logs: [
      '2026-10-09T10:35:00Z [WARN] CoreDNS unable to find active pod endpoints for Service banking-api-svc',
      '2026-10-09T10:35:02Z [ERROR] Ingress Controller returns HTTP 503 Service Unavailable'
    ],
    k8sEvents: [
      'Event [Warning] FailedToUpdateEndpoint: Endpoints "banking-api" not found'
    ]
  },
  {
    id: 'sim-6',
    name: 'Failed Kubernetes Rollout',
    targetService: 'user-auth-service',
    severity: 'Medium',
    symptoms: 'Deployment rollout stuck at 1/2 ready replicas, ProgressDeadlineExceeded',
    triggerReason: 'New image tag v1.9.0 fails readiness probe check causing deployment rollout hang',
    logs: [
      '2026-10-09T10:40:00Z [INFO] Rolling out deployment user-auth-service revision 5...',
      '2026-10-09T10:41:30Z [WARN] Pod user-auth-service-v1.9.0 failed readiness probe 3 consecutive times'
    ],
    k8sEvents: [
      'Event [Warning] ProgressDeadlineExceeded: Deployment "user-auth-service" has exceeded its progress deadline'
    ]
  },
  {
    id: 'sim-7',
    name: 'Failed CI/CD Build / Deployment',
    targetService: 'banking-api',
    severity: 'Medium',
    symptoms: 'GitHub Actions workflow step "Integration Test" failed with exit code 1',
    triggerReason: 'Breaking API contract change breaking unit and integration test assertions in CI pipeline',
    logs: [
      '2026-10-09T10:45:00Z [CI/CD] Step 4/8: Running Backend Unit Tests...',
      '2026-10-09T10:45:12Z [FAIL] test/integration/payment.test.js: Expected 200 OK got 400 Bad Request',
      '2026-10-09T10:45:13Z [ERROR] CI/CD Pipeline aborted. Image deployment blocked.'
    ],
    k8sEvents: [
      'Event [Normal] DeploymentCanceled: Automated deployment halted by GitHub Actions CI webhook'
    ]
  }
];

const triggerSimulation = async (scenarioId) => {
  const scenario = SIMULATION_SCENARIOS.find(s => s.id === scenarioId);
  if (!scenario) {
    throw new Error(`Failure scenario '${scenarioId}' not found.`);
  }

  // Update target service metrics & status to reflect failure
  await updateServiceStatus(scenario.targetService, {
    status: scenario.severity === 'Critical' ? 'Unhealthy' : 'Degraded',
    requestErrorRate: scenario.severity === 'Critical' ? 0.35 : 0.12,
    restartCount: scenario.id === 'sim-2' ? 18 : 6,
    cpuUtilization: scenario.id === 'sim-3' ? 95.2 : 72.0,
    memoryUtilization: scenario.id === 'sim-3' ? 508 : 380,
    availableReplicas: 1
  });

  // Create incident automatically
  const incidentData = {
    title: `[Simulated] ${scenario.name} in ${scenario.targetService}`,
    serviceName: scenario.targetService,
    severity: scenario.severity,
    status: 'Open',
    triggerReason: scenario.triggerReason,
    metricsContext: {
      cpuPercent: scenario.id === 'sim-3' ? 95.2 : 72.0,
      memoryMb: scenario.id === 'sim-3' ? 508 : 380,
      errorRatePercent: scenario.severity === 'Critical' ? 35.0 : 12.0,
      restartCount: scenario.id === 'sim-2' ? 18 : 6,
      avgLatencyMs: 1250
    },
    logsContext: scenario.logs,
    k8sEventsContext: scenario.k8sEvents,
    deploymentContext: {
      version: 'v2.1.0-sim',
      deployedAt: new Date(),
      commitSha: 'sim-99a8'
    }
  };

  const incident = await createIncident(incidentData);

  // Auto request AI diagnosis for seamless simulation lab workflow
  const diagnosis = await requestDiagnosis(incident);

  // Log audit entry
  await logAuditAction({
    action: 'SIMULATION_LAB_TRIGGER',
    category: 'Simulation',
    user: 'DevOps Engineer (Simulation Lab)',
    targetResource: scenario.targetService,
    details: { scenarioId, scenarioName: scenario.name, incidentId: incident.incidentId },
    status: 'Success'
  });

  return {
    success: true,
    scenario,
    incident,
    diagnosis
  };
};

module.exports = {
  SIMULATION_SCENARIOS,
  triggerSimulation
};
