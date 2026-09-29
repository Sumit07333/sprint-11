/**
 * Custom Logger Middleware
 * 
 * Intercepts every incoming HTTP request and logs:
 * - HTTP Method
 * - URL Path
 * - Formatted Timestamp (e.g., [GET] /posts - 04:30 PM)
 * 
 * Does not rely on any third-party logging library.
 */
function requestLogger(req, res, next) {
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  console.log(`[${req.method}] ${req.originalUrl || req.url} - ${timeString}`);
  next();
}

module.exports = requestLogger;
