/**
 * Create a new API error
 * @param {String} message - Error message
 * @param {Number} statusCode - HTTP status code (default is 400)
 * @param {Array} errors - Optional array of errors
 */

class ApiError extends Error {
  constructor(message, statusCode = 400, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

/**
 * Express error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, _next) => {
  const { logger } = require('../../config/logger');

  // Log the error
  logger.error('Error caught by middleware:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Handle ApiError instances
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      message: err.message,
      data: null,
      errors: err.message,
      status: 'error',
      status_code: err.statusCode
    });
  }

  // Handle Mongoose validation errors
  if (err instanceof Error && err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: err.message,
      data: null,
      status: 'error',
      status_code: 400
    });
  }

  // Handle Mongoose cast errors (invalid ObjectId)
  if (err instanceof Error && err.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid ID format',
      errors: err.message,
      data: null,
      status: 'error',
      status_code: 400
    });
  }

  // Handle JWT errors
  if (err instanceof Error && err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Invalid token',
      errors: err.message,
      data: null,
      status: 'error',
      status_code: 401
    });
  }

  if (err instanceof Error && err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token expired',
      errors: err.message,
      data: null,
      status: 'error',
      status_code: 401
    });
  }

  // Handle MongoDB duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      message: `${field} already exists`,
      errors: err.message,
      data: null,
      status: 'error',
      status_code: 400
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Something went wrong'
      : err.message;

  return res.status(statusCode).json({
    message: message,
    errors: err.message,
    data: null,
    status: 'error',
    status_code: statusCode,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

module.exports = { ApiError, errorHandler };
