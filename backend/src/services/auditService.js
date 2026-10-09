const { getIsConnected } = require('../config/db');
const AuditLog = require('../models/AuditLog');

const inMemoryAuditLogs = [
  {
    action: 'SYSTEM_BOOTUP',
    category: 'System',
    user: 'System Process',
    targetResource: 'CloudOps Platform Backend',
    details: { mode: 'full', nodeEnv: 'development' },
    status: 'Success',
    timestamp: new Date(Date.now() - 3600000)
  },
  {
    action: 'SIMULATION_TRIGGER_CRASH',
    category: 'Simulation',
    user: 'DevOps Engineer (dev@cloudops.ai)',
    targetResource: 'banking-api',
    details: { scenarioId: 'sim-1', description: 'Backend application crash simulation' },
    status: 'Success',
    timestamp: new Date(Date.now() - 3500000)
  }
];

const logAuditAction = async (auditData) => {
  const entry = {
    action: auditData.action,
    category: auditData.category || 'System',
    user: auditData.user || 'DevOps Engineer',
    targetResource: auditData.targetResource || 'System',
    details: auditData.details || {},
    status: auditData.status || 'Success',
    ipAddress: auditData.ipAddress || '127.0.0.1',
    timestamp: new Date()
  };

  if (getIsConnected()) {
    try {
      await AuditLog.create(entry);
    } catch (e) {}
  }
  inMemoryAuditLogs.unshift(entry);
  return entry;
};

const getAuditLogs = async ({ limit = 20, page = 1, category } = {}) => {
  if (getIsConnected()) {
    try {
      const query = category ? { category } : {};
      const skip = (page - 1) * limit;
      const logs = await AuditLog.find(query).sort({ timestamp: -1 }).skip(skip).limit(limit).lean();
      const total = await AuditLog.countDocuments(query);
      return { logs, total };
    } catch (e) {}
  }

  let filtered = [...inMemoryAuditLogs];
  if (category) filtered = filtered.filter(l => l.category === category);
  const skip = (page - 1) * limit;
  const paginated = filtered.slice(skip, skip + limit);
  return { logs: paginated, total: filtered.length };
};

module.exports = { logAuditAction, getAuditLogs };
