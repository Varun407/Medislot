const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN, NODE_ENV } = require('../config/env');

const COOKIE_NAME = 'medislot_session';

function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return null;
    }
}

function setAuthCookie(res, token) {
    const isProduction = NODE_ENV === 'production';
    const maxAgeMs = 24 * 60 * 60 * 1000; // 24 hours

    res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: maxAgeMs,
        path: '/'
    });
}

function clearAuthCookie(res) {
    const isProduction = NODE_ENV === 'production';
    res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/'
    });
}

function extractToken(req) {
    // 1. Check HTTP-only cookie first
    if (req.cookies && req.cookies[COOKIE_NAME]) {
        return req.cookies[COOKIE_NAME];
    }
    // 2. Check Authorization Bearer header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7).trim();
    }
    return null;
}

module.exports = {
    COOKIE_NAME,
    signToken,
    verifyToken,
    setAuthCookie,
    clearAuthCookie,
    extractToken
};
