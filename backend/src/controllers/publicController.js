const { get, all, run } = require('../config/db');

function getTodayString() {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
}

// 1. Hospitals List
async function getHospitals(req, res, next) {
    try {
        const hospitals = await all('SELECT * FROM hospitals ORDER BY totalBeds DESC');
        res.json(hospitals);
    } catch (err) {
        next(err);
    }
}

// 2. Hospital by ID
async function getHospitalById(req, res, next) {
    try {
        const hospital = await get('SELECT * FROM hospitals WHERE id = ?', [req.params.id]);
        if (!hospital) {
            return res.status(404).json({ error: 'Hospital not found.' });
        }
        res.json(hospital);
    } catch (err) {
        next(err);
    }
}

// 3. Departments
async function getDepartments(req, res, next) {
    try {
        const departments = await all('SELECT * FROM departments');
        res.json(departments);
    } catch (err) {
        next(err);
    }
}

// 4. Doctors Discovery & Filter Engine
async function getDoctors(req, res, next) {
    try {
        const { department, hospitalId, search, date } = req.query;
        let sql = 'SELECT * FROM doctors WHERE todayAvailable = 1';
        const params = [];

        if (department && department !== 'all') {
            sql += ' AND spec = ?';
            params.push(department);
        }
        if (hospitalId && hospitalId !== 'all') {
            sql += ' AND hospitalId = ?';
            params.push(hospitalId);
        }
        if (search) {
            sql += ' AND (nameEn LIKE ? OR nameTe LIKE ? OR roleEn LIKE ? OR roleTe LIKE ? OR spec LIKE ?)';
            const s = `%${search}%`;
            params.push(s, s, s, s, s);
        }

        const doctors = await all(sql, params);

        // Fetch booked slots for the selected date to compute live availability
        const queryDate = date || getTodayString();
        const bookedRows = await all(
            "SELECT doctorNameEn, slotTime FROM appointments WHERE appointmentDate = ? AND status != 'CANCELLED'",
            [queryDate]
        );
        const bookedMap = new Set(bookedRows.map(b => `${b.doctorNameEn}|${b.slotTime}`));

        const formatted = doctors.map(d => {
            const allSlots = JSON.parse(d.slotsJson || '[]');
            const availableSlots = allSlots.filter(s => !bookedMap.has(`${d.nameEn}|${s}`));
            return {
                ...d,
                slots: allSlots,
                availableSlots,
                bookedSlots: allSlots.filter(s => bookedMap.has(`${d.nameEn}|${s}`))
            };
        });

        res.json(formatted);
    } catch (err) {
        next(err);
    }
}

// 5. Doctor by ID
async function getDoctorById(req, res, next) {
    try {
        const doctor = await get('SELECT * FROM doctors WHERE id = ?', [req.params.id]);
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found.' });
        }
        const allSlots = JSON.parse(doctor.slotsJson || '[]');
        res.json({
            ...doctor,
            slots: allSlots
        });
    } catch (err) {
        next(err);
    }
}

// 6. Public Health & OPD Stats
async function getPublicStats(req, res, next) {
    try {
        const today = getTodayString();
        const hospCount = await get('SELECT COUNT(*) as count, SUM(availableBeds) as beds, SUM(icuBedsAvailable) as icu FROM hospitals');
        const docCount = await get('SELECT COUNT(*) as count FROM doctors WHERE todayAvailable = 1');
        const todayBookings = await get("SELECT COUNT(*) as total, SUM(CASE WHEN status='COMPLETED' THEN 1 ELSE 0 END) as completed FROM appointments WHERE appointmentDate = ?", [today]);

        res.json({
            totalHospitals: hospCount.count || 0,
            availableBeds: hospCount.beds || 0,
            icuBeds: hospCount.icu || 0,
            activeDoctors: docCount.count || 0,
            todayBookings: todayBookings.total || 0,
            todayCompleted: todayBookings.completed || 0
        });
    } catch (err) {
        next(err);
    }
}

