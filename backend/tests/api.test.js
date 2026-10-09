const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/server');
const config = require('../src/config');

describe('CloudOps AI Backend API & Security Suite', () => {
  let adminToken;
  let viewerToken;

  beforeAll(() => {
    adminToken = jwt.sign(
      { id: 'usr-admin', email: 'admin@cloudops.ai', role: 'admin' },
      config.jwtSecret,
      { expiresIn: '1h' }
    );

    viewerToken = jwt.sign(
      { id: 'usr-viewer', email: 'viewer@cloudops.ai', role: 'viewer' },
      config.jwtSecret,
      { expiresIn: '1h' }
    );
  });

  describe('Health & Observability Endpoints', () => {
    it('GET /health should return status healthy and database status', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('healthy');
      expect(res.body).toHaveProperty('database');
    });

    it('GET /readiness should return status ready', async () => {
      const res = await request(app).get('/readiness');
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('ready');
    });

    it('GET /metrics should export Prometheus metrics', async () => {
      const res = await request(app).get('/metrics');
      expect(res.statusCode).toEqual(200);
      expect(res.headers['content-type']).toContain('text/plain');
      expect(res.text).toContain('http_requests_total');
    });
  });

  describe('Authentication & RBAC Protection', () => {
    it('POST /api/v1/auth/login should return a valid JWT token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'devops@cloudops.ai', password: 'securepassword123' });
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body).toHaveProperty('token');
    });

    it('GET /api/v1/services should reject unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/v1/services');
      expect(res.statusCode).toEqual(401);
      expect(res.body.status).toEqual('error');
    });

    it('GET /api/v1/services should allow request with valid Bearer token', async () => {
      const res = await request(app)
        .get('/api/v1/services')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('POST /api/v1/remediation/execute should forbid viewer role with 403', async () => {
      const res = await request(app)
        .post('/api/v1/remediation/execute')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          incidentId: 'INC-1001',
          action: 'RESTART_DEPLOYMENT',
          serviceName: 'banking-api'
        });
      expect(res.statusCode).toEqual(403);
      expect(res.body.status).toEqual('error');
    });

    it('POST /api/v1/remediation/execute should reject unlisted actions with 400', async () => {
      const res = await request(app)
        .post('/api/v1/remediation/execute')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          incidentId: 'INC-1001',
          action: 'UNAUTHORIZED_DESTRUCTION_CMD',
          serviceName: 'banking-api'
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual('error');
    });

    it('POST /api/v1/remediation/execute should accept allowlisted action in dry-run mode for admin', async () => {
      const res = await request(app)
        .post('/api/v1/remediation/execute')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          incidentId: 'INC-1001',
          action: 'RESTART_DEPLOYMENT',
          serviceName: 'banking-api',
          dryRun: true
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.data.dryRun).toBe(true);
    });
  });

  describe('Incident Management & Filter Validation', () => {
    it('GET /api/v1/incidents should support filtering by severity', async () => {
      const res = await request(app)
        .get('/api/v1/incidents?severity=Critical')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(Array.isArray(res.body.incidents)).toBe(true);
    });

    it('GET /api/v1/incidents/NON_EXISTENT_ID should return 404 Incident not found', async () => {
      const res = await request(app)
        .get('/api/v1/incidents/INC-INVALID-999')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(404);
      expect(res.body.status).toEqual('error');
      expect(res.body.message).toEqual('Incident not found');
    });
  });
});
