import rateLimit from "express-rate-limit";

/**
 * Creates a configured rate limiter middleware.
 *
 * @param {object} options
 * @param {number} options.windowMs   - Time window in milliseconds
 * @param {number} options.max        - Max requests per window
 * @param {string} options.message    - Error message sent to client
 */
export const createRateLimiter = ({ windowMs, max, message }) => {
  return rateLimit({
    windowMs,
    max,
    message: { message },
    standardHeaders: true,  // returns rate limit info in RateLimit-* headers
    legacyHeaders: false,   // disables X-RateLimit-* headers
    handler: (req, res, next, options) => {
      res.status(options.statusCode).json(options.message);
    },
  });
};