const { get, all, run, withTransaction } = require('../config/db');

function getTodayString() {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
}

function generateRefId() {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `AP-OPD-${year}-${randomNum}`;
}

// 1. Get Doctor Profile
async function getDoctorProfile(req, res, next) {
    try {
        const profile = await get('SELECT * FROM doctor_profiles WHERE userId = ?', [req.user.id]);
        res.json({
            user: {
                id: req.user.id,
                email: req.user.email,
                phone: req.user.phone,
                fullName: req.user.fullName
            },
            profile: profile || {}
        });
    } catch (err) {
        next(err);
    }
}

// 2. Update Doctor Profile (Safe fields only)
async function updateDoctorProfile(req, res, next) {
    try {
        const { roomNo, consultationHours, languages, phone } = req.body;
        const now = new Date().toISOString();

        if (phone) {
            const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
            await run('UPDATE users SET phone = ?, updatedAt = ? WHERE id = ?', [cleanPhone, now, req.user.id]);
            await run('UPDATE doctor_profiles SET phone = ?, updatedAt = ? WHERE userId = ?', [cleanPhone, now, req.user.id]);
        }

        await run(`
            UPDATE doctor_profiles 
            SET roomNo = COALESCE(?, roomNo),
                consultationHours = COALESCE(?, consultationHours),
                languages = COALESCE(?, languages),
                updatedAt = ?
            WHERE userId = ?
        `, [roomNo || null, consultationHours || null, languages || null, now, req.user.id]);

        const updated = await get('SELECT * FROM doctor_profiles WHERE userId = ?', [req.user.id]);
        res.json({ message: 'Profile updated successfully.', profile: updated });
    } catch (err) {
        next(err);
    }
}

// 3. Get Availability
async function getDoctorAvailability(req, res, next) {
    try {
        const profile = await get('SELECT todayAvailable, slotsJson, consultationHours FROM doctor_profiles WHERE userId = ?', [req.user.id]);
        const slots = JSON.parse(profile && profile.slotsJson ? profile.slotsJson : '[]');
        res.json({
            todayAvailable: profile ? profile.todayAvailable : 1,
            consultationHours: profile ? profile.consultationHours : '8:30 AM - 2:00 PM',
            slots
        });
    } catch (err) {
        next(err);
    }
}

// 4. Update Availability
async function updateDoctorAvailability(req, res, next) {
    try {
        const { todayAvailable, slots } = req.body;
        const now = new Date().toISOString();
        const slotsJson = Array.isArray(slots) ? JSON.stringify(slots) : undefined;

        await run(`
            UPDATE doctor_profiles 
            SET todayAvailable = COALESCE(?, todayAvailable),
                slotsJson = COALESCE(?, slotsJson),
                updatedAt = ?
            WHERE userId = ?
        `, [todayAvailable !== undefined ? (todayAvailable ? 1 : 0) : null, slotsJson || null, now, req.user.id]);

        res.json({ message: 'Availability schedule updated successfully.' });
    } catch (err) {
        next(err);
    }
}

