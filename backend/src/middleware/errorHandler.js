const errorHandler = (err, req, res, next) => {
  console.error(`[Express Error] ${err.message}`, err.stack);

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
};

module.exports = errorHandler;
