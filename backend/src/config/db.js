const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const { DATABASE_PATH, ADMIN_DEFAULT_EMAIL, ADMIN_DEFAULT_PASSWORD, ADMIN_DEFAULT_NAME, ADMIN_DEFAULT_PHONE } = require('./env');

let db = null;

function getDb() {
    if (!db) {
        db = new sqlite3.Database(DATABASE_PATH, (err) => {
            if (err) {
                console.error('[Database] Failed to open SQLite database:', err.message);
            } else {
                console.log(`[Database] SQLite connected at ${DATABASE_PATH}`);
            }
        });
    }
    return db;
}

function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        getDb().run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
}

function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        getDb().get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function all(sql, params = []) {
    return new Promise((resolve, reject) => {
        getDb().all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

async function initDatabase() {
    console.log('[Database] Initializing tables and schema migrations...');

    // 1. Core Hospital Infrastructure Tables
    await run(`
        CREATE TABLE IF NOT EXISTS hospitals (
            id TEXT PRIMARY KEY,
            nameEn TEXT NOT NULL,
            nameTe TEXT NOT NULL,
            districtEn TEXT NOT NULL,
            districtTe TEXT NOT NULL,
            typeEn TEXT NOT NULL,
            typeTe TEXT NOT NULL,
            addressEn TEXT NOT NULL,
            addressTe TEXT NOT NULL,
            phone TEXT NOT NULL,
            emergencyPhone TEXT NOT NULL,
            totalBeds INTEGER NOT NULL,
            availableBeds INTEGER NOT NULL,
            icuBedsAvailable INTEGER NOT NULL,
            oxygenBedsAvailable INTEGER NOT NULL,
            opdTimingsEn TEXT NOT NULL,
            opdTimingsTe TEXT NOT NULL,
            bloodBankStatus TEXT NOT NULL,
            rating REAL NOT NULL
        )
    `);

    await run(`
        CREATE TABLE IF NOT EXISTS departments (
            key TEXT PRIMARY KEY,
            nameEn TEXT NOT NULL,
            nameTe TEXT NOT NULL,
            icon TEXT NOT NULL,
            descriptionEn TEXT,
            descriptionTe TEXT,
            doctorCount INTEGER DEFAULT 0
        )
    `);

    await run(`
        CREATE TABLE IF NOT EXISTS doctors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nameEn TEXT NOT NULL,
            nameTe TEXT NOT NULL,
            qual TEXT NOT NULL,
            spec TEXT NOT NULL,
            roleEn TEXT NOT NULL,
            roleTe TEXT NOT NULL,
            emoji TEXT NOT NULL,
            hours TEXT NOT NULL,
            hospitalId TEXT NOT NULL,
            roomNo TEXT NOT NULL,
            experienceYrs INTEGER NOT NULL,
            languages TEXT NOT NULL,
            slotsJson TEXT NOT NULL,
            todayAvailable INTEGER DEFAULT 1
        )
    `);

    await run(`
        CREATE TABLE IF NOT EXISTS appointments (
            id TEXT PRIMARY KEY,
            tokenNumber INTEGER NOT NULL,
            patientName TEXT NOT NULL,
            patientPhone TEXT NOT NULL,
            patientAge INTEGER NOT NULL,
            patientGender TEXT NOT NULL,
            abhaId TEXT,
            symptoms TEXT,
            doctorNameEn TEXT NOT NULL,
            doctorNameTe TEXT NOT NULL,
            department TEXT NOT NULL,
            hospitalId TEXT NOT NULL,
            hospitalNameEn TEXT NOT NULL,
            hospitalNameTe TEXT NOT NULL,
            appointmentDate TEXT NOT NULL,
            slotTime TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'CONFIRMED',
            roomNo TEXT NOT NULL,
            reportingTime TEXT NOT NULL,
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL
        )
    `);

    await run(`
        CREATE TABLE IF NOT EXISTS opd_queue_state (
            doctorNameEn TEXT NOT NULL,
            appointmentDate TEXT NOT NULL,
            currentServingToken INTEGER DEFAULT 0,
            PRIMARY KEY (doctorNameEn, appointmentDate)
        )
    `);

    await run(`
        CREATE TABLE IF NOT EXISTS grievances (
            id TEXT PRIMARY KEY,
            citizenName TEXT NOT NULL,
            citizenPhone TEXT NOT NULL,
            hospitalName TEXT NOT NULL,
            category TEXT NOT NULL,
            message TEXT NOT NULL,
            status TEXT DEFAULT 'SUBMITTED',
            createdAt TEXT NOT NULL
        )
    `);

    // 2. Role-Based Identity & Security Tables
    await run(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            phone TEXT NOT NULL,
            passwordHash TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('PATIENT', 'DOCTOR', 'ADMIN')),
            status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'PENDING', 'SUSPENDED', 'INACTIVE')),
            fullName TEXT NOT NULL,
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL
        )
    `);

    await run(`
        CREATE TABLE IF NOT EXISTS patient_profiles (
            userId TEXT PRIMARY KEY,
            fullName TEXT NOT NULL,
            phone TEXT NOT NULL,
            age INTEGER,
            gender TEXT,
            abhaId TEXT,
            address TEXT,
            updatedAt TEXT NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    await run(`
        CREATE TABLE IF NOT EXISTS doctor_profiles (
            userId TEXT PRIMARY KEY,
            fullName TEXT NOT NULL,
            phone TEXT NOT NULL,
            specialization TEXT NOT NULL,
            qualifications TEXT NOT NULL,
            experienceYears INTEGER NOT NULL DEFAULT 0,
            hospitalId TEXT NOT NULL,
            hospitalName TEXT,
            roomNo TEXT,
            consultationHours TEXT,
            languages TEXT,
            verificationStatus TEXT NOT NULL DEFAULT 'PENDING' CHECK(verificationStatus IN ('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED')),
            verifiedAt TEXT,
            verifiedBy TEXT,
            rejectionReason TEXT,
            todayAvailable INTEGER NOT NULL DEFAULT 1,
            slotsJson TEXT,
            updatedAt TEXT NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    await run(`
        CREATE TABLE IF NOT EXISTS audit_logs (
            id TEXT PRIMARY KEY,
            actorUserId TEXT,
            actorRole TEXT,
            action TEXT NOT NULL,
            resource TEXT,
            resourceId TEXT,
            details TEXT,
            ipAddress TEXT,
            createdAt TEXT NOT NULL
        )
    `);

    // Add optional relational columns to appointments if missing
    try {
        await run(`ALTER TABLE appointments ADD COLUMN patientUserId TEXT`);
    } catch (_) { /* Column already exists */ }

    try {
        await run(`ALTER TABLE appointments ADD COLUMN doctorUserId TEXT`);
    } catch (_) { /* Column already exists */ }

    // 3. Seed initial AP Hospital & Department Data if not already seeded
    await seedHospitalAndDepartmentData();

    // 4. Bootstrap Default Administrator
    await bootstrapAdmin();

    // 5. Seed default verified doctors accounts
    await seedVerifiedDoctorAccounts();

    // 6. Seed default patient account for instant testing
    await seedDefaultPatientAccount();

    console.log('[Database] Initialization & migrations completed successfully.');
}

async function seedHospitalAndDepartmentData() {
    const hospCount = await get('SELECT COUNT(*) as cnt FROM hospitals');
    if (!hospCount || hospCount.cnt === 0) {
        console.log('[Database] Seeding initial AP hospitals...');
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
        console.log('[Database] Seeding departments...');
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

async function bootstrapAdmin() {
    const existingAdmin = await get("SELECT * FROM users WHERE role = 'ADMIN' LIMIT 1");
    if (!existingAdmin) {
        console.log(`[Database] Bootstrapping initial secure administrator (${ADMIN_DEFAULT_EMAIL})...`);
        const adminId = 'usr_admin_root_001';
        const salt = await bcrypt.genSalt(12);
        const hash = await bcrypt.hash(ADMIN_DEFAULT_PASSWORD, salt);
        const now = new Date().toISOString();

        await run(`
            INSERT INTO users (id, email, phone, passwordHash, role, status, fullName, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, 'ADMIN', 'ACTIVE', ?, ?, ?)
        `, [adminId, ADMIN_DEFAULT_EMAIL.toLowerCase().trim(), ADMIN_DEFAULT_PHONE, hash, ADMIN_DEFAULT_NAME, now, now]);

        // Audit log entry
        await run(`
            INSERT INTO audit_logs (id, actorUserId, actorRole, action, resource, resourceId, details, ipAddress, createdAt)
            VALUES (?, ?, 'SYSTEM', 'BOOTSTRAP_ADMIN', 'users', ?, 'Initial administrator bootstrapped', '127.0.0.1', ?)
        `, [`audit_${Date.now()}`, adminId, adminId, now]);

        console.log('[Database] Initial administrator created successfully.');
    }
}

async function seedVerifiedDoctorAccounts() {
    const existingDoctorUser = await get("SELECT * FROM users WHERE role = 'DOCTOR' LIMIT 1");
    if (!existingDoctorUser) {
        console.log('[Database] Linking authentic AP doctors with verified user accounts...');
        const salt = await bcrypt.genSalt(10);
        const defaultDocPass = await bcrypt.hash('DoctorPass@2026', salt);
        const now = new Date().toISOString();

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

        for (const doc of defaultDoctors) {
            await run(`
                INSERT INTO users (id, email, phone, passwordHash, role, status, fullName, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, 'DOCTOR', 'ACTIVE', ?, ?, ?)
            `, [doc.id, doc.email, doc.phone, defaultDocPass, doc.fullName, now, now]);

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
        console.log('[Database] Verified AP doctors seeded with credentials (dr.ramesh@medislot.gov.in / DoctorPass@2026).');
    }
}

async function seedDefaultPatientAccount() {
    const existingPatient = await get("SELECT * FROM users WHERE role = 'PATIENT' AND email = 'patient@medislot.gov.in' LIMIT 1");
    if (!existingPatient) {
        console.log('[Database] Seeding default demo patient account...');
        const salt = await bcrypt.genSalt(10);
        const pass = await bcrypt.hash('PatientPass@2026', salt);
        const now = new Date().toISOString();
        const pId = 'usr_pat_demo_001';

        await run(`
            INSERT INTO users (id, email, phone, passwordHash, role, status, fullName, createdAt, updatedAt)
            VALUES (?, 'patient@medislot.gov.in', '9849012345', ?, 'PATIENT', 'ACTIVE', 'Venkata Satyanarayana', ?, ?)
        `, [pId, pass, now, now]);

        await run(`
            INSERT INTO patient_profiles (
                userId, fullName, phone, age, gender, abhaId, address, updatedAt
            ) VALUES (?, 'Venkata Satyanarayana', '9849012345', 42, 'Male', 'AROGYASRI-AP-9821443', 'Door No 4-21, Main Road, Bhimavaram, West Godavari', ?)
        `, [pId, now]);

        console.log('[Database] Demo patient seeded: patient@medislot.gov.in / PatientPass@2026');
    }
}

module.exports = {
    getDb,
    run,
    get,
    all,
    initDatabase
};
