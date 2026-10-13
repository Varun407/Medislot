const { get, all, run } = require('../config/db');
const { createAuditLog } = require('../utils/audit');

function getTodayString() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// 1. Platform Overview Stats
async function getDashboardStats(req, res, next) {
    try {
        const today = getTodayString();

        const patientCount = await get("SELECT COUNT(*) as count FROM users WHERE role = 'PATIENT'");
        const doctorStats = await get(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN verificationStatus = 'VERIFIED' THEN 1 ELSE 0 END) as verified,
                SUM(CASE WHEN verificationStatus = 'PENDING' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN verificationStatus = 'SUSPENDED' THEN 1 ELSE 0 END) as suspended
            FROM doctor_profiles
        `);

        const appointmentStats = await get(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN appointmentDate = ? THEN 1 ELSE 0 END) as todayTotal,
                SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled
            FROM appointments
        `, [today]);

        const hospitalBeds = await get(`
            SELECT 
                COUNT(*) as totalHospitals,
                SUM(availableBeds) as totalBeds,
                SUM(icuBedsAvailable) as icuBeds,
                SUM(oxygenBedsAvailable) as oxygenBeds
            FROM hospitals
        `);

        const recentAudits = await all(`
            SELECT * FROM audit_logs ORDER BY createdAt DESC LIMIT 8
        `);

        res.json({
            patients: {
                total: patientCount.count || 0
            },
            doctors: {
                total: doctorStats.total || 0,
                verified: doctorStats.verified || 0,
                pending: doctorStats.pending || 0,
                suspended: doctorStats.suspended || 0
            },
            appointments: {
                total: appointmentStats.total || 0,
                todayTotal: appointmentStats.todayTotal || 0,
                completed: appointmentStats.completed || 0,
                cancelled: appointmentStats.cancelled || 0
            },
            hospitals: {
                total: hospitalBeds.totalHospitals || 0,
                availableBeds: hospitalBeds.totalBeds || 0,
                icuBeds: hospitalBeds.icuBeds || 0,
                oxygenBeds: hospitalBeds.oxygenBeds || 0
            },
            recentAudits
        });
    } catch (err) {
        next(err);
    }
}

// 2. Doctor Management List
async function getDoctors(req, res, next) {
    try {
        const { status, search } = req.query;
        let sql = `
            SELECT 
                dp.*,
                u.email,
                u.status as userStatus,
                u.createdAt as registeredAt
            FROM doctor_profiles dp
            JOIN users u ON dp.userId = u.id
            WHERE 1=1
        `;
        const params = [];

        if (status && status !== 'ALL') {
            sql += ' AND dp.verificationStatus = ?';
            params.push(status);
        }
        if (search) {
            sql += ' AND (dp.fullName LIKE ? OR u.email LIKE ? OR dp.specialization LIKE ?)';
            const s = `%${search}%`;
            params.push(s, s, s);
        }

        sql += ' ORDER BY u.createdAt DESC';
        const doctors = await all(sql, params);
        res.json(doctors);
    } catch (err) {
        next(err);
    }
}

