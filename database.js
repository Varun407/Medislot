const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'medislot.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening SQLite database:', err.message);
    } else {
        console.log('Connected to SQLite database at:', DB_PATH);
    }
});

function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
}

function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function all(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

async function initDatabase() {
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

    await seedInitialData();
}

async function seedInitialData() {
    const hospCount = await get('SELECT COUNT(*) as cnt FROM hospitals');
    if (hospCount && hospCount.cnt > 0) {
        return; // Already seeded
    }

    console.log('Seeding initial authentic hospital and doctor data...');

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

    const doctors = [
        {
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
            INSERT INTO doctors (nameEn, nameTe, qual, spec, roleEn, roleTe, emoji, hours, hospitalId, roomNo, experienceYrs, languages, slotsJson, todayAvailable)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            doc.nameEn, doc.nameTe, doc.qual, doc.spec, doc.roleEn, doc.roleTe,
            doc.emoji, doc.hours, doc.hospitalId, doc.roomNo, doc.experienceYrs,
            doc.languages, JSON.stringify(doc.slots), doc.todayAvailable
        ]);
    }

    // Seed realistic initial appointments for today so Doctor OPD Queue has active patients immediately!
    const todayStr = new Date().toISOString().split('T')[0];

    const seedAppointments = [
        {
            id: 'AP-OPD-2026-1001',
            tokenNumber: 1,
            patientName: 'K. Subba Rao',
            patientPhone: '9848012345',
            patientAge: 54,
            patientGender: 'Male',
            abhaId: 'AP-9848-1001-ABHA',
            symptoms: 'High blood pressure checkup & persistent dry cough',
            doctorNameEn: 'Dr. K. Ramesh',
            doctorNameTe: 'డా. కె. రమేష్',
            department: 'General Medicine',
            hospitalId: 'GH_BHIMAVARAM',
            hospitalNameEn: 'Government District Hospital, Bhimavaram',
            hospitalNameTe: 'ప్రభుత్వ జిల్లా ఆసుపత్రి, భీమవరం',
            appointmentDate: todayStr,
            slotTime: '08:30 AM',
            status: 'COMPLETED',
            roomNo: 'Room 102 (OPD Ground Floor)',
            reportingTime: '08:15 AM'
        },
        {
            id: 'AP-OPD-2026-1002',
            tokenNumber: 2,
            patientName: 'M. Mary Kumari',
            patientPhone: '9848012345',
            patientAge: 48,
            patientGender: 'Female',
            abhaId: 'AP-9848-1002-ABHA',
            symptoms: 'Viral fever for 4 days and body aches',
            doctorNameEn: 'Dr. K. Ramesh',
            doctorNameTe: 'డా. కె. రమేష్',
            department: 'General Medicine',
            hospitalId: 'GH_BHIMAVARAM',
            hospitalNameEn: 'Government District Hospital, Bhimavaram',
            hospitalNameTe: 'ప్రభుత్వ జిల్లా ఆసుపత్రి, భీమవరం',
            appointmentDate: todayStr,
            slotTime: '09:00 AM',
            status: 'IN_CONSULTATION',
            roomNo: 'Room 102 (OPD Ground Floor)',
            reportingTime: '08:45 AM'
        },
        {
            id: 'AP-OPD-2026-1003',
            tokenNumber: 3,
            patientName: 'V. Satyanarayana',
            patientPhone: '9988776655',
            patientAge: 62,
            patientGender: 'Male',
            abhaId: 'AP-9988-1003-ABHA',
            symptoms: 'Type 2 Diabetes routine follow-up & sugar test review',
            doctorNameEn: 'Dr. K. Ramesh',
            doctorNameTe: 'డా. కె. రమేష్',
            department: 'General Medicine',
            hospitalId: 'GH_BHIMAVARAM',
            hospitalNameEn: 'Government District Hospital, Bhimavaram',
            hospitalNameTe: 'ప్రభుత్వ జిల్లా ఆసుపత్రి, భీమవరం',
            appointmentDate: todayStr,
            slotTime: '09:30 AM',
            status: 'CONFIRMED',
            roomNo: 'Room 102 (OPD Ground Floor)',
            reportingTime: '09:15 AM'
        },
        {
            id: 'AP-OPD-2026-1004',
            tokenNumber: 4,
            patientName: 'T. Bhavani',
            patientPhone: '9876543210',
            patientAge: 29,
            patientGender: 'Female',
            abhaId: 'AP-9876-1004-ABHA',
            symptoms: 'Prenatal 2nd trimester routine ultrasound checkup',
            doctorNameEn: 'Dr. S. Anitha',
            doctorNameTe: 'డా. ఎస్. అనిత',
            department: 'Gynecology',
            hospitalId: 'GH_BHIMAVARAM',
            hospitalNameEn: 'Government District Hospital, Bhimavaram',
            hospitalNameTe: 'ప్రభుత్వ జిల్లా ఆసుపత్రి, భీమవరం',
            appointmentDate: todayStr,
            slotTime: '09:30 AM',
            status: 'CONFIRMED',
            roomNo: 'Room 105 (Maternity Block 1st Floor)',
            reportingTime: '09:15 AM'
        },
        {
            id: 'AP-OPD-2026-1005',
            tokenNumber: 1,
            patientName: 'Master Ch. Sai Teja',
            patientPhone: '9440112233',
            patientAge: 5,
            patientGender: 'Male',
            abhaId: 'AP-9440-1005-ABHA',
            symptoms: 'Cold, ear infection and MMR booster vaccination',
            doctorNameEn: 'Dr. P. Lakshmi',
            doctorNameTe: 'డా. పి. లక్ష్మి',
            department: 'Pediatrics',
            hospitalId: 'GH_BHIMAVARAM',
            hospitalNameEn: 'Government District Hospital, Bhimavaram',
            hospitalNameTe: 'ప్రభుత్వ జిల్లా ఆసుపత్రి, భీమవరం',
            appointmentDate: todayStr,
            slotTime: '09:00 AM',
            status: 'CONFIRMED',
            roomNo: 'Room 101 (Child Health OPD)',
            reportingTime: '08:45 AM'
        }
    ];

    const nowIso = new Date().toISOString();
    for (const app of seedAppointments) {
        await run(`
            INSERT INTO appointments (
                id, tokenNumber, patientName, patientPhone, patientAge, patientGender, abhaId, symptoms,
                doctorNameEn, doctorNameTe, department, hospitalId, hospitalNameEn, hospitalNameTe,
                appointmentDate, slotTime, status, roomNo, reportingTime, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            app.id, app.tokenNumber, app.patientName, app.patientPhone, app.patientAge, app.patientGender,
            app.abhaId, app.symptoms, app.doctorNameEn, app.doctorNameTe, app.department,
            app.hospitalId, app.hospitalNameEn, app.hospitalNameTe, app.appointmentDate,
            app.slotTime, app.status, app.roomNo, app.reportingTime, nowIso, nowIso
        ]);
    }

    // Initialize doctor OPD serving queue state
    await run(`
        INSERT OR REPLACE INTO opd_queue_state (doctorNameEn, appointmentDate, currentServingToken)
        VALUES ('Dr. K. Ramesh', ?, 2)
    `, [todayStr]);

    await run(`
        INSERT OR REPLACE INTO opd_queue_state (doctorNameEn, appointmentDate, currentServingToken)
        VALUES ('Dr. S. Anitha', ?, 1)
    `, [todayStr]);

    await run(`
        INSERT OR REPLACE INTO opd_queue_state (doctorNameEn, appointmentDate, currentServingToken)
        VALUES ('Dr. P. Lakshmi', ?, 1)
    `, [todayStr]);

    console.log('Database initialized and seeded successfully!');
}

module.exports = {
    db,
    run,
    get,
    all,
    initDatabase
};
