const { ALLOWLISTED_ACTIONS, executeRemediation } = require('../services/remediationService');

const getAllowlist = (req, res) => {
  res.status(200).json({
    status: 'success',
    allowlistedActions: ALLOWLISTED_ACTIONS
  });
};

const handleRemediation = async (req, res, next) => {
  try {
    const { incidentId, action, serviceName, dryRun } = req.body;
    if (!incidentId || !action || !serviceName) {
      return res.status(400).json({ status: 'error', message: 'incidentId, action, and serviceName are required' });
    }

    const result = await executeRemediation({
      incidentId,
      action,
      serviceName,
      dryRun: dryRun !== false, // default to true (dry run safe)
      user: req.user?.email || 'DevOps Engineer'
    });

    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
};

module.exports = { getAllowlist, handleRemediation };
