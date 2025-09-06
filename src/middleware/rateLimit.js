const rateLimit = require('express-rate-limit');
const { getHashedIP } = require('./ipCheck.js');

// Create rate limiter for image uploads
const uploadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 uploads per windowMs
  message: {
    error: 'Too many uploads from this IP, please try again in 15 minutes.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  
  // Use plain IP addresses
  keyGenerator: (req) => {
    return getHashedIP(req);
  },
  
  // Skip rate limiting for certain conditions if needed
  skip: (req) => {
    // You can add logic here to skip rate limiting for certain IPs
    // For example, whitelist certain IPs or skip if user is authenticated
    return false;
  },

  // Custom handler for when rate limit is exceeded
  handler: (req, res) => {
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many uploads from this IP, please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// Stricter rate limiter for potential abuse cases
const strictUploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit each IP to 50 uploads per hour
  message: {
    error: 'Hourly upload limit exceeded, please try again later.',
    retryAfter: '1 hour'
  },
  keyGenerator: (req) => {
    return getHashedIP(req);
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Hourly rate limit exceeded',
      message: 'Too many uploads from this IP in the past hour, please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// General API rate limiter (can be used for other endpoints)
const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  keyGenerator: (req) => {
    return getHashedIP(req);
  }
});

module.exports = {
  uploadRateLimit,
  strictUploadRateLimit,
  generalRateLimit
};