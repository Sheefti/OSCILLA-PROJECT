const { NODE_ENV } = require('../config');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.response?.status || err.status || 500;

  const message =
    err.response?.data?.error_message ||
    err.message ||
    'Internal Server Error';

  console.error(`[ERROR] ${statusCode} — ${message}`);

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

module.exports = errorHandler;