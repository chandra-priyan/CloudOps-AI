const jwt = require('jsonwebtoken');
const config = require('../config');

const login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ status: 'error', message: 'Email and password required' });
  }

  const token = jwt.sign(
    { id: 'usr-1', email, role: 'admin', name: 'DevOps Engineer' },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  res.status(200).json({
    status: 'success',
    token,
    user: { id: 'usr-1', email, role: 'admin', name: 'DevOps Engineer' }
  });
};

const getMe = (req, res) => {
  res.status(200).json({
    status: 'success',
    user: req.user || { id: 'usr-1', email: 'devops@cloudops.ai', role: 'admin', name: 'DevOps Engineer' }
  });
};

module.exports = { login, getMe };