// 5. Get Doctor OPD Live Queue
async function getDoctorQueue(req, res, next) {
    try {
        const docName = req.user.fullName;
        const queryDate = req.query.date || getTodayString();

        const queueState = await get(
            'SELECT currentServingToken FROM opd_queue_state WHERE doctorNameEn = ? AND appointmentDate = ?',
            [docName, queryDate]
        );
        const currentToken = queueState ? queueState.currentServingToken : 0;

        const appointments = await all(`
            SELECT * FROM appointments 
            WHERE doctorNameEn = ? AND appointmentDate = ?
            ORDER BY tokenNumber ASC
        `, [docName, queryDate]);

        const waiting = appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'CALLED');
        const inConsultation = appointments.filter(a => a.status === 'IN_CONSULTATION');
        const completed = appointments.filter(a => a.status === 'COMPLETED');

        res.json({
            doctorNameEn: docName,
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

// 6. Call Next Patient Token (Concurrency-safe and atomic state machine)
async function callNextToken(req, res, next) {
    try {
        const docName = req.user.fullName;
        const queryDate = req.body.date || getTodayString();
        const now = new Date().toISOString();

        let calledPatient = null;
        let newServingToken = 0;

        await withTransaction(async () => {
            const queueState = await get(
                'SELECT currentServingToken FROM opd_queue_state WHERE doctorNameEn = ? AND appointmentDate = ?',
                [docName, queryDate]
            );
            const currentToken = queueState ? queueState.currentServingToken : 0;

            // Automatically complete any patient currently CALLED to avoid conflicting states
            await run(`
                UPDATE appointments 
                SET status = 'COMPLETED', updatedAt = ?
                WHERE doctorNameEn = ? AND appointmentDate = ? AND status = 'CALLED'
            `, [now, docName, queryDate]);

            // Find next eligible patient who is waiting (tokenNumber > currentToken or status in CONFIRMED/WAITING)
            const nextPatient = await get(`
                SELECT * FROM appointments 
                WHERE doctorNameEn = ? AND appointmentDate = ? 
                  AND tokenNumber > ?
                  AND status IN ('CONFIRMED', 'WAITING')
                ORDER BY tokenNumber ASC LIMIT 1
            `, [docName, queryDate, currentToken]);

            if (!nextPatient) {
                // If no tokens > currentToken, look for any earlier skipped/confirmed token
                const fallbackPatient = await get(`
                    SELECT * FROM appointments 
                    WHERE doctorNameEn = ? AND appointmentDate = ? 
                      AND status IN ('CONFIRMED', 'WAITING')
                    ORDER BY tokenNumber ASC LIMIT 1
                `, [docName, queryDate]);

                if (!fallbackPatient) {
                    newServingToken = currentToken;
                    return;
                }
                calledPatient = fallbackPatient;
            } else {
                calledPatient = nextPatient;
            }

            newServingToken = calledPatient.tokenNumber;

            // Update queue state atomically
            await run(`
                INSERT INTO opd_queue_state (doctorNameEn, appointmentDate, currentServingToken)
                VALUES (?, ?, ?)
                ON CONFLICT(doctorNameEn, appointmentDate) DO UPDATE SET currentServingToken = excluded.currentServingToken
            `, [docName, queryDate, newServingToken]);

            // Update patient appointment status to CALLED
            await run("UPDATE appointments SET status = 'CALLED', updatedAt = ? WHERE id = ?", [now, calledPatient.id]);
            calledPatient.status = 'CALLED';
        });

        if (!calledPatient) {
            return res.json({
                message: 'No more waiting patients in queue for today.',
                currentServingToken: newServingToken,
                patient: null
            });
        }

        res.json({
            message: `Token #${String(newServingToken).padStart(2, '0')} (${calledPatient.patientName}) called for consultation.`,
            currentServingToken: newServingToken,
            patient: calledPatient
        });
    } catch (err) {
        next(err);
    }
}

// 7. Update Appointment Status (Strict Isolation Guard & Support for SKIPPED)
async function updateAppointmentStatus(req, res, next) {
    try {
        const { id } = req.params;
        let { status } = req.body;
        const validStatuses = ['CONFIRMED', 'WAITING', 'CALLED', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'SKIPPED'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid appointment status.' });
        }

        // Normalize WAITING to CONFIRMED
        if (status === 'WAITING') status = 'CONFIRMED';

        const appointment = await get('SELECT * FROM appointments WHERE UPPER(id) = UPPER(?)', [id.trim()]);
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found.' });
        }

        // Verify doctor ownership
        const isAssignedDoctor = appointment.doctorNameEn === req.user.fullName ||
                                 (appointment.doctorUserId && appointment.doctorUserId === req.user.id);
        if (!isAssignedDoctor) {
            return res.status(403).json({ error: 'Access denied. You can only update appointments assigned to your roster.' });
        }

        const now = new Date().toISOString();
        await run('UPDATE appointments SET status = ?, updatedAt = ? WHERE UPPER(id) = UPPER(?)', [status, now, id.trim()]);

        const updated = await get('SELECT * FROM appointments WHERE UPPER(id) = UPPER(?)', [id.trim()]);
        res.json({ message: `Appointment status updated to ${status}.`, appointment: updated });
    } catch (err) {
        next(err);
    }
}

// 8. Issue Walk-in Counter Token (Atomic Concurrency-safe allocation)
async function issueWalkinToken(req, res, next) {
    try {
        const { patientName, patientPhone, patientAge, patientGender = 'Other', symptoms = '' } = req.body;
        const today = getTodayString();
        const docName = req.user.fullName;

        const profile = await get('SELECT * FROM doctor_profiles WHERE userId = ?', [req.user.id]);
        const hospitalId = profile ? profile.hospitalId : 'GH_BHIMAVARAM';
        const hospitalName = profile ? profile.hospitalName : 'Government District Hospital, Bhimavaram';
        const roomNo = profile && profile.roomNo ? profile.roomNo : 'Room 102';

        const refId = generateRefId();
        const nowIso = new Date().toISOString();
        let createdAppointment = null;

        await withTransaction(async () => {
            const maxTokenRow = await get(
                'SELECT MAX(tokenNumber) as maxToken FROM appointments WHERE doctorNameEn = ? AND appointmentDate = ?',
                [docName, today]
            );
            const nextToken = (maxTokenRow && maxTokenRow.maxToken ? maxTokenRow.maxToken : 0) + 1;

            await run(`
                INSERT INTO appointments (
                    id, tokenNumber, patientName, patientPhone, patientAge, patientGender, abhaId, symptoms,
                    doctorNameEn, doctorNameTe, department, hospitalId, hospitalNameEn, hospitalNameTe,
                    appointmentDate, slotTime, status, roomNo, reportingTime, doctorUserId, createdAt, updatedAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', ?, 'Immediate Counter Token', ?, ?, ?)
            `, [
                refId,
                nextToken,
                (patientName || 'Walk-in Patient').trim(),
                (patientPhone || '9848099999').replace(/\D/g, '').slice(-10),
                parseInt(patientAge || 35, 10),
                patientGender,
                '',
                (symptoms || 'Counter Walk-in OPD Request').trim(),
                docName,
                docName,
                profile ? profile.specialization : 'General Medicine',
                hospitalId,
                hospitalName,
                hospitalName,
                today,
                'Walk-in Immediate',
                roomNo,
                req.user.id,
                nowIso,
                nowIso
            ]);

            createdAppointment = await get('SELECT * FROM appointments WHERE id = ?', [refId]);
        });

        res.status(201).json({
            message: `Walk-in Token #${createdAppointment.tokenNumber} generated successfully.`,
            appointment: createdAppointment
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getDoctorProfile,
    updateDoctorProfile,
    getDoctorAvailability,
    updateDoctorAvailability,
    getDoctorQueue,
    callNextToken,
    updateAppointmentStatus,
    issueWalkinToken
};
