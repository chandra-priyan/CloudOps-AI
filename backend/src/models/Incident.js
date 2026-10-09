const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({
  incidentId: { type: String, required: true, unique: true }, // e.g. INC-1001
  title: { type: String, required: true },
  serviceName: { type: String, required: true },
  severity: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'], default: 'High' },
  status: { type: String, enum: ['Open', 'Investigating', 'Remediating', 'Resolved'], default: 'Open' },
  triggerReason: { type: String, required: true },
  firstDetectedAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date },
  metricsContext: {
    cpuPercent: Number,
    memoryMb: Number,
    errorRatePercent: Number,
    restartCount: Number,
    avgLatencyMs: Number
  },
  logsContext: [{ type: String }],
  k8sEventsContext: [{ type: String }],
  deploymentContext: {
    version: String,
    deployedAt: Date,
    commitSha: String
  },
  aiDiagnosis: {
    summary: String,
    probableRootCause: String,
    confidenceLevel: String, // High, Medium, Low
    supportingEvidence: [String],
    alternativeExplanations: [String],
    diagnosticCommands: [String],
    recommendedRemediation: String,
    riskLevel: String,
    verificationSteps: [String],
    analyzedAt: Date
  },
  remediationHistory: [{
    action: String,
    approvedBy: String,
    status: String,
    executedAt: Date,
    dryRun: Boolean,
    verificationResult: String
  }],
  notes: [{
    author: String,
    content: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Incident', IncidentSchema);
