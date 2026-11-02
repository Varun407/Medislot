const { get, run, connectMongo, mongoose } = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/password');
const { signToken, setAuthCookie, clearAuthCookie } = require('../utils/jwt');
const { createAuditLog } = require('../utils/audit');

// Helper: Find user by Email, Phone (10-digit or raw), or Aadhaar (12-digit or raw)
async function findUserByIdentifier(identifier, role = null) {
    if (!identifier) return null;
    const clean = String(identifier).trim();
    const cleanLower = clean.toLowerCase();
    const digits = clean.replace(/\D/g, '');
    const phone10 = digits.length >= 10 ? digits.slice(-10) : '';
    const aadhar12 = digits.length === 12 ? digits : '';

    await connectMongo();
    const db = mongoose.connection.db;

    const orConditions = [];

    // Email identifier
    if (clean.includes('@')) {
        orConditions.push({ email: cleanLower });
    }

    // Aadhaar identifier (12 digits)
    if (aadhar12) {
        orConditions.push({ aadhar: aadhar12 });
    }

    // Phone identifier (10 digits)
    if (phone10) {
        orConditions.push({ phone: phone10 });
        orConditions.push({ phone: clean });
    }

    // Fallback if none matched
    if (orConditions.length === 0) {
        orConditions.push({ email: cleanLower });
        orConditions.push({ phone: clean });
    }

    const filter = { $or: orConditions };
    if (role) {
        filter.role = role;
    }

    let user = await db.collection('users').findOne(filter);

    // If not found in users, check if a patient profile has this phone or aadhar or abhaId
    if (!user) {
        const profileConditions = [];
        if (phone10) profileConditions.push({ phone: phone10 });
        if (aadhar12) profileConditions.push({ aadhar: aadhar12 });

        if (profileConditions.length > 0) {
            const pProfile = await db.collection('patient_profiles').findOne({ $or: profileConditions });
            if (pProfile && pProfile.userId) {
                const uFilter = { id: pProfile.userId };
                if (role) uFilter.role = role;
                user = await db.collection('users').findOne(uFilter);
            }
        }
    }

    // Also check doctor_profiles if needed
    if (!user) {
        const docConditions = [];
        if (phone10) docConditions.push({ phone: phone10 });

        if (docConditions.length > 0) {
            const dProfile = await db.collection('doctor_profiles').findOne({ $or: docConditions });
            if (dProfile && dProfile.userId) {
                const uFilter = { id: dProfile.userId };
                if (role) uFilter.role = role;
                user = await db.collection('users').findOne(uFilter);
            }
        }
    }

    return user;
}

// 1. Patient Registration
async function patientRegister(req, res, next) {
    try {
        const { fullName, email, phone, aadhar, password } = req.cleanBody;

        // Check duplicate email
        const existing = await get('SELECT id FROM users WHERE email = ?', [email]);
        if (existing) {
            return res.status(409).json({ error: 'An account with this email address already exists.' });
        }

        const userId = `usr_pat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const passwordHash = await hashPassword(password);
        const now = new Date().toISOString();

        await run(`
            INSERT INTO users (id, email, phone, aadhar, passwordHash, role, status, fullName, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [userId, email, phone, aadhar || '', passwordHash, 'PATIENT', 'ACTIVE', fullName, now, now]);

        await run(`
            INSERT INTO patient_profiles (userId, fullName, phone, aadhar, updatedAt)
            VALUES (?, ?, ?, ?, ?)
        `, [userId, fullName, phone, aadhar || '', now]);

        const user = { id: userId, email, phone, aadhar: aadhar || '', fullName, role: 'PATIENT', status: 'ACTIVE' };
        const token = signToken({ userId: user.id, role: user.role });
        setAuthCookie(res, token);

        res.status(201).json({
            message: 'Patient registered successfully.',
            user,
            token
        });
    } catch (err) {
        next(err);
    }
}

