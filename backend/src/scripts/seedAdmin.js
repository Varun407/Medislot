const bcrypt = require('bcryptjs');
const { get, run, initDatabase } = require('../config/db');
const {
    ADMIN_DEFAULT_EMAIL,
    ADMIN_DEFAULT_PASSWORD,
    ADMIN_DEFAULT_NAME,
    ADMIN_DEFAULT_PHONE
} = require('../config/env');
const { createAuditLog } = require('../utils/audit');

async function seedAdminCLI() {
    console.log('[SeedAdmin] Initializing database...');
    await initDatabase();

    const email = (process.argv[2] || ADMIN_DEFAULT_EMAIL).toLowerCase().trim();
    const password = process.argv[3] || ADMIN_DEFAULT_PASSWORD;
    const fullName = process.argv[4] || ADMIN_DEFAULT_NAME;
    const phone = process.argv[5] || ADMIN_DEFAULT_PHONE;

    console.log(`[SeedAdmin] Checking administrator account for: ${email}`);
    const existing = await get('SELECT id, email, role FROM users WHERE email = ?', [email]);

    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);
    const now = new Date().toISOString();

    if (existing) {
        if (existing.role !== 'ADMIN') {
            console.error(`[SeedAdmin] Error: User ${email} already exists with role ${existing.role}. Cannot overwrite.`);
            process.exit(1);
        }
        console.log(`[SeedAdmin] Updating existing administrator password for: ${email}`);
        await run('UPDATE users SET passwordHash = ?, fullName = ?, phone = ?, updatedAt = ? WHERE id = ?', [
            hash, fullName, phone, now, existing.id
        ]);
        await createAuditLog({
            actorUserId: existing.id,
            actorRole: 'SYSTEM',
            action: 'ADMIN_CREDENTIALS_ROTATED',
            resource: 'users',
            resourceId: existing.id,
            details: { email }
        });
        console.log('[SeedAdmin] Administrator password successfully updated.');
    } else {
        const adminId = `usr_admin_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        await run(`
            INSERT INTO users (id, email, phone, passwordHash, role, status, fullName, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, 'ADMIN', 'ACTIVE', ?, ?, ?)
        `, [adminId, email, phone, hash, fullName, now, now]);

        await createAuditLog({
            actorUserId: adminId,
            actorRole: 'SYSTEM',
            action: 'ADMIN_ACCOUNT_BOOTSTRAPPED',
            resource: 'users',
            resourceId: adminId,
            details: { email }
        });
        console.log(`[SeedAdmin] Created new administrator account (${email}).`);
    }

    console.log('====================================================');
    console.log(' Administrator Credentials:');
    console.log(` Email:    ${email}`);
    console.log(` Route:    /control-center/login`);
    console.log('====================================================');
    process.exit(0);
}

seedAdminCLI().catch(err => {
    console.error('[SeedAdmin] Failed:', err);
    process.exit(1);
});
