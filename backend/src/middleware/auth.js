const { extractToken, verifyToken } = require('../utils/jwt');
const { get } = require('../config/db');

async function authenticateToken(req, res, next) {
    const token = extractToken(req);
    if (!token) {
        return res.status(401).json({ error: 'Authentication required. Please log in.' });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
        return res.status(401).json({ error: 'Session expired or invalid token. Please log in again.' });
    }

    try {
        const user = await get('SELECT id, email, phone, role, status, fullName FROM users WHERE id = ?', [decoded.userId]);
        if (!user) {
            return res.status(401).json({ error: 'User account not found.' });
        }

        if (user.status === 'SUSPENDED') {
            return res.status(403).json({ error: 'Account has been suspended. Please contact hospital administration.' });
        }

        req.user = user;
        next();
    } catch (err) {
        next(err);
    }
}

function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required.' });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Access denied. You do not possess the required permissions for this action.'
            });
        }
        next();
    };
}

async function requireVerifiedDoctor(req, res, next) {
    if (!req.user || req.user.role !== 'DOCTOR') {
        return res.status(403).json({ error: 'Access restricted to medical doctors.' });
    }

    try {
        const profile = await get('SELECT * FROM doctor_profiles WHERE userId = ?', [req.user.id]);
        if (!profile) {
            return res.status(404).json({ error: 'Doctor profile record not found.' });
        }

        if (profile.verificationStatus !== 'VERIFIED') {
            return res.status(403).json({
                error: 'Your doctor credentials are currently pending review and administrative approval.',
                verificationStatus: profile.verificationStatus,
                isPendingApproval: true
            });
        }

        req.doctorProfile = profile;
        next();
    } catch (err) {
        next(err);
    }
}

module.exports = {
    authenticateToken,
    requireRole,
    requireVerifiedDoctor
};
