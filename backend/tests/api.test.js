import request from 'supertest';
import app from '../src/server.js';

describe('CloudOps AI Backend API Suite', () => {
  it('GET /health should return 200 status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('ok');
    expect(res.body.service).toEqual('cloudops-backend');
  });

  it('GET /api/v1/services should return array of monitored services', async () => {
    const res = await request(app).get('/api/v1/services');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/v1/remediation/execute should enforce allowlisted actions', async () => {
    const res = await request(app)
      .post('/api/v1/remediation/execute')
      .send({
        incidentId: 'INC-1001',
        action: 'FORBIDDEN_ACTION',
        serviceName: 'banking-api'
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body.status).toEqual('error');
  });
});
