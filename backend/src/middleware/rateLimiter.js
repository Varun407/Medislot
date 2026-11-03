const rateLimit = require('express-rate-limit');

// Strict rate limiter for authentication attempts (Login / Register)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each IP to 50 requests per windowMs
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

// In-Memory Brute-Force & Consecutive Failure Lockout Manager for 6-digit MPIN
const failedAttemptsMap = new Map();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

const lockoutManager = {
    isLocked(identifier) {
        if (!identifier) return { locked: false };
        const key = String(identifier).trim().toLowerCase();
        const record = failedAttemptsMap.get(key);
        if (!record) return { locked: false };

        const now = Date.now();
        if (record.lockoutUntil && record.lockoutUntil > now) {
            const remainingMinutes = Math.ceil((record.lockoutUntil - now) / 60000);
            return { locked: true, remainingMinutes };
        }

        // Lockout expired, clean up
        if (record.lockoutUntil && record.lockoutUntil <= now) {
            failedAttemptsMap.delete(key);
            return { locked: false };
        }

        return { locked: false };
    },

    recordFailure(identifier) {
        if (!identifier) return 1;
        const key = String(identifier).trim().toLowerCase();
        const record = failedAttemptsMap.get(key) || { count: 0, firstAttemptAt: Date.now() };

        record.count += 1;
        record.lastAttemptAt = Date.now();

        if (record.count >= MAX_FAILED_ATTEMPTS) {
            record.lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
        }

        failedAttemptsMap.set(key, record);
        return record.count;
    },

    recordSuccess(identifier) {
        if (!identifier) return;
        const key = String(identifier).trim().toLowerCase();
        failedAttemptsMap.delete(key);
    },

    getRemainingAttempts(identifier) {
        if (!identifier) return MAX_FAILED_ATTEMPTS;
        const key = String(identifier).trim().toLowerCase();
        const record = failedAttemptsMap.get(key);
        if (!record) return MAX_FAILED_ATTEMPTS;
        return Math.max(0, MAX_FAILED_ATTEMPTS - record.count);
    }
};

module.exports = {
    authLimiter,
    apiLimiter,
    lockoutManager
};
