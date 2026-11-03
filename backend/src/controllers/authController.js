const { get, run, connectMongo, mongoose } = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/password');
const { signToken, setAuthCookie, clearAuthCookie } = require('../utils/jwt');
const { createAuditLog } = require('../utils/audit');
const { lockoutManager } = require('../middleware/rateLimiter');

// Helper: Find user by Email, Phone (10-digit or raw), or Aadhaar (12-digit or raw)
async function findUserByIdentifier(identifier, role = null) {
    if (!identifier) return null;
    const clean = String(identifier).trim();
    const cleanLower = clean.toLowerCase();
    const digits = clean.replace(/\D/g, '');
    const aadhar12 = digits.length === 12 ? digits : '';
    const phone10 = digits.length === 10 ? digits : (digits.length > 10 && digits.length !== 12 ? digits.slice(-10) : '');

    await connectMongo();
    const db = mongoose.connection.db;

    const orConditions = [];

    // Phone identifier (10 digits) - prioritized for mobile-first auth
    if (phone10) {
        orConditions.push({ phone: phone10 });
        orConditions.push({ phone: clean });
    }

    // Aadhaar identifier (12 digits)
    if (aadhar12) {
        orConditions.push({ aadhar: aadhar12 });
    }

    // Email identifier
    if (clean.includes('@')) {
        orConditions.push({ email: cleanLower });
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

    // If not found in users, check if a patient profile has this phone or aadhar
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

// 1. Patient Registration (Mobile Number + 6-Digit MPIN)
async function patientRegister(req, res, next) {
    try {
        const { fullName, phone, mpin, aadhar, email } = req.cleanBody;

        await connectMongo();
        const db = mongoose.connection.db;

        // Strict duplicate check on normalized 10-digit mobile number
        const existingPatient = await db.collection('users').findOne({
            phone: phone,
            role: 'PATIENT'
        });

        if (existingPatient) {
            return res.status(409).json({
                error: 'An account with this mobile number already exists. Please sign in with your MPIN.'
            });
        }

        const userId = `usr_pat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        // Securely hash 6-digit MPIN with bcrypt
        const hashedMpin = await hashPassword(mpin);
        const now = new Date().toISOString();
        const patientEmail = email || `patient_${phone}@medislot.local`;

        await run(`
            INSERT INTO users (id, email, phone, aadhar, passwordHash, role, status, fullName, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [userId, patientEmail, phone, aadhar || '', hashedMpin, 'PATIENT', 'ACTIVE', fullName, now, now]);

        // Also store explicit mpinHash in Mongo record
        await db.collection('users').updateOne(
            { id: userId },
            { $set: { mpinHash: hashedMpin } }
        ).catch(() => {});

        await run(`
            INSERT INTO patient_profiles (userId, fullName, phone, aadhar, updatedAt)
            VALUES (?, ?, ?, ?, ?)
        `, [userId, fullName, phone, aadhar || '', now]);

        const user = {
            id: userId,
            email: patientEmail,
            phone,
            aadhar: aadhar || '',
            fullName,
            role: 'PATIENT',
            status: 'ACTIVE'
        };

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

// 2. Patient Login (Mobile Number + 6-Digit MPIN with Brute-Force Lockout)
async function patientLogin(req, res, next) {
    try {
        const rawPhone = req.cleanBody.phone || req.cleanBody.identifier;
        const digits = String(rawPhone).replace(/\D/g, ''); const cleanPhone = digits.length === 12 ? digits : digits.slice(-10);
        const mpin = req.cleanBody.mpin || req.cleanBody.password;

        // Check if account is temporarily locked due to repeated failures
        const lockStatus = lockoutManager.isLocked(cleanPhone);
        if (lockStatus.locked) {
            return res.status(429).json({
                error: `Account temporarily locked due to 5 consecutive failed login attempts. Please try again after ${lockStatus.remainingMinutes} minute(s).`
            });
        }

        const user = await findUserByIdentifier(cleanPhone, 'PATIENT');
        if (!user) {
            lockoutManager.recordFailure(cleanPhone);
            return res.status(401).json({ error: 'Invalid mobile number or 6-digit MPIN.' });
        }

        // Compare against hashed MPIN or legacy password hash
        const match = await comparePassword(mpin, user.mpinHash || user.passwordHash);
        if (!match) {
            const count = lockoutManager.recordFailure(cleanPhone);
            if (count >= 5) {
                return res.status(429).json({
                    error: 'Account temporarily locked due to 5 consecutive failed login attempts. Please try again after 15 minutes.'
                });
            }
            return res.status(401).json({ error: 'Invalid mobile number or 6-digit MPIN.' });
        }

        if (user.status === 'SUSPENDED') {
            return res.status(403).json({ error: 'Account has been suspended. Please contact hospital administration.' });
        }

        // Reset lockout tracking on success
        lockoutManager.recordSuccess(cleanPhone);

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

// 2b. Patient Setup / Reset MPIN (Account Recovery & Migration Workflow)
async function resetMpin(req, res, next) {
    try {
        const { phone, newMpin, aadhar } = req.cleanBody;
        const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);

        const user = await findUserByIdentifier(cleanPhone, 'PATIENT');
        if (!user) {
            return res.status(404).json({ error: 'No registered patient account found with this mobile number.' });
        }

        // Optional Aadhaar verification check if linked
        if (aadhar && user.aadhar && user.aadhar !== aadhar) {
            return res.status(400).json({ error: 'Aadhaar number does not match account records.' });
        }

        const hashedMpin = await hashPassword(newMpin);
        const now = new Date().toISOString();

        await connectMongo();
        const db = mongoose.connection.db;
        await db.collection('users').updateOne(
            { id: user.id },
            { $set: { passwordHash: hashedMpin, mpinHash: hashedMpin, updatedAt: now } }
        );

        lockoutManager.recordSuccess(cleanPhone);

        res.json({
            message: '6-digit MPIN has been established successfully. You can now sign in with your mobile number and MPIN.'
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

        // Default consultation slots
        const defaultSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '01:00 PM'];

        await run(`
            INSERT INTO users (id, email, phone, passwordHash, role, status, fullName, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, 'DOCTOR', 'PENDING', ?, ?, ?)
        `, [userId, email, phone, passwordHash, fullName, now, now]);

        await run(`
            INSERT INTO doctor_profiles (
                userId, fullName, phone, specialization, qualifications, experienceYears,
                hospitalId, hospitalName, roomNo, consultationHours, languages,
                verificationStatus, todayAvailable, slotsJson, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Room 104', '9:00 AM - 1:00 PM', 'Telugu, English', 'PENDING', 1, ?, ?)
        `, [
            userId, fullName, phone, specialization, qualifications, experienceYears,
            hospitalId, hospitalName, JSON.stringify(defaultSlots), now
        ]);

        const user = {
            id: userId,
            email,
            phone,
            fullName,
            role: 'DOCTOR',
            status: 'PENDING',
            verificationStatus: 'PENDING'
        };

        res.status(201).json({
            message: 'Doctor application submitted successfully. Pending administrative verification.',
            verificationStatus: 'PENDING',
            user
        });
    } catch (err) {
        next(err);
    }
}

// 4. Doctor Login (Dedicated doctor entry)
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

// 8. Unified Login: automatically authenticates DOCTOR, PATIENT, or ADMIN
async function unifiedLogin(req, res, next) {
    try {
        const identifier = req.cleanBody.identifier || req.cleanBody.email;
        const password = req.cleanBody.password || req.cleanBody.mpin;

        // Check brute-force lockout for this identifier
        const lockStatus = lockoutManager.isLocked(identifier);
        if (lockStatus.locked) {
            return res.status(429).json({
                error: `Account temporarily locked due to repeated failed login attempts. Please try again after ${lockStatus.remainingMinutes} minute(s).`
            });
        }

        const user = await findUserByIdentifier(identifier);
        if (!user) {
            lockoutManager.recordFailure(identifier);
            return res.status(401).json({ error: 'Invalid credentials or unregistered account.' });
        }

        const match = await comparePassword(password, user.mpinHash || user.passwordHash);
        if (!match) {
            const count = lockoutManager.recordFailure(identifier);
            if (count >= 5) {
                return res.status(429).json({
                    error: 'Account temporarily locked due to 5 consecutive failed login attempts. Please try again after 15 minutes.'
                });
            }
            return res.status(401).json({ error: 'Invalid credentials or unregistered account.' });
        }

        if (user.status === 'SUSPENDED') {
            return res.status(403).json({ error: 'Account has been suspended. Please contact hospital administration.' });
        }

        lockoutManager.recordSuccess(identifier);

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
    resetMpin,
    doctorRegister,
    doctorLogin,
    adminLogin,
    unifiedLogin,
    logout,
    getCurrentUser
};
