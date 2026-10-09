const { getAuditLogs } = require('../services/auditService');

const listAuditLogs = async (req, res, next) => {
  try {
    const { category, page, limit } = req.query;
    const result = await getAuditLogs({ category, page, limit });
    res.status(200).json({ status: 'success', ...result });
  } catch (err) {
    next(err);
  }
};

module.exports = { listAuditLogs };
