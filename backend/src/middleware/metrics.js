const client = require('prom-client');

// Create Prometheus registry
const register = new client.Registry();

// Add default system metrics (CPU, Memory, Event Loop)
client.collectDefaultMetrics({ register });

// Custom Prometheus HTTP metrics
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5]
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const activeIncidentsGauge = new client.Gauge({
  name: 'cloudops_active_incidents_total',
  help: 'Total active unresolved incidents in CloudOps platform',
  labelNames: ['severity']
});

register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestsTotal);
register.registerMetric(activeIncidentsGauge);

const metricsMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    
    httpRequestDurationMicroseconds
      .labels(req.method, route, res.statusCode)
      .observe(duration);

    httpRequestsTotal
      .labels(req.method, route, res.statusCode)
      .inc();
  });

  next();
};

const getMetrics = async () => {
  return await register.metrics();
};

const updateActiveIncidentsMetric = (severity, count) => {
  activeIncidentsGauge.labels(severity).set(count);
};

module.exports = {
  metricsMiddleware,
  getMetrics,
  updateActiveIncidentsMetric,
  contentType: register.contentType
};
