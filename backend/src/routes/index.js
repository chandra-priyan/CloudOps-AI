const express = require('express');
const router = express.Router();

const { getHealth, getReadiness } = require('../controllers/healthController');
const { login, getMe } = require('../controllers/authController');
const { getServices, getService, getDashboardOverview } = require('../controllers/serviceController');
const { listIncidents, getIncident, createNewIncident, updateIncidentStatus, addIncidentNote } = require('../controllers/incidentController');
const { diagnoseIncident } = require('../controllers/aiController');
const { getAllowlist, handleRemediation } = require('../controllers/remediationController');
const { listScenarios, runSimulation } = require('../controllers/simulationController');
const { listAuditLogs } = require('../controllers/auditController');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { authenticate } = require('../middleware/auth');

// Auth routes
router.post('/auth/login', login);
router.get('/auth/me', authenticate, getMe);

// Dashboard & Services routes
router.get('/dashboard/overview', authenticate, getDashboardOverview);
router.get('/services', authenticate, getServices);
router.get('/services/:name', authenticate, getService);

// Incident Management routes
router.get('/incidents', authenticate, listIncidents);
router.post('/incidents', authenticate, createNewIncident);
router.get('/incidents/:id', authenticate, getIncident);
router.patch('/incidents/:id', authenticate, updateIncidentStatus);
router.post('/incidents/:id/notes', authenticate, addIncidentNote);

// AI Troubleshooting route
router.post('/ai/diagnose', authenticate, diagnoseIncident);

// Safe Remediation routes
router.get('/remediation/allowlist', authenticate, getAllowlist);
router.post('/remediation/execute', authenticate, handleRemediation);

// Failure Simulation Lab routes
router.get('/simulations', authenticate, listScenarios);
router.post('/simulations/trigger', authenticate, runSimulation);

// Audit Logs route
router.get('/audit-logs', authenticate, listAuditLogs);

// Settings routes
router.get('/settings', authenticate, getSettings);
router.put('/settings', authenticate, updateSettings);

module.exports = router;
