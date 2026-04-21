// src/middleware/errorHandler.js

/**
 * Centralized Express error handler.
 * Always returns JSON { error, status } — never leaks stack traces in production.
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV !== 'production';

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} → ${status}: ${message}`);
  if (isDev && err.stack) console.error(err.stack);

  res.status(status).json({
    error: message,
    status,
    ...(isDev && { stack: err.stack }),
  });
};

/**
 * Creates a typed HTTP error.
 * @param {number} status
 * @param {string} message
 * @returns {Error}
 */
export const createError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};