// 7. Grievance Redressal
async function submitGrievance(req, res, next) {
    try {
        const { citizenName, citizenPhone, hospitalName, category, message } = req.body;
        if (!citizenName || !citizenPhone || !message) {
            return res.status(400).json({ error: 'Name, mobile phone, and message are required.' });
        }

        const grvId = `AP-GRV-${Math.floor(1000 + Math.random() * 9000)}`;
        const nowIso = new Date().toISOString();

        await run(`
            INSERT INTO grievances (id, citizenName, citizenPhone, hospitalName, category, message, status, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, 'SUBMITTED', ?)
        `, [
            grvId,
            citizenName.trim(),
            String(citizenPhone).replace(/\D/g, '').slice(-10),
            hospitalName || 'General District Hospital, Bhimavaram',
            category || 'Services',
            message.trim(),
            nowIso
        ]);

        res.status(201).json({
            message: 'Grievance submitted successfully. Tracking reference generated.',
            grievanceId: grvId
        });
    } catch (err) {
        next(err);
    }
}

// 8. Emergency Help & AP Helplines (Unauthenticated Emergency Access)
async function getEmergencyInfo(req, res, next) {
    try {
        const hospitals = await all('SELECT id, nameEn, nameTe, districtEn, phone, emergencyPhone, availableBeds, icuBedsAvailable, oxygenBedsAvailable, bloodBankStatus FROM hospitals');

        res.json({
            disclaimer: 'For acute emergencies, trauma, poisonings, or severe respiratory distress, call 108 or proceed immediately to the nearest hospital casualty department. MediSlot OPD tokens are for scheduled non-emergency consultations only.',
            primaryHotlines: [
                {
                    number: '108',
                    labelEn: 'AP Emergency Medical & Ambulance Service',
                    labelTe: 'అత్యవసర అంబులెన్స్ సేవలు (108)',
                    tollFree: true,
                    availability: '24 Hours / 7 Days',
                    description: 'Free ambulance dispatch and emergency paramedic response across Andhra Pradesh.'
                },
                {
                    number: '104',
                    labelEn: 'AP Health Information & Medical Advice Helpline',
                    labelTe: 'వైద్య సలహా & ఆరోగ్య సమాచార హెల్ప్‌లైన్ (104)',
                    tollFree: true,
                    availability: '24 Hours / 7 Days',
                    description: 'Medical triage advice, prescription counseling, and health scheme assistance.'
                },
                {
                    number: '102',
                    labelEn: 'Janani Shishu Suraksha Karyakram (JSSK)',
                    labelTe: 'జననీ శిశు సురక్ష రవాణా సేవలు (102)',
                    tollFree: true,
                    availability: '24 Hours / 7 Days',
                    description: 'Free transport for pregnant mothers, safe delivery referrals, and neonatal emergency care.'
                },
                {
                    number: '1800-425-1818',
                    labelEn: 'Dr. YSR Aarogyasri Trust Toll-Free',
                    labelTe: 'డా. వైఎస్సార్ ఆరోగ్యశ్రీ ట్రస్ట్ హెల్ప్‌లైన్',
                    tollFree: true,
                    availability: '24 Hours / 7 Days',
                    description: 'Empaneled hospital network grievances, cashless treatment pre-authorization.'
                }
            ],
            hospitalEmergencyDesks: hospitals.map(h => ({
                id: h.id,
                hospitalName: h.nameEn,
                district: h.districtEn,
                emergencyPhone: h.emergencyPhone,
                generalPhone: h.phone,
                icuBedsAvailable: h.icuBedsAvailable,
                oxygenBedsAvailable: h.oxygenBedsAvailable,
                bloodBankStatus: h.bloodBankStatus
            }))
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getHospitals,
    getHospitalById,
    getDepartments,
    getDoctors,
    getDoctorById,
    getPublicStats,
    submitGrievance,
    getEmergencyInfo
};