// 3. Update Doctor Verification Status (Approval Workflow)
async function updateDoctorStatus(req, res, next) {
    try {
        const { id } = req.params; // doctor userId
        const { status, rejectionReason } = req.body; // 'VERIFIED' | 'REJECTED' | 'SUSPENDED'

        if (!['VERIFIED', 'REJECTED', 'SUSPENDED'].includes(status)) {
            return res.status(400).json({ error: 'Invalid verification status.' });
        }

        const doctorProf = await get('SELECT * FROM doctor_profiles WHERE userId = ?', [id]);
        if (!doctorProf) {
            return res.status(404).json({ error: 'Doctor profile not found.' });
        }

        const now = new Date().toISOString();
        const userStatus = status === 'VERIFIED' ? 'ACTIVE' : (status === 'SUSPENDED' ? 'SUSPENDED' : 'INACTIVE');

        // Update doctor profile and user record
        await run(`
            UPDATE doctor_profiles 
            SET verificationStatus = ?,
                verifiedAt = ?,
                verifiedBy = ?,
                rejectionReason = ?,
                updatedAt = ?
            WHERE userId = ?
        `, [
            status,
            status === 'VERIFIED' ? now : doctorProf.verifiedAt,
            req.user.id,
            rejectionReason || null,
            now,
            id
        ]);

        await run('UPDATE users SET status = ?, updatedAt = ? WHERE id = ?', [userStatus, now, id]);

        // If approved/verified, ensure doctor exists in public doctors catalog so they can be booked
        if (status === 'VERIFIED') {
            const existingInCatalog = await get('SELECT id FROM doctors WHERE nameEn = ?', [doctorProf.fullName]);
            if (!existingInCatalog) {
                const slots = doctorProf.slotsJson || JSON.stringify(['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM']);
                await run(`
                    INSERT INTO doctors (
                        nameEn, nameTe, qual, spec, roleEn, roleTe, emoji, hours,
                        hospitalId, roomNo, experienceYrs, languages, slotsJson, todayAvailable
                    ) VALUES (?, ?, ?, ?, 'Civil Assistant Surgeon', 'సివిల్ అసిస్టెంట్ సర్జన్', '👨🏻‍⚕️', ?, ?, ?, ?, ?, ?, 1)
                `, [
                    doctorProf.fullName,
                    doctorProf.fullName,
                    doctorProf.qualifications,
                    doctorProf.specialization,
                    doctorProf.consultationHours || '8:30 AM - 2:00 PM',
                    doctorProf.hospitalId || 'GH_BHIMAVARAM',
                    doctorProf.roomNo || 'Room 101',
                    doctorProf.experienceYears || 5,
                    doctorProf.languages || 'Telugu, English',
                    slots
                ]);
            }
        }

        // Record Audit Log
        await createAuditLog({
            actorUserId: req.user.id,
            actorRole: 'ADMIN',
            action: `DOCTOR_STATUS_${status}`,
            resource: 'doctor_profiles',
            resourceId: id,
            details: { doctorName: doctorProf.fullName, newStatus: status, rejectionReason },
            ipAddress: req.ip
        });

        const updated = await get('SELECT * FROM doctor_profiles WHERE userId = ?', [id]);
        res.json({
            message: `Doctor account status changed to ${status}.`,
            doctor: updated
        });
    } catch (err) {
        next(err);
    }
}

// 4. Patients Management List
async function getPatients(req, res, next) {
    try {
        const { search } = req.query;
        let sql = `
            SELECT 
                u.id,
                u.email,
                u.phone,
                u.fullName,
                u.status,
                u.createdAt,
                pp.age,
                pp.gender,
                pp.abhaId,
                (SELECT COUNT(*) FROM appointments a WHERE a.patientUserId = u.id OR a.patientPhone = u.phone) as appointmentCount
            FROM users u
            LEFT JOIN patient_profiles pp ON u.id = pp.userId
            WHERE u.role = 'PATIENT'
        `;
        const params = [];

        if (search) {
            sql += ' AND (u.fullName LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)';
            const s = `%${search}%`;
            params.push(s, s, s);
        }

        sql += ' ORDER BY u.createdAt DESC';
        const patients = await all(sql, params);
        res.json(patients);
    } catch (err) {
        next(err);
    }
}

// 5. System-wide Appointments Query
async function getAppointments(req, res, next) {
    try {
        const { date, status, doctorName, search } = req.query;
        let sql = 'SELECT * FROM appointments WHERE 1=1';
        const params = [];

        if (date) {
            sql += ' AND appointmentDate = ?';
            params.push(date);
        }
        if (status && status !== 'ALL') {
            sql += ' AND status = ?';
            params.push(status);
        }
        if (doctorName) {
            sql += ' AND doctorNameEn = ?';
            params.push(doctorName);
        }
        if (search) {
            sql += ' AND (patientName LIKE ? OR patientPhone LIKE ? OR id LIKE ?)';
            const s = `%${search}%`;
            params.push(s, s, s);
        }

        sql += ' ORDER BY appointmentDate DESC, tokenNumber ASC LIMIT 200';
        const appointments = await all(sql, params);
        res.json(appointments);
    } catch (err) {
        next(err);
    }
}

// 6. Audit Logs Query
async function getAuditLogs(req, res, next) {
    try {
        const logs = await all('SELECT * FROM audit_logs ORDER BY createdAt DESC LIMIT 100');
        res.json(logs);
    } catch (err) {
        next(err);
    }
}

