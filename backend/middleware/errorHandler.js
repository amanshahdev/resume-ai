/**
 * middleware/errorHandler.js - Global Express Error Handler
 *
 * WHAT: Catches any error thrown (or passed via next(err)) anywhere in the app
 *       and returns a consistent JSON error response.
 * HOW:  Express identifies a 4-argument middleware as an error handler.  We map
 *       common Mongoose / JWT error types to friendly messages and HTTP codes.
 * WHY:  Without a centralised handler, uncaught errors would either crash the
 *       process or leak stack traces to the client.
 */

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('❌ Error:', err);
  }

  // ── Mongoose: Bad ObjectId ────────────────────────────────────────────────
  if (err.name === 'CastError') {
    error.message = `Resource not found with id: ${err.value}`;
    error.statusCode = 404;
  }

  // ── Mongoose: Duplicate key ───────────────────────────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error.message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
    error.statusCode = 409;
  }

  // ── Mongoose: Validation Error ────────────────────────────────────────────
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    error.message = messages.join('. ');
    error.statusCode = 400;
  }

  // ── Multer: File too large ────────────────────────────────────────────────
  if (err.code === 'LIMIT_FILE_SIZE') {
    error.message = 'File size exceeds the 5MB limit.';
    error.statusCode = 400;
  }

  // ── Multer: Unexpected field ──────────────────────────────────────────────
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error.message = 'Unexpected file field. Use the field name "resume".';
    error.statusCode = 400;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
