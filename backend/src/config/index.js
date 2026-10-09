const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/cloudops_ai',
  jwtSecret: process.env.JWT_SECRET || 'super_secret_dev_key_cloudops_ai_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  ollamaModel: process.env.OLLAMA_MODEL || 'qwen2.5-coder',
  prometheusUrl: process.env.PROMETHEUS_URL || 'http://localhost:9090',
  enableDryRun: process.env.ENABLE_DRY_RUN !== 'false',
  requireApproval: process.env.REQUIRE_APPROVAL !== 'false',
  observabilityMode: process.env.OBSERVABILITY_MODE || 'full'
};
