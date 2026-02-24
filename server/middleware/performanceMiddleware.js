import PerformanceLog from '../models/PerformanceLog.js';

/**
 * Middleware to measure and log API performance.
 * Tracks response time, payload sizes, and maps endpoints to auth methods.
 */
const performanceMiddleware = (req, res, next) => {
  const startTime = process.hrtime.bigint();
  const requestSize = parseInt(req.headers['content-length'] || '0', 10);

  // Determine auth method from route
  let authMethod = 'none';
  const path = req.originalUrl || req.url;
  if (path.includes('/webauthn/') || path.includes('/recovery/')) {
    authMethod = 'webauthn';
  } else if (path.includes('/auth/login') || path.includes('/auth/register')) {
    authMethod = 'password';
  }

  // Store original end method
  const originalEnd = res.end;
  let responseSize = 0;

  res.end = function (chunk, encoding) {
    if (chunk) {
      responseSize = typeof chunk === 'string' ? Buffer.byteLength(chunk, encoding) : chunk.length;
    }

    const endTime = process.hrtime.bigint();
    const responseTime = Number(endTime - startTime) / 1e6; // Convert nanoseconds to milliseconds

    // Don't block the response — log async
    const logEntry = {
      endpoint: path.split('?')[0], // Remove query params
      httpMethod: req.method,
      authMethod,
      responseTime: Math.round(responseTime * 100) / 100,
      requestSize,
      responseSize,
      statusCode: res.statusCode,
      userId: req.user?._id || null,
      ipAddress: req.ip || req.connection?.remoteAddress,
    };

    // Only log auth-related endpoints (not static assets or health checks)
    if (
      path.includes('/auth/') ||
      path.includes('/recovery/') ||
      path.includes('/user/') ||
      path.includes('/security/') ||
      path.includes('/ux/') ||
      path.includes('/stats/')
    ) {
      PerformanceLog.create(logEntry).catch((err) => {
        console.error('Performance log error:', err.message);
      });
    }

    originalEnd.call(this, chunk, encoding);
  };

  next();
};

export default performanceMiddleware;
