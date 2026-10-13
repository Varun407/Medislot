const { run } = require('../config/db');

async function createAuditLog({
    actorUserId = 'SYSTEM',
    actorRole = 'SYSTEM',
    action,
    resource = null,
    resourceId = null,
    details = null,
    ipAddress = '127.0.0.1'
}) {
    try {
        const id = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const now = new Date().toISOString();
        const detailsStr = typeof details === 'object' ? JSON.stringify(details) : (details || '');

        await run(`
            INSERT INTO audit_logs (id, actorUserId, actorRole, action, resource, resourceId, details, ipAddress, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [id, actorUserId, actorRole, action, resource, resourceId, detailsStr, ipAddress, now]);
    } catch (err) {
        console.error('[AuditLog] Failed to record audit log:', err.message);
    }
}

module.exports = {
    createAuditLog
};
