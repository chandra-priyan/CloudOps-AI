const { getIsConnected } = require('../config/db');
const Service = require('../models/Service');
const Incident = require('../models/Incident');
const Deployment = require('../models/Deployment');
const AuditLog = require('../models/AuditLog');

// In-Memory Fallback Seed Data (used when MongoDB is not connected or in local dev)
const seedServices = [
  {
    name: 'banking-api',
    displayName: 'Banking & Transaction API',
    environment: 'production',
    status: 'Unhealthy',
    replicaCount: 3,
    availableReplicas: 1,
    restartCount: 14,
    cpuUtilization: 88.4,
    memoryUtilization: 495,
    memoryLimit: 512,
    requestErrorRate: 0.24, // 24% error rate
    avgResponseTimeMs: 1450,
    lastDeploymentVersion: 'v2.1.0',
    lastDeploymentTime: new Date(Date.now() - 3600000)
  },
  {
    name: 'user-auth-service',
    displayName: 'User Authentication Service',
    environment: 'production',
    status: 'Healthy',
    replicaCount: 2,
    availableReplicas: 2,
    restartCount: 0,
    cpuUtilization: 18.2,
    memoryUtilization: 180,
    memoryLimit: 512,
    requestErrorRate: 0.001,
    avgResponseTimeMs: 32,
    lastDeploymentVersion: 'v1.8.4',
    lastDeploymentTime: new Date(Date.now() - 86400000)
  },
  {
    name: 'notification-worker',
    displayName: 'Event Notification Worker',
    environment: 'production',
    status: 'Degraded',
    replicaCount: 4,
    availableReplicas: 3,
    restartCount: 5,
    cpuUtilization: 65.0,
    memoryUtilization: 410,
    memoryLimit: 512,
    requestErrorRate: 0.08,
    avgResponseTimeMs: 320,
    lastDeploymentVersion: 'v1.1.2',
    lastDeploymentTime: new Date(Date.now() - 172800000)
  },
  {
    name: 'payment-gateway',
    displayName: 'Payment Processing Gateway',
    environment: 'production',
    status: 'Healthy',
    replicaCount: 3,
    availableReplicas: 3,
    restartCount: 1,
    cpuUtilization: 22.1,
    memoryUtilization: 210,
    memoryLimit: 512,
    requestErrorRate: 0.005,
    avgResponseTimeMs: 58,
    lastDeploymentVersion: 'v3.0.1',
    lastDeploymentTime: new Date(Date.now() - 43200000)
  }
];