// 2. Patient Login
async function patientLogin(req, res, next) {
    try {
        const identifier = req.cleanBody.identifier || req.cleanBody.email;
        const { password } = req.cleanBody;
        const user = await findUserByIdentifier(identifier, 'PATIENT');
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const match = await comparePassword(password, user.passwordHash);
        if (!match) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        if (user.status === 'SUSPENDED') {
            return res.status(403).json({ error: 'Account has been suspended. Please contact hospital administration.' });
        }

        const profile = await get('SELECT * FROM patient_profiles WHERE userId = ?', [user.id]);
        const safeUser = {
            id: user.id,
            email: user.email,
            phone: user.phone,
            aadhar: user.aadhar || (profile && profile.aadhar) || '',
            fullName: user.fullName,
            role: user.role,
            status: user.status,
            profile: profile || null
        };

        const token = signToken({ userId: user.id, role: user.role });
        setAuthCookie(res, token);

        res.json({
            message: 'Login successful.',
            user: safeUser,
            token
        });
    } catch (err) {
        next(err);
    }
}

// 3. Doctor Registration (Default status: PENDING verification)
async function doctorRegister(req, res, next) {
    try {
        const {
            fullName,
            email,
            phone,
            specialization,
            qualifications,
            experienceYears,
            hospitalId,
            password
        } = req.cleanBody;

        // Check duplicate
        const existing = await get('SELECT id FROM users WHERE email = ?', [email]);
        if (existing) {
            return res.status(409).json({ error: 'An account with this email address already exists.' });
        }

        const hospital = await get('SELECT nameEn FROM hospitals WHERE id = ?', [hospitalId]);
        const hospitalName = hospital ? hospital.nameEn : 'Government District Hospital, Bhimavaram';

        const userId = `usr_doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const passwordHash = await hashPassword(password);
        const now = new Date().toISOString();

        // Default default consultation slots
        const defaultSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '01:00 PM'];

        await run(`
            INSERT INTO users (id, email, phone, passwordHash, role, status, fullName, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, 'DOCTOR', 'PENDING', ?, ?, ?)
        `, [userId, email, phone, passwordHash, fullName, now, now]);

        await run(`
            INSERT INTO doctor_profiles (
                userId, fullName, phone, specialization, qualifications, experienceYears,
                hospitalId, hospitalName, consultationHours, languages,
                verificationStatus, todayAvailable, slotsJson, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, '8:30 AM - 2:00 PM', 'Telugu, English', 'PENDING', 1, ?, ?)
        `, [
            userId, fullName, phone, specialization, qualifications, experienceYears,
            hospitalId, hospitalName, JSON.stringify(defaultSlots), now
        ]);

        await createAuditLog({
            actorUserId: userId,
            actorRole: 'DOCTOR',
            action: 'DOCTOR_REGISTERED_PENDING',
            resource: 'users',
            resourceId: userId,
            details: { email, specialization, qualifications, hospitalId },
            ipAddress: req.ip
        });

        res.status(201).json({
            message: 'Doctor registration submitted successfully. Your account is pending administrator verification before you can consult patients.',
            verificationStatus: 'PENDING',
            user: {
                id: userId,
                email,
                fullName,
                role: 'DOCTOR',
                status: 'PENDING'
            }
        });
    } catch (err) {
        next(err);
    }
}

// 4. Doctor Login
async function doctorLogin(req, res, next) {
    try {
        const identifier = req.cleanBody.identifier || req.cleanBody.email;
        const { password } = req.cleanBody;
        const user = await findUserByIdentifier(identifier, 'DOCTOR');
        if (!user) {
            return res.status(401).json({ error: 'Invalid doctor credentials.' });
        }

        const match = await comparePassword(password, user.passwordHash);
        if (!match) {
            return res.status(401).json({ error: 'Invalid doctor credentials.' });
        }

        const profile = await get('SELECT * FROM doctor_profiles WHERE userId = ?', [user.id]);
        const safeUser = {
            id: user.id,
            email: user.email,
            phone: user.phone,
            aadhar: user.aadhar || '',
            fullName: user.fullName,
            role: user.role,
            status: user.status,
            verificationStatus: profile ? profile.verificationStatus : 'PENDING',
            profile: profile || null
        };

        const token = signToken({ userId: user.id, role: user.role });
        setAuthCookie(res, token);

        res.json({
            message: 'Login successful.',
            user: safeUser,
            token
        });
    } catch (err) {
        next(err);
    }
}

// 5. Admin Login (Dedicated hidden admin entry)
async function adminLogin(req, res, next) {
    try {
        const identifier = req.cleanBody.identifier || req.cleanBody.email;
        const { password } = req.cleanBody;
        const user = await findUserByIdentifier(identifier, 'ADMIN');
        if (!user) {
            return res.status(401).json({ error: 'Invalid administrator credentials.' });
        }

        const match = await comparePassword(password, user.passwordHash);
        if (!match) {
            return res.status(401).json({ error: 'Invalid administrator credentials.' });
        }

        await createAuditLog({
            actorUserId: user.id,
            actorRole: 'ADMIN',
            action: 'ADMIN_LOGIN_SUCCESS',
            resource: 'users',
            resourceId: user.id,
            details: { identifier },
            ipAddress: req.ip
        });

        const safeUser = {
            id: user.id,
            email: user.email,
            phone: user.phone,
            aadhar: user.aadhar || '',
            fullName: user.fullName,
            role: user.role,
            status: user.status
        };

        const token = signToken({ userId: user.id, role: user.role });
        setAuthCookie(res, token);

        res.json({
            message: 'Administrator authentication successful.',
            user: safeUser,
            token
        });
    } catch (err) {
        next(err);
    }
}

// 6. Logout
async function logout(req, res) {
    clearAuthCookie(res);
    res.json({ message: 'Logged out successfully.' });
}

// 7. Session Restoration / Current User Check
async function getCurrentUser(req, res, next) {
    try {
        const user = req.user;
        let profile = null;

        if (user.role === 'PATIENT') {
            profile = await get('SELECT * FROM patient_profiles WHERE userId = ?', [user.id]);
        } else if (user.role === 'DOCTOR') {
            profile = await get('SELECT * FROM doctor_profiles WHERE userId = ?', [user.id]);
        }

        res.json({
            user: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                aadhar: user.aadhar || (profile && profile.aadhar) || '',
                fullName: user.fullName,
                role: user.role,
                status: user.status,
                verificationStatus: profile ? profile.verificationStatus : undefined,
                profile: profile || null
            }
        });
    } catch (err) {
        next(err);
    }
}

// Unified Login: automatically authenticates and returns user with role (DOCTOR, PATIENT, ADMIN)
async function unifiedLogin(req, res, next) {
    try {
        const identifier = req.cleanBody.identifier || req.cleanBody.email;
        const { password } = req.cleanBody;
        const user = await findUserByIdentifier(identifier);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const match = await comparePassword(password, user.passwordHash);
        if (!match) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        if (user.status === 'SUSPENDED') {
            return res.status(403).json({ error: 'Account has been suspended. Please contact hospital administration.' });
        }

        let profile = null;
        let verificationStatus = undefined;

        if (user.role === 'DOCTOR') {
            profile = await get('SELECT * FROM doctor_profiles WHERE userId = ?', [user.id]);
            verificationStatus = profile ? profile.verificationStatus : 'PENDING';
        } else if (user.role === 'PATIENT') {
            profile = await get('SELECT * FROM patient_profiles WHERE userId = ?', [user.id]);
        }

        const safeUser = {
            id: user.id,
            email: user.email,
            phone: user.phone,
            aadhar: user.aadhar || (profile && profile.aadhar) || '',
            fullName: user.fullName,
            role: user.role,
            status: user.status,
            verificationStatus,
            profile: profile || null
        };

        const token = signToken({ userId: user.id, role: user.role });
        setAuthCookie(res, token);

        res.json({
            message: `Login successful as ${user.role}.`,
            user: safeUser,
            token
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    patientRegister,
    patientLogin,
    doctorRegister,
    doctorLogin,
    adminLogin,
    unifiedLogin,
    logout,
    getCurrentUser
};
