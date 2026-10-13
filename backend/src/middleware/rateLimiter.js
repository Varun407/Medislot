const rateLimit = require('express-rate-limit');

// Strict rate limiter for authentication attempts (Login / Register)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // Limit each IP to 30 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
    }
});

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 300, // 300 requests per 5 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many requests. Please slow down.'
    }
});

module.exports = {
    authLimiter,
    apiLimiter
};
