const { getMetrics, contentType } = require('../middleware/metrics');
const { getIsConnected } = require('../config/db');

const getHealth = (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    mode: process.env.OBSERVABILITY_MODE || 'full',
    database: getIsConnected() ? 'connected' : 'degraded_in_memory'
  });
};

const getReadiness = (req, res) => {
  res.status(200).json({
    status: 'ready',
    checks: {
      api: 'ok',
      database: getIsConnected() ? 'ok' : 'degraded_in_memory'
    }
  });
};

const handleMetrics = async (req, res) => {
  try {
    res.set('Content-Type', contentType);
    const metricsData = await getMetrics();
    res.send(metricsData);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

module.exports = { getHealth, getReadiness, handleMetrics };