const seedIncidents = [
  {
    incidentId: 'INC-1001',
    title: 'Repeated Pod Restraints & OOMKilled Termination in banking-api',
    serviceName: 'banking-api',
    severity: 'Critical',
    status: 'Investigating',
    triggerReason: 'Container restart count exceeded threshold (14 restarts in 1h) & HTTP 500 spike (24%)',
    firstDetectedAt: new Date(Date.now() - 3600000),
    metricsContext: {
      cpuPercent: 88.4,
      memoryMb: 495,
      errorRatePercent: 24.0,
      restartCount: 14,
      avgLatencyMs: 1450
    },
    logsContext: [
      '2026-10-09T10:01:12.412Z [ERROR] Failed to establish connection to MongoDB replica set at mongodb-primary:27017: Connection timed out',
      '2026-10-09T10:01:14.901Z [FATAL] UnhandledPromiseRejectionWarning: MongoNetworkError: getaddrinfo ENOTFOUND mongodb-primary',
      '2026-10-09T10:01:15.012Z [SYSTEM] Node.js process exiting with status code 1',
      '2026-10-09T10:01:18.889Z [K8S] Pod banking-api-7945d8b8c-x9z2p exited with code 137 (OOMKilled)'
    ],
    k8sEventsContext: [
      'Event [Warning] BackOff: Back-off restarting failed container banking-api in pod banking-api-7945d8b8c-x9z2p_default',
      'Event [Warning] Unhealthy: Liveness probe failed: HTTP probe failed with statuscode 500',
      'Event [Normal] Pulled: Container image "cloudops/banking-api:v2.1.0" already present on machine'
    ],
    deploymentContext: {
      version: 'v2.1.0',
      deployedAt: new Date(Date.now() - 3600000),
      commitSha: 'a8f4c21e'
    },
    aiDiagnosis: {
      summary: 'The banking-api container is crashing repeatedly due to a database connection failure leading to memory pool exhaustion (OOMKilled) during connection retries.',
      probableRootCause: 'Misconfigured database endpoint (ENOTFOUND mongodb-primary) introduced in deployment v2.1.0, coupled with unmanaged retry buffer allocations.',
      confidenceLevel: 'High',
      supportingEvidence: [
        'Logs confirm ENOTFOUND error attempting to resolve host mongodb-primary',
        'Pod termination exit code 137 indicates OOMKilled by Linux kernel',
        'Failure started immediately after deployment v2.1.0 commit a8f4c21e'
      ],
      alternativeExplanations: [
        'DNS resolution service (CoreDNS) internal cluster failure',
        'MongoDB Service cluster IP configuration deleted'
      ],
      diagnosticCommands: [
        'kubectl logs -n default deployment/banking-api --tail=100',
        'kubectl get configmap banking-api-config -o yaml',
        'kubectl exec -it deployment/banking-api -- nslookup mongodb-primary'
      ],
      recommendedRemediation: 'Rollback banking-api deployment to previous known-good version v2.0.4 or fix MONGODB_URI secret configuration.',
      riskLevel: 'Medium',
      verificationSteps: [
        'Check pod status: kubectl get pods -l app=banking-api (verify 3/3 Running)',
        'Verify HTTP health probe returns 200 OK',
        'Confirm HTTP 5xx error rate drops below 1%'
      ],
      analyzedAt: new Date(Date.now() - 1800000)
    },
    remediationHistory: [],
    notes: [
      {
        author: 'Sarah Chen (Lead SRE)',
        content: 'Investigating deployment v2.1.0 environment variables. ConfigMap seems to reference stale DNS name.',
        createdAt: new Date(Date.now() - 2400000)
      }
    ]
  },
  {
    incidentId: 'INC-1002',
    title: 'High Queue Latency & Memory Pressure in notification-worker',
    serviceName: 'notification-worker',
    severity: 'Medium',
    status: 'Open',
    triggerReason: 'Worker memory consumption reached 80% limit with elevated task queue delay',
    firstDetectedAt: new Date(Date.now() - 7200000),
    metricsContext: {
      cpuPercent: 65.0,
      memoryMb: 410,
      errorRatePercent: 8.0,
      restartCount: 5,
      avgLatencyMs: 320
    },
    logsContext: [
      '2026-10-09T08:15:00.100Z [WARN] Redis queue backlog exceeds 15,000 pending notification jobs',
      '2026-10-09T08:20:12.400Z [WARN] Node process heap near maximum allocation (410MB / 512MB)'
    ],
    k8sEventsContext: [
      'Event [Warning] ResourceExhausted: Memory usage 410Mi exceeds soft request 350Mi'
    ],
    deploymentContext: {
      version: 'v1.1.2',
      deployedAt: new Date(Date.now() - 172800000),
      commitSha: '91c83b0f'
    }
  }
];

let inMemoryServices = [...seedServices];
let inMemoryIncidents = [...seedIncidents];

// Service Methods
const getAllServices = async () => {
  if (getIsConnected()) {
    try {
      const services = await Service.find().lean();
      if (services.length > 0) return services;
    } catch (e) {
      console.warn('MongoDB query error, falling back to in-memory store');
    }
  }
  return inMemoryServices;
};

const getServiceByName = async (name) => {
  if (getIsConnected()) {
    try {
      const service = await Service.findOne({ name }).lean();
      if (service) return service;
    } catch (e) {}
  }
  return inMemoryServices.find(s => s.name === name);
};

