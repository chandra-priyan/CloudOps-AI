const config = require('../config');

let appSettings = {
  ollamaModel: config.ollamaModel,
  ollamaBaseUrl: config.ollamaBaseUrl,
  aiServiceUrl: config.aiServiceUrl,
  enableDryRun: config.enableDryRun,
  requireApproval: config.requireApproval,
  observabilityMode: config.observabilityMode,
  alertThresholds: {
    cpuPercent: 80,
    memoryMb: 450,
    errorRatePercent: 5.0,
    restartCount: 3
  }
};

const getSettings = (req, res) => {
  res.status(200).json({ status: 'success', data: appSettings });
};

const updateSettings = (req, res) => {
  appSettings = { ...appSettings, ...req.body };
  res.status(200).json({ status: 'success', data: appSettings });
};

module.exports = { getSettings, updateSettings };
