const mongoose = require('mongoose');

const MetricSnapshotSchema = new mongoose.Schema({
  serviceName: { type: String, required: true },
  cpuPercent: { type: Number, required: true },
  memoryMb: { type: Number, required: true },
  errorRatePercent: { type: Number, required: true },
  requestCount: { type: Number, required: true },
  avgLatencyMs: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MetricSnapshot', MetricSnapshotSchema);
