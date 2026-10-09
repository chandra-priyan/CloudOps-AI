const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  environment: { type: String, default: 'production' },
  status: { type: String, enum: ['Healthy', 'Degraded', 'Unhealthy', 'Unknown'], default: 'Healthy' },
  replicaCount: { type: Number, default: 2 },
  availableReplicas: { type: Number, default: 2 },
  restartCount: { type: Number, default: 0 },
  cpuUtilization: { type: Number, default: 15.5 }, // percentage
  memoryUtilization: { type: Number, default: 240 }, // MB
  memoryLimit: { type: Number, default: 512 }, // MB
  requestErrorRate: { type: Number, default: 0.02 }, // ratio (e.g., 0.02 = 2%)
  avgResponseTimeMs: { type: Number, default: 45 },
  lastDeploymentVersion: { type: String, default: 'v1.4.2' },
  lastDeploymentTime: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Service', ServiceSchema);
