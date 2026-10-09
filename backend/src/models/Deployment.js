const mongoose = require('mongoose');

const DeploymentSchema = new mongoose.Schema({
  deploymentId: { type: String, required: true, unique: true },
  serviceName: { type: String, required: true },
  version: { type: String, required: true },
  commitSha: { type: String, required: true },
  deployedBy: { type: String, default: 'GitHub Actions CI/CD' },
  status: { type: String, enum: ['Success', 'Failed', 'InProgress', 'RolledBack'], default: 'Success' },
  changelog: { type: String },
  deployedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Deployment', DeploymentSchema);