// 7. Get OPD Doctors Overview (All verified doctors with today's OPD schedule and queue count)
async function getOpdDoctors(req, res, next) {
    try {
        const today = getTodayString();
        const doctors = await all(`
            SELECT 
                dp.*,
                u.email,
                u.status as userStatus
            FROM doctor_profiles dp
            JOIN users u ON dp.userId = u.id
            WHERE dp.verificationStatus = 'VERIFIED'
            ORDER BY dp.fullName ASC
        `);

        const result = [];
        for (const doc of doctors) {
            const todayBookings = await get(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
                    SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled,
                    SUM(CASE WHEN status IN ('CONFIRMED', 'CALLED', 'IN_CONSULTATION') THEN 1 ELSE 0 END) as waiting
                FROM appointments
                WHERE doctorNameEn = ? AND appointmentDate = ?
            `, [doc.fullName, today]);

            const queueState = await get(
                'SELECT currentServingToken FROM opd_queue_state WHERE doctorNameEn = ? AND appointmentDate = ?',
                [doc.fullName, today]
            );

            let slots = [];
            try {
                slots = doc.slotsJson ? JSON.parse(doc.slotsJson) : [];
            } catch (_) {
                slots = [];
            }

            result.push({
                ...doc,
                slots,
                todayStats: {
                    total: todayBookings.total || 0,
                    completed: todayBookings.completed || 0,
                    cancelled: todayBookings.cancelled || 0,
                    waiting: todayBookings.waiting || 0,
                    currentServingToken: queueState ? queueState.currentServingToken : 0
                }
            });
        }

        res.json(result);
    } catch (err) {
        next(err);
    }
}

// 8. Update Doctor OPD Configuration (Admin managing duty availability, room, hours, slots for any doctor)
async function updateDoctorOpdConfig(req, res, next) {
    try {
        const { id } = req.params; // doctor userId
        const { todayAvailable, roomNo, consultationHours, slots } = req.body;

        const doctorProf = await get('SELECT * FROM doctor_profiles WHERE userId = ?', [id]);
        if (!doctorProf) {
            return res.status(404).json({ error: 'Doctor profile not found.' });
        }

        const now = new Date().toISOString();
        const slotsJson = Array.isArray(slots) ? JSON.stringify(slots) : doctorProf.slotsJson;
        const avail = todayAvailable !== undefined ? (todayAvailable ? 1 : 0) : doctorProf.todayAvailable;
        const room = roomNo !== undefined ? roomNo.trim() : doctorProf.roomNo;
        const hours = consultationHours !== undefined ? consultationHours.trim() : doctorProf.consultationHours;

        await run(`
            UPDATE doctor_profiles
            SET todayAvailable = ?,
                roomNo = ?,
                consultationHours = ?,
                slotsJson = ?,
                updatedAt = ?
            WHERE userId = ?
        `, [avail, room, hours, slotsJson, now, id]);

        // Sync with public doctors catalog
        await run(`
            UPDATE doctors
            SET todayAvailable = ?,
                roomNo = ?,
                hours = ?,
                slotsJson = ?
            WHERE nameEn = ?
        `, [avail, room, hours, slotsJson, doctorProf.fullName]);

        // Audit Log
        await createAuditLog({
            actorUserId: req.user.id,
            actorRole: 'ADMIN',
            action: 'ADMIN_UPDATED_DOCTOR_OPD',
            resource: 'doctor_profiles',
            resourceId: id,
            details: {
                doctorName: doctorProf.fullName,
                todayAvailable: avail,
                roomNo: room,
                consultationHours: hours,
                slotCount: Array.isArray(slots) ? slots.length : undefined
            },
            ipAddress: req.ip
        });

        const updated = await get('SELECT * FROM doctor_profiles WHERE userId = ?', [id]);
        res.json({
            message: `OPD configuration updated for ${doctorProf.fullName}.`,
            doctor: {
                ...updated,
                slots: Array.isArray(slots) ? slots : JSON.parse(updated.slotsJson || '[]')
            }
        });
    } catch (err) {
        next(err);
    }
}

// 9. Get Doctor Live OPD Queue for Admin
async function getDoctorOpdQueue(req, res, next) {
    try {
        const { doctorName } = req.query;
        if (!doctorName) {
            return res.status(400).json({ error: 'doctorName query parameter is required.' });
        }
        const queryDate = req.query.date || getTodayString();

        const queueState = await get(
            'SELECT currentServingToken FROM opd_queue_state WHERE doctorNameEn = ? AND appointmentDate = ?',
            [doctorName, queryDate]
        );
        const currentToken = queueState ? queueState.currentServingToken : 0;

        const appointments = await all(`
            SELECT * FROM appointments 
            WHERE doctorNameEn = ? AND appointmentDate = ?
            ORDER BY tokenNumber ASC
        `, [doctorName, queryDate]);

        const waiting = appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'CALLED');
        const inConsultation = appointments.filter(a => a.status === 'IN_CONSULTATION');
        const completed = appointments.filter(a => a.status === 'COMPLETED');

        res.json({
            doctorNameEn: doctorName,
            appointmentDate: queryDate,
            currentServingToken: currentToken,
            totalPatients: appointments.length,
            waitingCount: waiting.length,
            inConsultationCount: inConsultation.length,
            completedCount: completed.length,
            patients: appointments
        });
    } catch (err) {
        next(err);
    }
}

// 10. Call Next OPD Token (Admin advances doctor queue on behalf of clinic)
async function callNextOpdToken(req, res, next) {
    try {
        const { doctorName } = req.body;
        if (!doctorName) {
            return res.status(400).json({ error: 'doctorName is required.' });
        }
        const queryDate = req.body.date || getTodayString();

        const queueState = await get(
            'SELECT currentServingToken FROM opd_queue_state WHERE doctorNameEn = ? AND appointmentDate = ?',
            [doctorName, queryDate]
        );
        const currentToken = queueState ? queueState.currentServingToken : 0;

        const nextPatient = await get(`
            SELECT * FROM appointments 
            WHERE doctorNameEn = ? AND appointmentDate = ? AND tokenNumber > ? 
              AND status != 'CANCELLED' AND status != 'COMPLETED' 
            ORDER BY tokenNumber ASC LIMIT 1
        `, [doctorName, queryDate, currentToken]);

        if (!nextPatient) {
            return res.json({
                message: 'No more waiting patients in queue for today.',
                currentServingToken: currentToken,
                patient: null
            });
        }

        await run(`
            INSERT INTO opd_queue_state (doctorNameEn, appointmentDate, currentServingToken)
            VALUES (?, ?, ?)
            ON CONFLICT(doctorNameEn, appointmentDate) DO UPDATE SET currentServingToken = excluded.currentServingToken
        `, [doctorName, queryDate, nextPatient.tokenNumber]);

        await run(
            "UPDATE appointments SET status = 'CALLED', updatedAt = ? WHERE id = ?",
            [new Date().toISOString(), nextPatient.id]
        );

        await createAuditLog({
            actorUserId: req.user.id,
            actorRole: 'ADMIN',
            action: 'ADMIN_CALLED_OPD_TOKEN',
            resource: 'appointments',
            resourceId: nextPatient.id,
            details: { doctorName, tokenNumber: nextPatient.tokenNumber, patientName: nextPatient.patientName },
            ipAddress: req.ip
        });

        res.json({
            message: `Token #${String(nextPatient.tokenNumber).padStart(2, '0')} (${nextPatient.patientName}) called for consultation.`,
            currentServingToken: nextPatient.tokenNumber,
            patient: nextPatient
        });
    } catch (err) {
        next(err);
    }
}

