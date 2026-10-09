const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { metricsMiddleware } = require('./middleware/metrics');
const apiRoutes = require('./routes');
const { getHealth, getReadiness, handleMetrics } = require('./controllers/healthController');

const app = express();

// Security and middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Rate limiting (1000 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { status: 'error', message: 'Too many requests from this IP, please try again later.' }
});
app.use(limiter);

// Prometheus HTTP Metrics Collection Middleware
app.use(metricsMiddleware);

// Health & Metrics Endpoints
app.get('/health', getHealth);
app.get('/readiness', getReadiness);
app.get('/metrics', handleMetrics);

// Versioned API v1 Routes
app.use('/api/v1', apiRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: `Route ${req.originalUrl} not found` });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start Server & Database Connection
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    app.listen(config.port, () => {
      console.log(`====================================================`);
      console.log(`🚀 CloudOps AI Backend API server running on port ${config.port}`);
      console.log(`📊 Metrics available at http://localhost:${config.port}/metrics`);
      console.log(`🏥 Health check at http://localhost:${config.port}/health`);
      console.log(`====================================================`);
    });
  });
}

module.exports = app;
