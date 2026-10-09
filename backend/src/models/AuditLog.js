const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // e.g. "REMEDIATION_EXECUTE", "SIMULATION_TRIGGER", "INCIDENT_UPDATE"
  category: { type: String, enum: ['Remediation', 'Simulation', 'Incident', 'System', 'Auth'], required: true },
  user: { type: String, default: 'DevOps Engineer (dev@cloudops.ai)' },
  targetResource: { type: String, required: true },
  details: { type: Object, default: {} },
  status: { type: String, enum: ['Success', 'Failed', 'DryRun'], default: 'Success' },
  ipAddress: { type: String, default: '127.0.0.1' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
