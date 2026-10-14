const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const {
    MONGODB_URI,
    ADMIN_DEFAULT_EMAIL,
    ADMIN_DEFAULT_PASSWORD,
    ADMIN_DEFAULT_NAME,
    ADMIN_DEFAULT_PHONE
} = require('./env');

// ============================================================================
// 1. Mongoose Schemas & Models (MongoDB Atlas Enterprise Architecture)
// ============================================================================
const UserSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true, index: true },
    role: { type: String, required: true, enum: ['PATIENT', 'DOCTOR', 'ADMIN'], index: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    status: { type: String, required: true, default: 'ACTIVE', enum: ['ACTIVE', 'SUSPENDED', 'PENDING'] },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true }
}, { collection: 'users', timestamps: false, versionKey: false });

const PatientProfileSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    age: { type: Number, default: 0 },
    gender: { type: String, default: '' },
    abhaId: { type: String, default: '' },
    address: { type: String, default: '' },
    updatedAt: { type: String, required: true }
}, { collection: 'patient_profiles', timestamps: false, versionKey: false });

const DoctorProfileSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    specialization: { type: String, required: true, index: true },
    qualifications: { type: String, required: true },
    experienceYears: { type: Number, default: 0 },
    hospitalId: { type: String, required: true, index: true },
    hospitalName: { type: String, default: '' },
    roomNo: { type: String, default: '' },
    consultationHours: { type: String, default: '' },
    languages: { type: String, default: 'Telugu, English' },
    verificationStatus: { type: String, required: true, default: 'PENDING', enum: ['PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'], index: true },
    verifiedAt: { type: String, default: null },
    verifiedBy: { type: String, default: null },
    rejectionReason: { type: String, default: null },
    todayAvailable: { type: Number, default: 1, index: true },
    slotsJson: { type: String, default: '[]' },
    updatedAt: { type: String, required: true }
}, { collection: 'doctor_profiles', timestamps: false, versionKey: false });

const HospitalSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true, index: true },
    nameEn: { type: String, required: true },
    nameTe: { type: String, required: true },
    districtEn: { type: String, required: true },
    districtTe: { type: String, required: true },
    typeEn: { type: String, default: '' },
    typeTe: { type: String, default: '' },
    addressEn: { type: String, default: '' },
    addressTe: { type: String, default: '' },
    phone: { type: String, default: '' },
    emergencyPhone: { type: String, default: '' },
    totalBeds: { type: Number, default: 0 },
    availableBeds: { type: Number, default: 0 },
    icuBedsAvailable: { type: Number, default: 0 },
    oxygenBedsAvailable: { type: Number, default: 0 },
    opdTimingsEn: { type: String, default: '' },
    opdTimingsTe: { type: String, default: '' },
    bloodBankStatus: { type: String, default: '' },
    rating: { type: Number, default: 4.5 }
}, { collection: 'hospitals', timestamps: false, versionKey: false });

const DepartmentSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true, index: true },
    nameEn: { type: String, required: true },
    nameTe: { type: String, required: true },
    icon: { type: String, default: '🩺' },
    descriptionEn: { type: String, default: '' },
    descriptionTe: { type: String, default: '' },
    doctorCount: { type: Number, default: 0 }
}, { collection: 'departments', timestamps: false, versionKey: false });

const DoctorSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true, index: true },
    nameEn: { type: String, required: true },
    nameTe: { type: String, default: '' },
    qual: { type: String, default: '' },
    spec: { type: String, default: '', index: true },
    roleEn: { type: String, default: '' },
    roleTe: { type: String, default: '' },
    emoji: { type: String, default: '👨🏻‍⚕️' },
    hours: { type: String, default: '' },
    hospitalId: { type: String, required: true, index: true },
    roomNo: { type: String, default: '' },
    experienceYrs: { type: Number, default: 5 },
    languages: { type: String, default: 'Telugu, English' },
    slotsJson: { type: String, default: '[]' },
    todayAvailable: { type: Number, default: 1, index: true }
}, { collection: 'doctors', timestamps: false, versionKey: false, strict: false });

const AppointmentSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true, index: true },
    patientUserId: { type: String, default: null, index: true },
    doctorUserId: { type: String, default: null, index: true },
    tokenNumber: { type: Number, required: true, index: true },
    patientName: { type: String, required: true },
    patientPhone: { type: String, required: true, index: true },
    patientAge: { type: Number, default: 0 },
    patientGender: { type: String, default: '' },
    abhaId: { type: String, default: '' },
    doctorNameEn: { type: String, required: true, index: true },
    doctorNameTe: { type: String, default: '' },
    hospitalId: { type: String, required: true, index: true },
    hospitalNameEn: { type: String, default: '' },
    hospitalNameTe: { type: String, default: '' },
    department: { type: String, required: true, index: true },
    roomNo: { type: String, default: '' },
    appointmentDate: { type: String, required: true, index: true },
    slotTime: { type: String, required: true },
    reportingTime: { type: String, default: '' },
    status: { type: String, required: true, default: 'CONFIRMED', index: true },
    symptoms: { type: String, default: '' },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true }
}, { collection: 'appointments', timestamps: false, versionKey: false });

// Concurrency & Slot Integrity Indexes for Appointments
AppointmentSchema.index(
    { doctorNameEn: 1, appointmentDate: 1, slotTime: 1 },
    {
        unique: true,
        partialFilterExpression: {
            status: { $ne: 'CANCELLED' },
            slotTime: { $not: /^Walk-in/ }
        }
    }
);
AppointmentSchema.index({ doctorNameEn: 1, appointmentDate: 1, tokenNumber: 1 }, { unique: true });

const OpdQueueStateSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    doctorNameEn: { type: String, required: true, index: true },
    appointmentDate: { type: String, required: true, index: true },
    currentServingToken: { type: Number, default: 0 },
    lastCalledTime: { type: String, default: null },
    updatedAt: { type: String, required: true }
}, { collection: 'opd_queue_state', timestamps: false, versionKey: false });
OpdQueueStateSchema.index({ doctorNameEn: 1, appointmentDate: 1 }, { unique: true });

const GrievanceSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true, index: true },
    citizenName: { type: String, required: true },
    citizenPhone: { type: String, required: true },
    hospitalName: { type: String, default: '' },
    category: { type: String, default: 'Services' },
    message: { type: String, required: true },
    status: { type: String, default: 'SUBMITTED' },
    createdAt: { type: String, required: true }
}, { collection: 'grievances', timestamps: false, versionKey: false });

const AuditLogSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true, index: true },
    actorUserId: { type: String, default: null },
    actorRole: { type: String, default: null },
    action: { type: String, required: true },
    resource: { type: String, default: null },
    resourceId: { type: String, default: null },
    details: { type: String, default: null },
    ipAddress: { type: String, default: null },
    createdAt: { type: String, required: true, index: true }
}, { collection: 'audit_logs', timestamps: false, versionKey: false });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const PatientProfile = mongoose.models.PatientProfile || mongoose.model('PatientProfile', PatientProfileSchema);
const DoctorProfile = mongoose.models.DoctorProfile || mongoose.model('DoctorProfile', DoctorProfileSchema);
const Hospital = mongoose.models.Hospital || mongoose.model('Hospital', HospitalSchema);
const Department = mongoose.models.Department || mongoose.model('Department', DepartmentSchema);
const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', DoctorSchema);
const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);
const OpdQueueState = mongoose.models.OpdQueueState || mongoose.model('OpdQueueState', OpdQueueStateSchema);
const Grievance = mongoose.models.Grievance || mongoose.model('Grievance', GrievanceSchema);
const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);

// ============================================================================
// 2. Database Lifecycle & Connection Pool
// ============================================================================
let isConnected = false;

async function connectMongo() {
    if (isConnected && mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    const connStr = MONGODB_URI || 'mongodb+srv://varunvr116_db_user:2ALVP6miXK0b2ziP@cluster0.d9zx0hv.mongodb.net/medislot?retryWrites=true&w=majority&appName=Cluster0';
    console.log('[MongoDB Atlas] Establishing secure connection to cloud cluster...');
    
    await mongoose.connect(connStr, {
        serverSelectionTimeoutMS: 15000,
        autoIndex: true
    });
    
    isConnected = true;
    console.log(`[MongoDB Atlas] Connected successfully to database: "${mongoose.connection.name}"`);
    return mongoose.connection;
}

async function closeDatabase() {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
        isConnected = false;
        console.log('[MongoDB Atlas] Connection disconnected cleanly.');
    }
}

