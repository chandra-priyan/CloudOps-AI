const mongoose = require('mongoose');

const DiagnosisSchema = new mongoose.Schema({
  incidentId: { type: String, required: true },
  serviceName: { type: String, required: true },
  summary: { type: String, required: true },
  probableRootCause: { type: String, required: true },
  confidenceLevel: { type: String, enum: ['High', 'Medium', 'Low'], required: true },
  supportingEvidence: [{ type: String }],
  alternativeExplanations: [{ type: String }],
  diagnosticCommands: [{ type: String }],
  recommendedRemediation: { type: String, required: true },
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], required: true },
  verificationSteps: [{ type: String }],
  rawModelOutput: { type: String },
  modelName: { type: String, default: 'qwen2.5-coder' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Diagnosis', DiagnosisSchema);
