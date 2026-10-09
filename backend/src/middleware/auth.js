const jwt = require('jsonwebtoken');
const config = require('../config');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  // Allow opt-in bypass ONLY if explicitly configured in environment variables for dev testing
  if (process.env.ALLOW_DEV_AUTH_BYPASS === 'true' && (!authHeader || !authHeader.startsWith('Bearer '))) {
    req.user = { id: 'usr-1', email: 'devops@cloudops.ai', role: 'admin', name: 'DevOps Engineer' };
    return next();
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required. No Bearer token provided.'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired authentication token.'
    });
  }
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Authentication required.' });
    }
    const userRole = req.user.role || 'viewer';
    if (!allowedRoles.includes(userRole) && userRole !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: `Forbidden: Action requires one of [${allowedRoles.join(', ')}] role permissions.`
      });
    }
    next();
  };
};

module.exports = { authenticate, requireRole };