const updateServiceStatus = async (name, updateData) => {
  if (getIsConnected()) {
    try {
      await Service.findOneAndUpdate({ name }, { ...updateData, updatedAt: new Date() }, { upsert: true });
    } catch (e) {}
  }
  const idx = inMemoryServices.findIndex(s => s.name === name);
  if (idx !== -1) {
    inMemoryServices[idx] = { ...inMemoryServices[idx], ...updateData, updatedAt: new Date() };
  }
};

// Incident Methods
const getIncidents = async ({ service, status, severity, page = 1, limit = 10 } = {}) => {
  if (getIsConnected()) {
    try {
      const query = {};
      if (service) query.serviceName = service;
      if (status) query.status = status;
      if (severity) query.severity = severity;

      const skip = (page - 1) * limit;
      const incidents = await Incident.find(query).sort({ firstDetectedAt: -1 }).skip(skip).limit(limit).lean();
      const total = await Incident.countDocuments(query);
      return { incidents, total, page: Number(page), limit: Number(limit) };
    } catch (e) {}
  }

  let filtered = [...inMemoryIncidents];
  if (service) filtered = filtered.filter(i => i.serviceName === service);
  if (status) filtered = filtered.filter(i => i.status === status);
  if (severity) filtered = filtered.filter(i => i.severity === severity);

  filtered.sort((a, b) => new Date(b.firstDetectedAt) - new Date(a.firstDetectedAt));

  const total = filtered.length;
  const skip = (page - 1) * limit;
  const paginated = filtered.slice(skip, skip + limit);

  return { incidents: paginated, total, page: Number(page), limit: Number(limit) };
};

const getIncidentById = async (incidentId) => {
  if (getIsConnected()) {
    try {
      const incident = await Incident.findOne({ incidentId }).lean();
      if (incident) return incident;
    } catch (e) {}
  }
  return inMemoryIncidents.find(i => i.incidentId === incidentId);
};

const createIncident = async (incidentData) => {
  const newId = `INC-${1000 + inMemoryIncidents.length + 1}`;
  const incidentObj = {
    incidentId: incidentData.incidentId || newId,
    title: incidentData.title,
    serviceName: incidentData.serviceName,
    severity: incidentData.severity || 'High',
    status: incidentData.status || 'Open',
    triggerReason: incidentData.triggerReason,
    firstDetectedAt: new Date(),
    metricsContext: incidentData.metricsContext || {},
    logsContext: incidentData.logsContext || [],
    k8sEventsContext: incidentData.k8sEventsContext || [],
    deploymentContext: incidentData.deploymentContext || {},
    remediationHistory: [],
    notes: []
  };

  if (getIsConnected()) {
    try {
      const created = await Incident.create(incidentObj);
      await updateServiceStatus(incidentData.serviceName, { status: incidentData.severity === 'Critical' ? 'Unhealthy' : 'Degraded' });
      return created.toObject();
    } catch (e) {}
  }

  inMemoryIncidents.unshift(incidentObj);
  await updateServiceStatus(incidentData.serviceName, { status: incidentData.severity === 'Critical' ? 'Unhealthy' : 'Degraded' });
  return incidentObj;
};

const updateIncident = async (incidentId, updateData) => {
  if (getIsConnected()) {
    try {
      const updated = await Incident.findOneAndUpdate({ incidentId }, updateData, { new: true }).lean();
      if (updated) return updated;
    } catch (e) {}
  }

  const idx = inMemoryIncidents.findIndex(i => i.incidentId === incidentId);
  if (idx !== -1) {
    inMemoryIncidents[idx] = { ...inMemoryIncidents[idx], ...updateData };
    return inMemoryIncidents[idx];
  }
  return null;
};

module.exports = {
  getAllServices,
  getServiceByName,
  updateServiceStatus,
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncident
};
