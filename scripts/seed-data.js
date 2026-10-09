import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cloudops_ai';

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  displayName: String,
  status: { type: String, enum: ['Healthy', 'Degraded', 'Unhealthy'], default: 'Healthy' },
  replicaCount: { type: Number, default: 3 },
  availableReplicas: { type: Number, default: 3 },
  cpuUtilization: { type: Number, default: 25 },
  memoryUtilization: { type: Number, default: 120 },
  restartCount: { type: Number, default: 0 },
  requestErrorRate: { type: Number, default: 0.001 },
  avgResponseTimeMs: { type: Number, default: 45 },
  lastDeploymentVersion: { type: String, default: 'v1.0.0' }
});

const incidentSchema = new mongoose.Schema({
  incidentId: { type: String, required: true, unique: true },
  title: String,
  serviceName: String,
  severity: String,
  status: String,
  triggerReason: String,
  firstDetectedAt: { type: Date, default: Date.now },
  logsContext: [String],
  k8sEventsContext: [String],
  aiDiagnosis: Object,
  notes: Array
});

const Service = mongoose.model('Service', serviceSchema);
const Incident = mongoose.model('Incident', incidentSchema);

async function seed() {
  try {
    console.log('Connecting to MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);

    await Service.deleteMany({});
    await Incident.deleteMany({});

    console.log('Seeding Services...');
    await Service.insertMany([
      {
        name: 'banking-api',
        displayName: 'Banking & Core Payment API',
        status: 'Unhealthy',
        replicaCount: 3,
        availableReplicas: 1,
        cpuUtilization: 88.5,
        memoryUtilization: 490,
        restartCount: 14,
        requestErrorRate: 0.184,
        avgResponseTimeMs: 1420,
        lastDeploymentVersion: 'v2.1.0'
      },
      {
        name: 'user-auth-service',
        displayName: 'User Authentication Service',
        status: 'Healthy',
        replicaCount: 2,
        availableReplicas: 2,
        cpuUtilization: 18.2,
        memoryUtilization: 140,
        restartCount: 0,
        requestErrorRate: 0.002,
        avgResponseTimeMs: 32,
        lastDeploymentVersion: 'v1.8.4'
      },
      {
        name: 'notification-worker',
        displayName: 'Notification & Email Queue Worker',
        status: 'Degraded',
        replicaCount: 4,
        availableReplicas: 3,
        cpuUtilization: 65.0,
        memoryUtilization: 310,
        restartCount: 4,
        requestErrorRate: 0.045,
        avgResponseTimeMs: 210,
        lastDeploymentVersion: 'v1.1.2'
      },
      {
        name: 'payment-gateway',
        displayName: 'Stripe & PayPal Payment Gateway Integration',
        status: 'Healthy',
        replicaCount: 3,
        availableReplicas: 3,
        cpuUtilization: 28.0,
        memoryUtilization: 180,
        restartCount: 0,
        requestErrorRate: 0.001,
        avgResponseTimeMs: 55,
        lastDeploymentVersion: 'v3.0.1'
      }
    ]);

    console.log('Seeding Incidents...');
    await Incident.insertMany([
      {
        incidentId: 'INC-1001',
        title: 'Repeated Pod Restraints & OOMKilled Termination in banking-api',
        serviceName: 'banking-api',
        severity: 'Critical',
        status: 'Investigating',
        triggerReason: 'ENOTFOUND mongodb-primary hostname resolution loss',
        logsContext: [
          '2026-10-09T10:01:12.412Z [ERROR] Failed to connect to mongodb-primary:27017: Connection timed out',
          '2026-10-09T10:01:14.901Z [FATAL] MongoNetworkError: getaddrinfo ENOTFOUND mongodb-primary',
          '2026-10-09T10:01:18.889Z [K8S] Pod banking-api-7945d8b8c-x9z2p exited with code 137 (OOMKilled)'
        ],
        k8sEventsContext: [
          '2026-10-09T10:01:18Z warning BackOff kubelet, default Back-off restarting failed container banking-api in pod banking-api-7945d8b8c-x9z2p'
        ],
        aiDiagnosis: {
          summary: 'Database connection hostname resolution failure leading to memory pool leak and OOMKilled termination.',
          probableRootCause: 'DNS Resolution Failure / Incorrect ConfigMap Hostname for Database',
          confidenceLevel: 'High',
          supportingEvidence: [
            'Logs confirm getaddrinfo ENOTFOUND mongodb-primary',
            'Container exited with status code 137 (OOMKilled)'
          ],
          alternativeExplanations: ['CoreDNS pod restart on Kubernetes node 2'],
          diagnosticCommands: ['kubectl get configmap banking-api-config -o yaml', 'kubectl get pods -n kube-system -l k8s-app=kube-dns'],
          recommendedRemediation: 'Restart banking-api deployment or update ConfigMap database URI.',
          riskLevel: 'Medium',
          modelName: 'qwen2.5-coder'
        },
        notes: [
          { author: 'DevOps Engine', content: 'Incident automatically created via Prometheus alert trigger.', createdAt: new Date() }
        ]
      }
    ]);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Database seeding failed:', err);
    process.exit(1);
  }
}

seed();