// 11. Update Specific Appointment Status (Admin marking completed / in-consultation / cancelled)
async function updateAppointmentStatus(req, res, next) {
    try {
        const { appointmentId, status } = req.body;
        if (!['IN_CONSULTATION', 'COMPLETED', 'CANCELLED', 'CONFIRMED'].includes(status)) {
            return res.status(400).json({ error: 'Invalid appointment status.' });
        }

        const appt = await get('SELECT * FROM appointments WHERE id = ?', [appointmentId]);
        if (!appt) {
            return res.status(404).json({ error: 'Appointment not found.' });
        }

        const now = new Date().toISOString();
        await run('UPDATE appointments SET status = ?, updatedAt = ? WHERE id = ?', [status, now, appointmentId]);

        await createAuditLog({
            actorUserId: req.user.id,
            actorRole: 'ADMIN',
            action: `ADMIN_SET_APPOINTMENT_${status}`,
            resource: 'appointments',
            resourceId: appointmentId,
            details: { doctorName: appt.doctorNameEn, patientName: appt.patientName, status },
            ipAddress: req.ip
        });

        const updated = await get('SELECT * FROM appointments WHERE id = ?', [appointmentId]);
        res.json({
            message: `Appointment ${appointmentId} updated to ${status}.`,
            appointment: updated
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getDashboardStats,
    getDoctors,
    updateDoctorStatus,
    getPatients,
    getAppointments,
    getAuditLogs,
    getOpdDoctors,
    updateDoctorOpdConfig,
    getDoctorOpdQueue,
    callNextOpdToken,
    updateAppointmentStatus
};