function getDb() {
    return mongoose.connection.db;
}

// ============================================================================
// 3. Transactions & Concurrency Wrapper
// ============================================================================
async function withTransaction(fn) {
    await connectMongo();
    let session = null;
    try {
        session = await mongoose.startSession();
        let result;
        await session.withTransaction(async () => {
            result = await fn({ session });
        });
        return result;
    } catch (err) {
        // Fallback for non-replica or standalone environments
        if (err.message && (err.message.includes('Transaction') || err.message.includes('replica set'))) {
            return await fn();
        }
        throw err;
    } finally {
        if (session) {
            await session.endSession().catch(() => {});
        }
    }
}

// ============================================================================
// 4. SQL-to-MongoDB Query Translation Helpers
// ============================================================================
function escapeRegExp(string) {
    return String(string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeDoc(rawDoc) {
    if (!rawDoc) return null;
    const doc = { ...rawDoc };
    delete doc._id;
    return doc;
}

function parseSqlValues(valuesStr, params) {
    const tokens = [];
    let current = '';
    let inQuote = false;
    let quoteChar = '';
    let isString = false;
    let pIdx = 0;

    for (let i = 0; i < valuesStr.length; i++) {
        const char = valuesStr[i];
        if (inQuote) {
            if (char === quoteChar) {
                if (i + 1 < valuesStr.length && valuesStr[i + 1] === quoteChar) {
                    current += quoteChar;
                    i++;
                } else {
                    inQuote = false;
                }
            } else {
                current += char;
            }
        } else {
            if (char === "'" || char === '"') {
                inQuote = true;
                quoteChar = char;
                isString = true;
            } else if (char === ',') {
                tokens.push(evalToken(current.trim(), isString, params, pIdx));
                if (!isString && current.trim() === '?') {
                    pIdx++;
                }
                current = '';
                isString = false;
            } else {
                current += char;
            }
        }
    }
    if (current.length > 0 || isString) {
        tokens.push(evalToken(current.trim(), isString, params, pIdx));
    }
    return tokens;
}

function evalToken(token, isString, params, pIdx) {
    if (isString) {
        return token;
    }
    if (token === '?') {
        return params[pIdx] !== undefined ? params[pIdx] : null;
    }
    if (/^NULL$/i.test(token)) {
        return null;
    }
    if (/^TRUE$/i.test(token)) {
        return 1;
    }
    if (/^FALSE$/i.test(token)) {
        return 0;
    }
    if (/^[-+]?\d+$/.test(token)) {
        return parseInt(token, 10);
    }
    if (/^[-+]?\d*\.\d+$/.test(token)) {
        return parseFloat(token);
    }
    return token;
}

function splitAssignments(clause) {
    const assignments = [];
    let current = '';
    let inQuote = false;
    let quoteChar = '';

    for (let i = 0; i < clause.length; i++) {
        const char = clause[i];
        if (inQuote) {
            if (char === quoteChar) {
                if (i + 1 < clause.length && clause[i + 1] === quoteChar) {
                    current += quoteChar;
                    i++;
                } else {
                    inQuote = false;
                }
            } else {
                current += char;
            }
        } else {
            if (char === "'" || char === '"') {
                inQuote = true;
                quoteChar = char;
            } else if (char === ',') {
                assignments.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
    }
    if (current.trim().length > 0) {
        assignments.push(current.trim());
    }
    return assignments;
}

function buildMongoFilter(whereClause, params = []) {
    const filter = {};
    if (!whereClause) return filter;

    let pIdx = 0;
    const cleanClause = whereClause.trim();

    // Specific combined OR: patientUserId = ? OR patientPhone = ?
    if (/patientUserId\s*=\s*\?\s+OR\s+patientPhone\s*=\s*\?/i.test(cleanClause)) {
        const uid = params[pIdx++];
        const ph = params[pIdx++];
        filter.$or = [{ patientUserId: uid }, { patientPhone: ph }];
    }

    // Split by AND
    const tokens = cleanClause.split(/\s+AND\s+/i);
    for (let token of tokens) {
        token = token.trim();
        if (!token || token === '1=1' || /patientUserId\s*=\s*\?\s+OR/i.test(token)) continue;

        // LIKE search with $or: (nameEn LIKE ? OR nameTe LIKE ? ...)
        if (token.includes('LIKE') && token.includes('OR')) {
            const searchVal = String(params[pIdx] || '').replace(/%/g, '');
            const likeMatches = token.match(/LIKE\s*\?/gi);
            if (likeMatches) {
                pIdx += likeMatches.length;
            }
            if (searchVal) {
                const rx = new RegExp(escapeRegExp(searchVal), 'i');
                filter.$or = [
                    { nameEn: rx },
                    { nameTe: rx },
                    { roleEn: rx },
                    { roleTe: rx },
                    { spec: rx }
                ];
            }
            continue;
        }

        // UPPER(id) = UPPER(?) or id = ?
        if (/UPPER\s*\(\s*id\s*\)\s*=\s*UPPER\s*\(\s*\?\s*\)/i.test(token)) {
            const val = params[pIdx++];
            if (val !== undefined) {
                filter.id = new RegExp('^' + escapeRegExp(String(val).trim()) + '$', 'i');
            }
            continue;
        }

        // UPPER(id) != UPPER(?) or id != ?
        if (/UPPER\s*\(\s*id\s*\)\s*!=\s*UPPER\s*\(\s*\?\s*\)/i.test(token)) {
            const val = params[pIdx++];
            if (val !== undefined) {
                filter.id = { ...(filter.id || {}), $ne: String(val).trim() };
            }
            continue;
        }

        // col IN (...)
        const inMatch = token.match(/^([a-zA-Z0-9_]+)\s+IN\s*\(([^)]+)\)$/i);
        if (inMatch) {
            const col = inMatch[1];
            const items = inMatch[2].split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
            filter[col] = { $in: items };
            continue;
        }

        // col != 'STATIC'
        const neqStatic = token.match(/^([a-zA-Z0-9_]+)\s*!=\s*['"]([^'"]+)['"]$/i);
        if (neqStatic) {
            filter[neqStatic[1]] = { $ne: neqStatic[2] };
            continue;
        }

        // col != ?
        const neqParam = token.match(/^([a-zA-Z0-9_]+)\s*!=\s*\?$/i);
        if (neqParam) {
            filter[neqParam[1]] = { $ne: params[pIdx++] };
            continue;
        }

        // col >= ?
        const gteMatch = token.match(/^([a-zA-Z0-9_]+)\s*>=\s*\?$/i);
        if (gteMatch) {
            filter[gteMatch[1]] = { $gte: Number(params[pIdx++]) };
            continue;
        }

        // col > ?
        const gtMatch = token.match(/^([a-zA-Z0-9_]+)\s*>\s*\?$/i);
        if (gtMatch) {
            filter[gtMatch[1]] = { $gt: Number(params[pIdx++]) };
            continue;
        }

        // col <= ?
        const lteMatch = token.match(/^([a-zA-Z0-9_]+)\s*<=\s*\?$/i);
        if (lteMatch) {
            filter[lteMatch[1]] = { $lte: Number(params[pIdx++]) };
            continue;
        }

        // col < ?
        const ltMatch = token.match(/^([a-zA-Z0-9_]+)\s*<\s*\?$/i);
        if (ltMatch) {
            filter[ltMatch[1]] = { $lt: Number(params[pIdx++]) };
            continue;
        }

        // col = ?
        const eqMatch = token.match(/^([a-zA-Z0-9_]+)\s*=\s*\?$/i);
        if (eqMatch) {
            filter[eqMatch[1]] = params[pIdx++];
            continue;
        }

        // col = 'STATIC'
        const staticEq = token.match(/^([a-zA-Z0-9_]+)\s*=\s*['"]([^'"]+)['"]$/i);
        if (staticEq) {
            filter[staticEq[1]] = staticEq[2];
            continue;
        }

        // col = 1 or 0
        const staticNum = token.match(/^([a-zA-Z0-9_]+)\s*=\s*(\d+)$/i);
        if (staticNum) {
            filter[staticNum[1]] = Number(staticNum[2]);
            continue;
        }
    }

    return filter;
}

// ============================================================================
// 5. Query Execution Core: run, all, get
// ============================================================================
async function run(sql, params = []) {
    await connectMongo();
    const db = mongoose.connection.db;
    const trimmed = sql.trim();

    // 1. INSERT INTO
    if (/^INSERT\s+INTO/i.test(trimmed)) {
        const tableMatch = trimmed.match(/INSERT\s+INTO\s+([a-zA-Z0-9_]+)/i);
        const colsMatch = trimmed.match(/INSERT\s+INTO\s+[a-zA-Z0-9_]+\s*\(([^)]+)\)/i);
        const valuesMatch = trimmed.match(/VALUES\s*\(([\s\S]+?)\)(?:\s+ON\s+CONFLICT|$)/i);
        if (!tableMatch || !colsMatch) return { changes: 0 };

        const tableName = tableMatch[1].toLowerCase();
        const cols = colsMatch[1].split(',').map(c => c.trim().replace(/[`"']/g, ''));
        
        let vals = [];
        if (valuesMatch) {
            vals = parseSqlValues(valuesMatch[1], params);
        } else {
            vals = params;
        }

        const doc = {};
        cols.forEach((col, idx) => {
            doc[col] = vals[idx] !== undefined ? vals[idx] : null;
        });

        const collection = db.collection(tableName);

        // Conflict handling & entity upserts
        if (tableName === 'patient_profiles' && doc.userId) {
            await collection.updateOne({ userId: doc.userId }, { $set: doc }, { upsert: true });
            return { changes: 1, lastID: doc.userId };
        }

        if (tableName === 'doctor_profiles' && doc.userId) {
            await collection.updateOne({ userId: doc.userId }, { $set: doc }, { upsert: true });
            return { changes: 1, lastID: doc.userId };
        }

        if (tableName === 'opd_queue_state') {
            doc.id = doc.id || `queue_${String(doc.doctorNameEn).replace(/\s+/g, '_')}_${doc.appointmentDate}`;
            await collection.updateOne(
                { doctorNameEn: doc.doctorNameEn, appointmentDate: doc.appointmentDate },
                { $set: doc },
                { upsert: true }
            );
            return { changes: 1, lastID: doc.id };
        }

        if (tableName === 'hospitals' && doc.id) {
            await collection.updateOne({ id: doc.id }, { $set: doc }, { upsert: true });
            return { changes: 1, lastID: doc.id };
        }

        if (tableName === 'departments' && doc.key) {
            await collection.updateOne({ key: doc.key }, { $set: doc }, { upsert: true });
            return { changes: 1, lastID: doc.key };
        }

        if (tableName === 'doctors') {
            doc.id = doc.id || ('doc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6));
            if (doc.nameEn) {
                await collection.updateOne({ nameEn: doc.nameEn }, { $set: doc }, { upsert: true });
                return { changes: 1, lastID: doc.id };
            }
        }

        // Concurrency duplicate check for appointments
        if (tableName === 'appointments') {
            if (doc.tokenNumber !== undefined && doc.tokenNumber !== null) {
                doc.tokenNumber = Number(doc.tokenNumber);
            }
            if (doc.status !== 'CANCELLED' && doc.slotTime && !String(doc.slotTime).startsWith('Walk-in')) {
                const existing = await collection.findOne({
                    doctorNameEn: doc.doctorNameEn,
                    appointmentDate: doc.appointmentDate,
                    slotTime: doc.slotTime,
                    status: { $ne: 'CANCELLED' }
                });
                if (existing) {
                    const err = new Error('This time slot was just reserved by another patient. Please choose an alternative slot.');
                    err.statusCode = 409;
                    throw err;
                }
            }
            if (doc.tokenNumber) {
                const tokenDup = await collection.findOne({
                    doctorNameEn: doc.doctorNameEn,
                    appointmentDate: doc.appointmentDate,
                    tokenNumber: doc.tokenNumber
                });
                if (tokenDup) {
                    const err = new Error(`Token #${doc.tokenNumber} is already allocated for this session.`);
                    err.statusCode = 409;
                    throw err;
                }
            }
            await collection.updateOne({ id: doc.id }, { $set: doc }, { upsert: true });
            return { changes: 1, lastID: doc.id };
        }

        // Unique email & ID handling for users
        if (tableName === 'users') {
            if (doc.email) {
                doc.email = doc.email.toLowerCase().trim();
            }
            if (doc.id) {
                const existingById = await collection.findOne({ id: doc.id });
                if (existingById) {
                    await collection.updateOne({ id: doc.id }, { $set: doc });
                    return { changes: 1, lastID: doc.id };
                }
            }
            if (doc.email) {
                const existingUser = await collection.findOne({ email: doc.email });
                if (existingUser) {
                    if (doc.id && existingUser.id === doc.id) {
                        await collection.updateOne({ id: doc.id }, { $set: doc });
                        return { changes: 1, lastID: doc.id };
                    }
                    const err = new Error('An account with this email address already exists. Please sign in instead.');
                    err.statusCode = 409;
                    throw err;
                }
            }
            const res = await collection.insertOne(doc);
            return { changes: 1, lastID: doc.id || res.insertedId };
        }

        // General entity upsert / insert (e.g., grievances, audit_logs)
        if (doc.id) {
            await collection.updateOne({ id: doc.id }, { $set: doc }, { upsert: true });
            return { changes: 1, lastID: doc.id };
        }
        const res = await collection.insertOne(doc);
        return { changes: 1, lastID: res.insertedId };
    }

    // 2. UPDATE
    if (/^UPDATE\s+/i.test(trimmed)) {
        const tableMatch = trimmed.match(/UPDATE\s+([a-zA-Z0-9_]+)/i);
        if (!tableMatch) return { changes: 0 };
        const tableName = tableMatch[1].toLowerCase();
        const collection = db.collection(tableName);

        const setMatch = trimmed.match(/SET\s+([\s\S]+?)\s+WHERE\s+([\s\S]+)$/i);
        if (!setMatch) return { changes: 0 };

        const setClause = setMatch[1];
        const whereClause = setMatch[2];

        const assignments = splitAssignments(setClause);
        const updateFields = {};
        let paramIdx = 0;

        for (const pair of assignments) {
            const eqIdx = pair.indexOf('=');
            if (eqIdx === -1) continue;
            const k = pair.slice(0, eqIdx).trim().replace(/[`"']/g, '');
            const rawVal = pair.slice(eqIdx + 1).trim();
            if (rawVal === '?') {
                updateFields[k] = params[paramIdx++];
            } else if (/^['"][\s\S]*['"]$/.test(rawVal)) {
                updateFields[k] = rawVal.slice(1, -1);
            } else if (/^[-+]?\d+$/.test(rawVal)) {
                updateFields[k] = parseInt(rawVal, 10);
            } else if (/^NULL$/i.test(rawVal)) {
                updateFields[k] = null;
            } else {
                updateFields[k] = rawVal;
            }
        }

        const filter = buildMongoFilter(whereClause, params.slice(paramIdx));
        const res = await collection.updateMany(filter, { $set: updateFields });
        return { changes: res.modifiedCount || res.matchedCount };
    }

    // 3. DELETE
    if (/^DELETE\s+FROM/i.test(trimmed)) {
        const tableMatch = trimmed.match(/DELETE\s+FROM\s+([a-zA-Z0-9_]+)/i);
        if (!tableMatch) return { changes: 0 };
        const tableName = tableMatch[1].toLowerCase();
        const collection = db.collection(tableName);

        const whereMatch = trimmed.match(/WHERE\s+([\s\S]+)$/i);
        const filter = whereMatch ? buildMongoFilter(whereMatch[1], params) : {};
        const res = await collection.deleteMany(filter);
        return { changes: res.deletedCount };
    }

    return { changes: 0 };
}

async function all(sql, params = []) {
    await connectMongo();
    const db = mongoose.connection.db;
    const trimmed = sql.trim();

    // A. Joins in Admin Portal: doctor_profiles dp JOIN users u ON dp.userId = u.id
    if (/FROM\s+doctor_profiles\s+dp\s+JOIN\s+users\s+u\s+ON\s+dp\.userId\s*=\s*u\.id/i.test(trimmed)) {
        const dpCol = db.collection('doctor_profiles');
        const uCol = db.collection('users');

        let dpDocs = await dpCol.find({}).toArray();
        let uDocs = await uCol.find({}).toArray();
        const userMap = new Map(uDocs.map(u => [u.id, u]));

        let merged = dpDocs.map(dp => {
            const u = userMap.get(dp.userId) || {};
            return {
                ...dp,
                verificationStatus: dp.verificationStatus || 'PENDING',
                email: u.email || '',
                userStatus: u.status || 'ACTIVE',
                registeredAt: u.createdAt || dp.updatedAt
            };
        });

        // Filter verification status: static or parameterized
        let pIdx = 0;
        const staticStMatch = trimmed.match(/dp\.verificationStatus\s*=\s*['"]([^'"]+)['"]/i);
        if (staticStMatch) {
            merged = merged.filter(m => m.verificationStatus === staticStMatch[1]);
        } else if (/dp\.verificationStatus\s*=\s*\?/i.test(trimmed)) {
            const st = params[pIdx++];
            merged = merged.filter(m => m.verificationStatus === st);
        }

        // Filter search keyword
        if (/dp\.fullName\s+LIKE/i.test(trimmed)) {
            const s = String(params[pIdx++] || '').replace(/%/g, '').toLowerCase();
            pIdx += 2; // skip email, spec
            if (s) {
                merged = merged.filter(m =>
                    (m.fullName && m.fullName.toLowerCase().includes(s)) ||
                    (m.email && m.email.toLowerCase().includes(s)) ||
                    (m.specialization && m.specialization.toLowerCase().includes(s))
                );
            }
        }

        if (/dp\.fullName\s+ASC/i.test(trimmed)) {
            merged.sort((a, b) => String(a.fullName || '').localeCompare(String(b.fullName || '')));
        } else {
            merged.sort((a, b) => String(b.registeredAt || '').localeCompare(String(a.registeredAt || '')));
        }

        return merged.map(normalizeDoc);
    }

    // B. Grievances in Admin Portal
    if (/FROM\s+grievances/i.test(trimmed) && !/COUNT|MAX|SUM/i.test(trimmed)) {
        const grvCol = db.collection('grievances');
        let docs = await grvCol.find({}).toArray();

        // Check if there is status filter
        const statusMatch = trimmed.match(/status\s*=\s*\?/i);
        let pIdx = 0;
        if (statusMatch) {
            const st = params[pIdx++];
            docs = docs.filter(d => (d.status || '').toUpperCase() === String(st).toUpperCase());
        }

        // Check if there is category filter
        const catMatch = trimmed.match(/category\s*=\s*\?/i);
        if (catMatch) {
            const cat = params[pIdx++];
            docs = docs.filter(d => (d.category || '').toLowerCase() === String(cat).toLowerCase());
        }

        // Check if there is search keyword
        if (/citizenName\s+LIKE/i.test(trimmed) || /message\s+LIKE/i.test(trimmed) || /id\s+LIKE/i.test(trimmed)) {
            const s = String(params[pIdx++] || '').replace(/%/g, '').toLowerCase();
            if (s) {
                docs = docs.filter(d =>
                    (d.id && d.id.toLowerCase().includes(s)) ||
                    (d.citizenName && d.citizenName.toLowerCase().includes(s)) ||
                    (d.citizenPhone && d.citizenPhone.includes(s)) ||
                    (d.hospitalName && d.hospitalName.toLowerCase().includes(s)) ||
                    (d.category && d.category.toLowerCase().includes(s)) ||
                    (d.message && d.message.toLowerCase().includes(s))
                );
            }
        }

        docs.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));

        const limitMatch = trimmed.match(/LIMIT\s+(\d+)/i);
        if (limitMatch) {
            docs = docs.slice(0, parseInt(limitMatch[1], 10));
        }

        return docs.map(normalizeDoc);
    }

    // C. Joins in Admin Portal: users u LEFT JOIN patient_profiles pp ON u.id = pp.userId
    if (/FROM\s+users\s+u\s+LEFT\s+JOIN\s+patient_profiles\s+pp/i.test(trimmed)) {
        const uCol = db.collection('users');
        const ppCol = db.collection('patient_profiles');
        const apptCol = db.collection('appointments');

        let users = await uCol.find({ role: 'PATIENT' }).toArray();
        let profiles = await ppCol.find({}).toArray();
        let appts = await apptCol.find({}).toArray();

        const profMap = new Map(profiles.map(p => [p.userId, p]));
        const apptCountMap = new Map();
        appts.forEach(a => {
            const uid = a.patientUserId;
            if (uid) apptCountMap.set(uid, (apptCountMap.get(uid) || 0) + 1);
        });

        let merged = users.map(u => {
            const pp = profMap.get(u.id) || {};
            return {
                ...u,
                ...pp,
                id: u.id,
                appointmentCount: apptCountMap.get(u.id) || 0
            };
        });

        if (/LIKE/i.test(trimmed) && params.length > 0) {
            const s = String(params[0] || '').replace(/%/g, '').toLowerCase();
            if (s) {
                merged = merged.filter(m =>
                    (m.fullName && m.fullName.toLowerCase().includes(s)) ||
                    (m.email && m.email.toLowerCase().includes(s)) ||
                    (m.phone && m.phone.includes(s))
                );
            }
        }

        merged.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
        return merged.map(normalizeDoc);
    }

    // C. Single Table SELECTs
    const tableMatch = trimmed.match(/FROM\s+([a-zA-Z0-9_]+)/i);
    if (!tableMatch) return [];
    const tableName = tableMatch[1].toLowerCase();
    const collection = db.collection(tableName);

    // DISTINCT slotTime
    if (/SELECT\s+DISTINCT\s+slotTime/i.test(trimmed)) {
        const whereMatch = trimmed.match(/WHERE\s+([\s\S]+)$/i);
        const filter = whereMatch ? buildMongoFilter(whereMatch[1], params) : {};
        if (filter.status === undefined) filter.status = { $ne: 'CANCELLED' };
        const distinct = await collection.distinct('slotTime', filter);
        return distinct.map(s => ({ slotTime: s }));
    }

    // Aggregations: COUNT, MAX, SUM
    if (/SELECT\s+(COUNT|MAX|SUM)/i.test(trimmed)) {
        let whereClause = '';
        const whereMatch = trimmed.match(/WHERE\s+([\s\S]+?)(?:\s+ORDER\s+BY|\s+GROUP\s+BY|\s+LIMIT|$)/i);
        if (whereMatch) {
            whereClause = whereMatch[1];
        }

        const filter = buildMongoFilter(whereClause, params);
        const docs = await collection.find(filter).toArray();

        // 1. SELECT MAX(tokenNumber)
        if (/MAX\(tokenNumber\)/i.test(trimmed)) {
            let maxToken = 0;
            docs.forEach(a => {
                const num = Number(a.tokenNumber);
                if (!isNaN(num) && num > maxToken) maxToken = num;
            });
            return [{ maxToken, max: maxToken }];
        }

        // 2. Appointments stats
        if (tableName === 'appointments') {
            const total = docs.length;
            const completed = docs.filter(a => a.status === 'COMPLETED').length;
            const confirmed = docs.filter(a => a.status === 'CONFIRMED').length;
            const cancelled = docs.filter(a => a.status === 'CANCELLED').length;
            const called = docs.filter(a => a.status === 'CALLED').length;
            const skipped = docs.filter(a => a.status === 'SKIPPED').length;
            const waiting = docs.filter(a => ['CONFIRMED', 'CALLED', 'IN_CONSULTATION'].includes(a.status)).length;
            let todayTotal = total;
            if (params.length > 0 && typeof params[0] === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(params[0])) {
                todayTotal = docs.filter(a => a.appointmentDate === params[0]).length;
            }
            return [{
                total,
                count: total,
                cnt: total,
                todayTotal,
                completed,
                confirmed,
                cancelled,
                called,
                skipped,
                waiting
            }];
        }

        // 3. Hospital beds and counts
        if (tableName === 'hospitals') {
            const count = docs.length;
            let totalBeds = 0, icuBeds = 0, oxygenBeds = 0;
            docs.forEach(h => {
                totalBeds += Number(h.availableBeds || h.totalBeds || 0);
                icuBeds += Number(h.icuBedsAvailable || 0);
                oxygenBeds += Number(h.oxygenBedsAvailable || 0);
            });
            return [{
                cnt: count,
                count: count,
                total: count,
                totalHospitals: count,
                totalBeds,
                beds: totalBeds,
                icuBeds,
                icu: icuBeds,
                oxygenBeds
            }];
        }

        // 4. Doctor profiles count
        if (tableName === 'doctor_profiles') {
            const total = docs.length;
            const verified = docs.filter(d => d.verificationStatus === 'VERIFIED').length;
            const pending = docs.filter(d => d.verificationStatus === 'PENDING').length;
            const suspended = docs.filter(d => d.verificationStatus === 'SUSPENDED').length;
            return [{
                cnt: total,
                count: total,
                total,
                verified,
                pending,
                suspended
            }];
        }

        // Grievances count & breakdown
        if (tableName === 'grievances') {
            const total = docs.length;
            const submitted = docs.filter(g => (g.status || '').toUpperCase() === 'SUBMITTED').length;
            const inReview = docs.filter(g => (g.status || '').toUpperCase() === 'IN_REVIEW').length;
            const resolved = docs.filter(g => (g.status || '').toUpperCase() === 'RESOLVED').length;
            const rejected = docs.filter(g => (g.status || '').toUpperCase() === 'REJECTED').length;
            return [{
                total,
                count: total,
                cnt: total,
                submitted,
                inReview,
                resolved,
                rejected
            }];
        }

        // 5. Default generic count
        const count = docs.length;
        return [{
            cnt: count,
            count: count,
            total: count
        }];
    }

    // Regular SELECT
    let whereClause = '';
    const whereMatch = trimmed.match(/WHERE\s+([\s\S]+?)(?:\s+ORDER\s+BY|\s+LIMIT|$)/i);
    if (whereMatch) {
        whereClause = whereMatch[1];
    }

    const filter = buildMongoFilter(whereClause, params);

    let query = collection.find(filter);

    // Sorting
    if (/ORDER\s+BY\s+totalBeds\s+DESC/i.test(trimmed)) {
        query = query.sort({ totalBeds: -1 });
    } else if (/ORDER\s+BY\s+createdAt\s+DESC/i.test(trimmed)) {
        query = query.sort({ createdAt: -1 });
    } else if (/ORDER\s+BY\s+appointmentDate\s+DESC/i.test(trimmed)) {
        query = query.sort({ appointmentDate: -1, tokenNumber: 1 });
    } else if (/ORDER\s+BY\s+tokenNumber\s+ASC/i.test(trimmed)) {
        query = query.sort({ tokenNumber: 1 });
    } else if (/ORDER\s+BY\s+nameEn\s+ASC/i.test(trimmed)) {
        query = query.sort({ nameEn: 1 });
    }

    // LIMIT
    const limitMatch = trimmed.match(/LIMIT\s+(\d+|\?)/i);
    if (limitMatch) {
        let limitVal = limitMatch[1] === '?' ? params[params.length - 1] : parseInt(limitMatch[1], 10);
        if (!isNaN(limitVal)) {
            query = query.limit(Number(limitVal));
        }
    }

    const results = await query.toArray();
    return results.map(normalizeDoc);
}

async function get(sql, params = []) {
    const rows = await all(sql, params);
    return rows && rows.length > 0 ? rows[0] : undefined;
}

// ============================================================================
// 6. Database Initialization & Cloud Seeding
// ============================================================================
async function initDatabase() {
    await connectMongo();
    const db = mongoose.connection.db;

    console.log('[MongoDB Atlas] Ensuring collection indexes...');
    await db.collection('users').createIndex({ email: 1 }, { unique: true }).catch(() => {});
    await db.collection('users').createIndex({ id: 1 }, { unique: true }).catch(() => {});
    await db.collection('appointments').createIndex({ id: 1 }, { unique: true }).catch(() => {});
    await db.collection('appointments').createIndex(
        { doctorNameEn: 1, appointmentDate: 1, slotTime: 1 },
        {
            unique: true,
            partialFilterExpression: {
                status: { $ne: 'CANCELLED' },
                slotTime: { $not: /^Walk-in/ }
            }
        }
    ).catch(() => {});
    await db.collection('appointments').createIndex(
        { doctorNameEn: 1, appointmentDate: 1, tokenNumber: 1 },
        { unique: true }
    ).catch(() => {});
    await db.collection('doctor_profiles').createIndex({ userId: 1 }, { unique: true }).catch(() => {});
    await db.collection('patient_profiles').createIndex({ userId: 1 }, { unique: true }).catch(() => {});
    await db.collection('opd_queue_state').createIndex({ doctorNameEn: 1, appointmentDate: 1 }, { unique: true }).catch(() => {});
    await db.collection('audit_logs').createIndex({ createdAt: -1 }).catch(() => {});

    // Seed authentic healthcare domain data
    await seedHospitalAndDepartmentData();
    await seedPublicDoctors();
    await bootstrapAdmin();
    await seedVerifiedDoctorAccounts();
    await seedDefaultPatientAccount();
    await seedDefaultGrievances();

    console.log('[MongoDB Atlas] Initialization and indexes completed successfully.');
}

async function seedHospitalAndDepartmentData() {
    const hospCount = await get('SELECT COUNT(*) as cnt FROM hospitals');
    if (!hospCount || hospCount.cnt === 0) {
        console.log('[MongoDB Atlas] Seeding authentic AP hospitals...');
        const hospitals = [
            {
                id: 'GH_BHIMAVARAM',
                nameEn: 'Government District Hospital, Bhimavaram',
                nameTe: 'ప్రభుత్వ జిల్లా ఆసుపత్రి, భీమవరం',
                districtEn: 'West Godavari',
                districtTe: 'పశ్చిమ గోదావరి',
                typeEn: 'District Headquarter Hospital (150 Beds)',
                typeTe: 'జిల్లా కేంద్రాసుపత్రి (150 పడకలు)',
                addressEn: 'Near Someswara Temple, Hospital Road, Bhimavaram - 534201',
                addressTe: 'సోమేశ్వరాలయం దగ్గర, హాస్పిటల్ రోడ్, భీమవరం - 534201',
                phone: '08816-223456',
                emergencyPhone: '08816-223400 / 108',
                totalBeds: 150,
                availableBeds: 42,
                icuBedsAvailable: 8,
                oxygenBedsAvailable: 24,
                opdTimingsEn: 'Mon - Sat: 8:00 AM – 4:00 PM (Emergency 24x7)',
                opdTimingsTe: 'సోమ - శని: ఉదయం 8:00 – సాయంత్రం 4:00 (అత్యవసరం 24x7)',
                bloodBankStatus: 'Available (A+, B+, O+, AB+ stocked)',
                rating: 4.6
            },
            {
                id: 'AH_PALAKOLLU',
                nameEn: 'Area Hospital, Palakollu',
                nameTe: 'ఏరియా ఆసుపత్రి, పాలకొల్లు',
                districtEn: 'West Godavari',
                districtTe: 'పశ్చిమ గోదావరి',
                typeEn: 'Community Area Hospital (100 Beds)',
                typeTe: 'కమ్యూనిటీ ఏరియా ఆసుపత్రి (100 పడకలు)',
                addressEn: 'Main Road, Near Bus Stand, Palakollu - 534260',
                addressTe: 'మెయిన్ రోడ్, బస్టాండ్ దగ్గర, పాలకొల్లు - 534260',
                phone: '08814-222301',
                emergencyPhone: '08814-222300 / 108',
                totalBeds: 100,
                availableBeds: 28,
                icuBedsAvailable: 4,
                oxygenBedsAvailable: 16,
                opdTimingsEn: 'Mon - Sat: 8:30 AM – 3:30 PM (Emergency 24x7)',
                opdTimingsTe: 'సోమ - శని: ఉదయం 8:30 – మధ్యాహ్నం 3:30 (అత్యవసరం 24x7)',
                bloodBankStatus: 'Available (Storage Center Connected)',
                rating: 4.4
            },
            {
                id: 'GGH_ELURU',
                nameEn: 'Government General Hospital (GGH), Eluru',
                nameTe: 'ప్రభుత్వ సర్వజన ఆసుపత్రి (GGH), ఏలూరు',
                districtEn: 'Eluru',
                districtTe: 'ఏలూరు',
                typeEn: 'Teaching General Hospital (500 Beds)',
                typeTe: 'బోధనా సర్వజన ఆసుపత్రి (500 పడకలు)',
                addressEn: 'Old Bus Stand Road, Sanivarapupeta, Eluru - 534005',
                addressTe: 'ఓల్డ్ బస్టాండ్ రోడ్, శనివారపుపేట, ఏలూరు - 534005',
                phone: '08812-230125',
                emergencyPhone: '08812-230111 / 108',
                totalBeds: 500,
                availableBeds: 112,
                icuBedsAvailable: 22,
                oxygenBedsAvailable: 68,
                opdTimingsEn: 'Mon - Sat: 8:00 AM – 4:00 PM (Super Specialty)',
                opdTimingsTe: 'సోమ - శని: ఉదయం 8:00 – సాయంత్రం 4:00 (సూపర్ స్పెషాలిటీ)',
                bloodBankStatus: 'Full Component Blood Bank (24/7)',
                rating: 4.7
            },
            {
                id: 'GGH_KAKINADA',
                nameEn: 'Rangaraya Government General Hospital, Kakinada',
                nameTe: 'రంగరాయ ప్రభుత్వ సర్వజన ఆసుపత్రి, కాకినాడ',
                districtEn: 'Kakinada',
                districtTe: 'కాకినాడ',
                typeEn: 'Tertiary Care Super Specialty Hospital (1000 Beds)',
                typeTe: 'సూపర్ స్పెషాలిటీ రిఫరల్ ఆసుపత్రి (1000 పడకలు)',
                addressEn: 'Pithapuram Road, Kakinada - 533001',
                addressTe: 'పిఠాపురం రోడ్, కాకినాడ - 533001',
                phone: '0884-2376156',
                emergencyPhone: '0884-2376108 / 108',
                totalBeds: 1000,
                availableBeds: 215,
                icuBedsAvailable: 45,
                oxygenBedsAvailable: 130,
                opdTimingsEn: 'Mon - Sat: 8:00 AM – 4:00 PM',
                opdTimingsTe: 'సోమ - శని: ఉదయం 8:00 – సాయంత్రం 4:00',
                bloodBankStatus: 'Regional Blood Transfusion Center',
                rating: 4.8
            }
        ];

        for (const h of hospitals) {
            await run(`
                INSERT INTO hospitals (id, nameEn, nameTe, districtEn, districtTe, typeEn, typeTe, addressEn, addressTe, phone, emergencyPhone, totalBeds, availableBeds, icuBedsAvailable, oxygenBedsAvailable, opdTimingsEn, opdTimingsTe, bloodBankStatus, rating)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                h.id, h.nameEn, h.nameTe, h.districtEn, h.districtTe, h.typeEn, h.typeTe,
                h.addressEn, h.addressTe, h.phone, h.emergencyPhone, h.totalBeds,
                h.availableBeds, h.icuBedsAvailable, h.oxygenBedsAvailable,
                h.opdTimingsEn, h.opdTimingsTe, h.bloodBankStatus, h.rating
            ]);
        }
    }

    const deptCount = await get('SELECT COUNT(*) as cnt FROM departments');
    if (!deptCount || deptCount.cnt === 0) {
        console.log('[MongoDB Atlas] Seeding authentic clinical departments...');
        const departments = [
            { key: 'General Medicine', nameEn: 'General Medicine', nameTe: 'జనరల్ మెడిసిన్', icon: '🩺', descriptionEn: 'Treatment for fevers, infections, diabetes, BP and adult illnesses', descriptionTe: 'జ్వరాలు, ఇన్ఫెక్షన్లు, మధుమేహం, బీపీ మరియు సాధారణ వ్యాధుల చికిత్స', doctorCount: 24 },
            { key: 'Pediatrics', nameEn: 'Pediatrics', nameTe: 'పీడియాట్రిక్స్ (శిశు వైద్యం)', icon: '🧸', descriptionEn: 'Infant, child and adolescent care, newborn health & immunization', descriptionTe: 'శిశు, బాల్య సంరక్షణ, నవజాత శిశువుల ఆరోగ్యం మరియు టీకాలు', doctorCount: 12 },
            { key: 'Gynecology', nameEn: 'Gynecology & Obstetrics', nameTe: 'గైనకాలజీ & ప్రసూతి', icon: '🌸', descriptionEn: 'Maternal health, antenatal care, safe deliveries and women care', descriptionTe: 'గర్భిణుల సంరక్షణ, సురక్షిత ప్రసవాలు మరియు స్త్రీ సంబంధిత వైద్యం', doctorCount: 14 },
            { key: 'Orthopedics', nameEn: 'Orthopedics', nameTe: 'ఆర్థోపెడిక్స్ (ఎముకల వైద్యం)', icon: '🦴', descriptionEn: 'Fractures, joint pains, trauma surgery and spine care', descriptionTe: 'ఫ్రాక్చర్లు, కీళ్ల నొప్పులు, ఎముకల శస్త్రచికిత్స మరియు వెన్నెముక సంరక్షణ', doctorCount: 8 },
            { key: 'Cardiology', nameEn: 'Cardiology', nameTe: 'కార్డియాలజీ (గుండె వైద్యం)', icon: '❤️', descriptionEn: 'Heart diseases, chest pain, ECG, ECHO and hypertension control', descriptionTe: 'గుండె జబ్బులు, ఛాతీ నొప్పి, ఈసీజీ, ఎకో మరియు గుండె రక్తపోటు చికిత్స', doctorCount: 7 },
            { key: 'Dermatology', nameEn: 'Dermatology', nameTe: 'డెర్మటాలజీ (చర్మ వైద్యం)', icon: '✋', descriptionEn: 'Skin infections, allergies, eczema, hair and nail treatments', descriptionTe: 'చర్మ అలర్జీలు, ఇన్ఫెక్షన్లు, సోరియాసిస్ మరియు చర్మ సంరక్షణ', doctorCount: 6 },
            { key: 'ENT', nameEn: 'ENT (Otorhinolaryngology)', nameTe: 'ఈఎన్‌టీ (చెవి, ముక్కు, గొంతు)', icon: '👂', descriptionEn: 'Ear discharge, sinus, throat infections and hearing assessments', descriptionTe: 'చెవి నొప్పి, సైనస్ సమస్యలు, గొంతు ఇన్ఫెక్షన్లు మరియు వినికిడి చికిత్స', doctorCount: 6 },
            { key: 'Ophthalmology', nameEn: 'Ophthalmology', nameTe: 'ఆప్తాల్మాలజీ (నేత్ర వైద్యం)', icon: '👁️', descriptionEn: 'Vision testing, cataract evaluation, eye infections and glaucoma', descriptionTe: 'కంటి చూపు పరీక్షలు, శుక్లాల చికిత్స మరియు నేత్ర సంరక్షణ', doctorCount: 5 },
            { key: 'Pulmonology', nameEn: 'Pulmonology', nameTe: 'పల్మనాలజీ (ఊపిరితిత్తుల వైద్యం)', icon: '🫁', descriptionEn: 'Asthma, TB, COPD, bronchitis and respiratory issues', descriptionTe: 'ఆస్తమా, క్షయ (టీబీ), దగ్గు మరియు శ్వాసకోశ వ్యాధుల చికిత్స', doctorCount: 4 }
        ];

        for (const d of departments) {
            await run(`
                INSERT INTO departments (key, nameEn, nameTe, icon, descriptionEn, descriptionTe, doctorCount)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [d.key, d.nameEn, d.nameTe, d.icon, d.descriptionEn, d.descriptionTe, d.doctorCount]);
        }
    }
}

async function seedPublicDoctors() {
    const docCount = await get('SELECT COUNT(*) as cnt FROM doctors');
    if (!docCount || docCount.cnt === 0) {
        console.log('[MongoDB Atlas] Seeding public OPD doctors catalog...');
        const doctors = [
            {
                id: 'doc_pub_ramesh',
                nameEn: 'Dr. K. Ramesh',
                nameTe: 'డా. కె. రమేష్',
                qual: 'MBBS, MD (General Medicine)',
                spec: 'General Medicine',
                roleEn: 'Chief Civil Surgeon & Physician',
                roleTe: 'ప్రధాన సాధారణ వైద్య నిపుణులు',
                emoji: '👨🏻‍⚕️',
                hours: '8:00 AM - 2:00 PM',
                hospitalId: 'GH_BHIMAVARAM',
                roomNo: 'Room 102 (OPD Ground Floor)',
                experienceYrs: 18,
                languages: 'Telugu, English, Hindi',
                slots: ['08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '01:00 PM', '01:30 PM'],
                todayAvailable: 1
            },
            {
                id: 'doc_pub_anitha',
                nameEn: 'Dr. S. Anitha',
                nameTe: 'డా. ఎస్. అనిత',
                qual: 'MBBS, MS, DGO (Obstetrics & Gynecology)',
                spec: 'Gynecology',
                roleEn: 'Senior Gynecologist & Obstetrician',
                roleTe: 'సీనియర్ గైనకాలజిస్ట్ (ప్రసూతి & స్త్రీల వైద్యం)',
                emoji: '👩🏻‍⚕️',
                hours: '8:30 AM - 3:00 PM',
                hospitalId: 'GH_BHIMAVARAM',
                roomNo: 'Room 105 (Maternity Block 1st Floor)',
                experienceYrs: 14,
                languages: 'Telugu, English',
                slots: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:30 PM', '01:30 PM', '02:00 PM'],
                todayAvailable: 1
            },
            {
                id: 'doc_pub_srinivas',
                nameEn: 'Dr. M. Srinivas',
                nameTe: 'డా. ఎం. శ్రీనివాస్',
                qual: 'MBBS, MS (Orthopedics), D.Ortho',
                spec: 'Orthopedics',
                roleEn: 'Orthopedic & Trauma Surgeon',
                roleTe: 'ఎముకల శస్త్రచికిత్స నిపుణులు',
                emoji: '👨🏽‍⚕️',
                hours: '9:00 AM - 2:30 PM',
                hospitalId: 'GH_BHIMAVARAM',
                roomNo: 'Room 108 (Trauma & Ortho OPD)',
                experienceYrs: 16,
                languages: 'Telugu, English',
                slots: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:30 AM', '12:00 PM', '01:00 PM', '01:30 PM'],
                todayAvailable: 1
            },
            {
                id: 'doc_pub_lakshmi',
                nameEn: 'Dr. P. Lakshmi',
                nameTe: 'డా. పి. లక్ష్మి',
                qual: 'MBBS, MD (Pediatrics), DCH',
                spec: 'Pediatrics',
                roleEn: 'Senior Pediatrician & Child Specialist',
                roleTe: 'పీడియాట్రిషియన్ (శిశు & బాలల వైద్య నిపుణులు)',
                emoji: '👩🏽‍⚕️',
                hours: '8:00 AM - 2:00 PM',
                hospitalId: 'GH_BHIMAVARAM',
                roomNo: 'Room 101 (Child Health OPD)',
                experienceYrs: 12,
                languages: 'Telugu, English',
                slots: ['08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '12:00 PM', '01:00 PM'],
                todayAvailable: 1
            },
            {
                id: 'doc_pub_naveen',
                nameEn: 'Dr. A. Naveen',
                nameTe: 'డా. ఎ. నవీన్',
                qual: 'MBBS, MD (Medicine), DM (Cardiology)',
                spec: 'Cardiology',
                roleEn: 'Consultant Cardiologist',
                roleTe: 'కార్డియాలజిస్ట్ (గుండె వైద్య నిపుణులు)',
                emoji: '👨🏻‍⚕️',
                hours: '9:30 AM - 3:00 PM',
                hospitalId: 'GH_BHIMAVARAM',
                roomNo: 'Room 204 (Cardiac OPD 2nd Floor)',
                experienceYrs: 15,
                languages: 'Telugu, English, Hindi',
                slots: ['09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '01:30 PM', '02:00 PM', '02:30 PM'],
                todayAvailable: 1
            },
            {
                id: 'doc_pub_deepa',
                nameEn: 'Dr. V. Deepa',
                nameTe: 'డా. వి. దీప',
                qual: 'MBBS, MD (Dermatology, Venereology, Leprosy)',
                spec: 'Dermatology',
                roleEn: 'Consultant Dermatologist',
                roleTe: 'డెర్మటాలజిస్ట్ (చర్మ రోగ నిపుణులు)',
                emoji: '👩🏻‍⚕️',
                hours: '9:00 AM - 1:30 PM',
                hospitalId: 'AH_PALAKOLLU',
                roomNo: 'Room 103 (Skin OPD)',
                experienceYrs: 9,
                languages: 'Telugu, English',
                slots: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '12:00 PM', '12:30 PM'],
                todayAvailable: 1
            },
            {
                id: 'doc_pub_kumar',
                nameEn: 'Dr. R. Kumar',
                nameTe: 'డా. ఆర్. కుమార్',
                qual: 'MBBS, MS (ENT), DLO',
                spec: 'ENT',
                roleEn: 'ENT Specialist & Head-Neck Surgeon',
                roleTe: 'ఈఎన్‌టీ స్పెషలిస్ట్ (చెవి, ముక్కు, గొంతు)',
                emoji: '👨🏽‍⚕️',
                hours: '8:30 AM - 2:00 PM',
                hospitalId: 'AH_PALAKOLLU',
                roomNo: 'Room 107 (ENT OPD)',
                experienceYrs: 11,
                languages: 'Telugu, English',
                slots: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '12:00 PM', '01:00 PM'],
                todayAvailable: 1
            },
            {
                id: 'doc_pub_swathi',
                nameEn: 'Dr. N. Swathi',
                nameTe: 'డా. ఎన్. స్వాతి',
                qual: 'MBBS, MS (Ophthalmology)',
                spec: 'Ophthalmology',
                roleEn: 'Consultant Eye Surgeon',
                roleTe: 'నేత్ర శస్త్రచికిత్స నిపుణులు',
                emoji: '👩🏽‍⚕️',
                hours: '8:00 AM - 1:00 PM',
                hospitalId: 'GH_BHIMAVARAM',
                roomNo: 'Room 110 (Eye OPD & Refraction Unit)',
                experienceYrs: 10,
                languages: 'Telugu, English',
                slots: ['08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:30 AM', '12:00 PM'],
                todayAvailable: 1
            },
            {
                id: 'doc_pub_venkat',
                nameEn: 'Dr. B. Venkata Rao',
                nameTe: 'డా. బి. వెంకటరావు',
                qual: 'MBBS, DTCD, MD (Pulmonary Medicine)',
                spec: 'Pulmonology',
                roleEn: 'Chest Physician & Pulmonologist',
                roleTe: 'శ్వాసకోశ మరియు ఊపిరితిత్తుల వైద్య నిపుణులు',
                emoji: '👨🏻‍⚕️',
                hours: '8:30 AM - 2:30 PM',
                hospitalId: 'GGH_ELURU',
                roomNo: 'Room 212 (Chest Diseases OPD)',
                experienceYrs: 20,
                languages: 'Telugu, English',
                slots: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '12:00 PM', '01:30 PM'],
                todayAvailable: 1
            }
        ];

        for (const doc of doctors) {
            await run(`
                INSERT INTO doctors (
                    id, nameEn, nameTe, qual, spec, roleEn, roleTe, emoji, hours,
                    hospitalId, roomNo, experienceYrs, languages, slotsJson, todayAvailable
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                doc.id, doc.nameEn, doc.nameTe, doc.qual, doc.spec, doc.roleEn, doc.roleTe,
                doc.emoji, doc.hours, doc.hospitalId, doc.roomNo, doc.experienceYrs,
                doc.languages, JSON.stringify(doc.slots), doc.todayAvailable
            ]);
        }
    }
}

async function bootstrapAdmin() {
    const adminEmail = ADMIN_DEFAULT_EMAIL.toLowerCase().trim();
    const existingAdmin = await get("SELECT * FROM users WHERE role = 'ADMIN' OR email = ?", [adminEmail]);
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(ADMIN_DEFAULT_PASSWORD, salt);
    const now = new Date().toISOString();
    const adminId = 'usr_admin_root_001';

    if (!existingAdmin || existingAdmin.role !== 'ADMIN') {
        console.log(`[MongoDB Atlas] Bootstrapping Chief Administrator (${adminEmail})...`);
        await run(`
            INSERT INTO users (id, email, phone, passwordHash, role, status, fullName, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, 'ADMIN', 'ACTIVE', ?, ?, ?)
        `, [adminId, adminEmail, ADMIN_DEFAULT_PHONE, hash, ADMIN_DEFAULT_NAME, now, now]);

        await run(`
            INSERT INTO audit_logs (id, actorUserId, actorRole, action, resource, resourceId, details, ipAddress, createdAt)
            VALUES (?, ?, 'SYSTEM', 'BOOTSTRAP_ADMIN', 'users', ?, 'Initial administrator bootstrapped', '127.0.0.1', ?)
        `, [`audit_${Date.now()}`, adminId, adminId, now]);

        console.log('[MongoDB Atlas] Chief Administrator created.');
    } else {
        // Ensure role and password are kept accurate
        await run('UPDATE users SET passwordHash = ?, role = ?, status = ?, fullName = ?, updatedAt = ? WHERE email = ?', [
            hash, 'ADMIN', 'ACTIVE', ADMIN_DEFAULT_NAME, now, adminEmail
        ]);
    }
}

async function seedVerifiedDoctorAccounts() {
    const defaultDoctors = [
        {
            id: 'doc_usr_ramesh',
            email: 'dr.ramesh@medislot.gov.in',
            fullName: 'Dr. K. Ramesh',
            phone: '9848011111',
            spec: 'General Medicine',
            qual: 'MBBS, MD (General Medicine)',
            exp: 18,
            hospitalId: 'GH_BHIMAVARAM',
            hospitalName: 'Government District Hospital, Bhimavaram',
            roomNo: 'Room 102 (OPD Ground Floor)',
            hours: '8:00 AM - 2:00 PM',
            slots: ['08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '01:00 PM', '01:30 PM']
        },
        {
            id: 'doc_usr_anitha',
            email: 'dr.anitha@medislot.gov.in',
            fullName: 'Dr. S. Anitha',
            phone: '9848022222',
            spec: 'Gynecology',
            qual: 'MBBS, MS, DGO (Obstetrics & Gynecology)',
            exp: 14,
            hospitalId: 'GH_BHIMAVARAM',
            hospitalName: 'Government District Hospital, Bhimavaram',
            roomNo: 'Room 105 (Maternity Block 1st Floor)',
            hours: '8:30 AM - 3:00 PM',
            slots: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:30 PM', '01:30 PM', '02:00 PM']
        },
        {
            id: 'doc_usr_srinivas',
            email: 'dr.srinivas@medislot.gov.in',
            fullName: 'Dr. M. Srinivas',
            phone: '9848033333',
            spec: 'Orthopedics',
            qual: 'MBBS, MS (Orthopedics), D.Ortho',
            exp: 16,
            hospitalId: 'GH_BHIMAVARAM',
            hospitalName: 'Government District Hospital, Bhimavaram',
            roomNo: 'Room 108 (Trauma & Ortho OPD)',
            hours: '9:00 AM - 2:30 PM',
            slots: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:30 AM', '12:00 PM', '01:00 PM', '01:30 PM']
        },
        {
            id: 'doc_usr_lakshmi',
            email: 'dr.lakshmi@medislot.gov.in',
            fullName: 'Dr. P. Lakshmi',
            phone: '9848044444',
            spec: 'Pediatrics',
            qual: 'MBBS, MD (Pediatrics), DCH',
            exp: 12,
            hospitalId: 'GH_BHIMAVARAM',
            hospitalName: 'Government District Hospital, Bhimavaram',
            roomNo: 'Room 101 (Child Health OPD)',
            hours: '8:00 AM - 2:00 PM',
            slots: ['08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '12:00 PM', '01:00 PM']
        }
    ];

    const salt = await bcrypt.genSalt(10);
    const defaultDocPass = await bcrypt.hash('DoctorPass@2026', salt);
    const now = new Date().toISOString();

    for (const doc of defaultDoctors) {
        const existing = await get('SELECT * FROM users WHERE email = ?', [doc.email.toLowerCase()]);
        if (!existing) {
            await run(`
                INSERT INTO users (id, email, phone, passwordHash, role, status, fullName, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, 'DOCTOR', 'ACTIVE', ?, ?, ?)
            `, [doc.id, doc.email, doc.phone, defaultDocPass, doc.fullName, now, now]);
        } else {
            await run('UPDATE users SET role = ?, status = ?, passwordHash = ?, fullName = ?, updatedAt = ? WHERE id = ?', [
                'DOCTOR', 'ACTIVE', defaultDocPass, doc.fullName, now, existing.id
            ]);
        }

        await run(`
            INSERT INTO doctor_profiles (
                userId, fullName, phone, specialization, qualifications, experienceYears,
                hospitalId, hospitalName, roomNo, consultationHours, languages,
                verificationStatus, verifiedAt, verifiedBy, todayAvailable, slotsJson, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Telugu, English', 'VERIFIED', ?, 'usr_admin_root_001', 1, ?, ?)
        `, [
            doc.id, doc.fullName, doc.phone, doc.spec, doc.qual, doc.exp,
            doc.hospitalId, doc.hospitalName, doc.roomNo, doc.hours,
            now, JSON.stringify(doc.slots), now
        ]);
    }
}

async function seedDefaultPatientAccount() {
    const pEmail = 'patient@medislot.gov.in';
    const salt = await bcrypt.genSalt(10);
    const pass = await bcrypt.hash('PatientPass@2026', salt);
    const now = new Date().toISOString();
    const pId = 'usr_pat_demo_001';

    const existingPatient = await get('SELECT * FROM users WHERE email = ?', [pEmail]);
    if (!existingPatient) {
        await run(`
            INSERT INTO users (id, email, phone, passwordHash, role, status, fullName, createdAt, updatedAt)
            VALUES (?, 'patient@medislot.gov.in', '9849012345', ?, 'PATIENT', 'ACTIVE', 'Venkata Satyanarayana', ?, ?)
        `, [pId, pass, now, now]);
    } else {
        await run('UPDATE users SET role = ?, status = ?, passwordHash = ?, fullName = ?, updatedAt = ? WHERE id = ?', [
            'PATIENT', 'ACTIVE', pass, 'Venkata Satyanarayana', now, existingPatient.id
        ]);
    }

    await run(`
        INSERT INTO patient_profiles (
            userId, fullName, phone, age, gender, abhaId, address, updatedAt
        ) VALUES (?, 'Venkata Satyanarayana', '9849012345', 42, 'Male', 'AROGYASRI-AP-9821443', 'Door No 4-21, Main Road, Bhimavaram, West Godavari', ?)
    `, [pId, now]);
}

async function seedDefaultGrievances() {
    const countRes = await get('SELECT COUNT(*) as cnt FROM grievances');
    if (!countRes || countRes.cnt === 0) {
        console.log('[MongoDB Atlas] Seeding authentic citizen grievances for AP hospitals...');
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
        const threeDaysAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString();

        const seedList = [
            {
                id: 'AP-GRV-8142',
                citizenName: 'S. Radhakrishna',
                citizenPhone: '9848012345',
                hospitalName: 'Government District Hospital, Bhimavaram',
                category: 'OPD Waiting Time',
                message: 'Cardiology room had only one counter open this morning. Requesting additional staff during peak 9-11 AM hours.',
                status: 'SUBMITTED',
                createdAt: now.toISOString()
            },
            {
                id: 'AP-GRV-6521',
                citizenName: 'K. Venkateswara Rao',
                citizenPhone: '9440156789',
                hospitalName: 'Government General Hospital (GGH), Eluru',
                category: 'Medicine Availability',
                message: 'Requested pediatric syrup was temporarily out of stock at counter 2. Was informed to return tomorrow.',
                status: 'IN_REVIEW',
                createdAt: yesterday
            },
            {
                id: 'AP-GRV-4209',
                citizenName: 'Lakshmi Vijaya',
                citizenPhone: '9989011223',
                hospitalName: 'Area Hospital, Palakollu',
                category: 'Hospital Sanitation',
                message: 'Waiting area chairs cleaned properly today, thank you for quick action on last week suggestion.',
                status: 'RESOLVED',
                createdAt: twoDaysAgo
            },
            {
                id: 'AP-GRV-3118',
                citizenName: 'N. Rama Krishna',
                citizenPhone: '9701023456',
                hospitalName: 'Rangaraya Government General Hospital, Kakinada',
                category: 'Doctor Availability',
                message: 'Orthopedics specialist on urgent surgery duty, nurse desk handled token sequence smoothly.',
                status: 'RESOLVED',
                createdAt: threeDaysAgo
            }
        ];

        for (const item of seedList) {
            await run(`
                INSERT INTO grievances (id, citizenName, citizenPhone, hospitalName, category, message, status, createdAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                item.id,
                item.citizenName,
                item.citizenPhone,
                item.hospitalName,
                item.category,
                item.message,
                item.status,
                item.createdAt
            ]);
        }
    }
}

module.exports = {
    getDb,
    run,
    get,
    all,
    withTransaction,
    initDatabase,
    closeDatabase,
    connectMongo,
    mongoose,
    models: {
        User,
        PatientProfile,
        DoctorProfile,
        Hospital,
        Department,
        Doctor,
        Appointment,
        OpdQueueState,
        Grievance,
        AuditLog
    }
};
