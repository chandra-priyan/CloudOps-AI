const config = require('../config');

const getOverviewMetrics = async () => {
  return {
    monitoredServicesCount: 4,
    healthyServicesCount: 2,
    unhealthyServicesCount: 2,
    activeIncidentsCount: 2,
    recentAlertsCount: 3,
    avgCpuPercent: 48.4,
    avgMemoryPercent: 62.1,
    avgRequestErrorRatePercent: 8.5,
    avgResponseTimeMs: 462,
    totalRestartCount: 20
  };
};

const getTimeSeriesMetrics = async () => {
  const points = 12;
  const data = [];
  const now = Date.now();

  for (let i = points - 1; i >= 0; i--) {
    const timestamp = new Date(now - i * 300000).toISOString().substr(11, 5);
    data.push({
      time: timestamp,
      cpu: Math.round((25 + Math.sin(i) * 15 + (i > 8 ? 35 : 0)) * 10) / 10,
      memory: Math.round((45 + Math.cos(i) * 10 + (i > 8 ? 30 : 0)) * 10) / 10,
      errorRate: Math.round((0.5 + (i > 7 ? 20 + Math.random() * 5 : Math.random())) * 10) / 10,
      latency: Math.round(40 + (i > 7 ? 400 + Math.random() * 200 : Math.random() * 20))
    });
  }

  return data;
};

module.exports = { getOverviewMetrics, getTimeSeriesMetrics };
