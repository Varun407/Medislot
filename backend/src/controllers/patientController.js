const { get, all, run, withTransaction } = require('../config/db');

function getTodayString() {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
}

// Helper: Generate Unique AP OPD Reference ID
function generateRefId() {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `AP-OPD-${year}-${randomNum}`;
}

// Helper: Compute reporting time (15 mins prior to slot)
function computeReportingTime(slotTime) {
    if (!slotTime) return '15 mins prior to OPD';
    const match = slotTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return slotTime;
    let hours = parseInt(match[1], 10);
    let minutes = parseInt(match[2], 10);
    const meridiem = match[3].toUpperCase();

    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;

    let totalMins = hours * 60 + minutes - 15;
    if (totalMins < 0) totalMins += 24 * 60;

    let rHours = Math.floor(totalMins / 60);
    let rMins = totalMins % 60;
    const rMeridiem = rHours >= 12 ? 'PM' : 'AM';
    rHours = rHours % 12;
    if (rHours === 0) rHours = 12;

    return `${String(rHours).padStart(2, '0')}:${String(rMins).padStart(2, '0')} ${rMeridiem}`;
}

// 1. Get Patient Profile
async function getProfile(req, res, next) {
    try {
        const profile = await get('SELECT * FROM patient_profiles WHERE userId = ?', [req.user.id]);
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

// 2. Update Patient Profile
async function updateProfile(req, res, next) {
    try {
        const { fullName, phone, age, gender, abhaId, address } = req.body;
        const now = new Date().toISOString();

        if (fullName) {
            await run('UPDATE users SET fullName = ?, updatedAt = ? WHERE id = ?', [fullName.trim(), now, req.user.id]);
        }
        if (phone) {
            const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
            await run('UPDATE users SET phone = ?, updatedAt = ? WHERE id = ?', [cleanPhone, now, req.user.id]);
        }

        await run(`
            INSERT INTO patient_profiles (userId, fullName, phone, age, gender, abhaId, address, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(userId) DO UPDATE SET
                fullName = COALESCE(excluded.fullName, fullName),
                phone = COALESCE(excluded.phone, phone),
                age = COALESCE(excluded.age, age),
                gender = COALESCE(excluded.gender, gender),
                abhaId = COALESCE(excluded.abhaId, abhaId),
                address = COALESCE(excluded.address, address),
                updatedAt = excluded.updatedAt
        `, [
            req.user.id,
            fullName || req.user.fullName,
            phone ? String(phone).replace(/\D/g, '').slice(-10) : req.user.phone,
            age ? parseInt(age, 10) : null,
            gender || null,
            abhaId ? abhaId.trim() : null,
            address ? address.trim() : null,
            now
        ]);

        const updatedProfile = await get('SELECT * FROM patient_profiles WHERE userId = ?', [req.user.id]);
        res.json({
            message: 'Profile updated successfully.',
            profile: updatedProfile
        });
    } catch (err) {
        next(err);
    }
}

// 3. Get Patient's Own Appointments (Tenant Isolated)
async function getMyAppointments(req, res, next) {
    try {
        const appointments = await all(`
            SELECT * FROM appointments 
            WHERE patientUserId = ? OR patientPhone = ?
            ORDER BY appointmentDate DESC, tokenNumber ASC
        `, [req.user.id, req.user.phone]);

        res.json(appointments);
    } catch (err) {
        next(err);
    }
}

// 4. Get Specific Appointment by ID (Strict Ownership Verification)
async function getAppointmentById(req, res, next) {
    try {
        const { id } = req.params;
        const appointment = await get('SELECT * FROM appointments WHERE UPPER(id) = UPPER(?)', [id.trim()]);
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found.' });
        }

        // Ownership isolation
        const isOwner = (appointment.patientUserId && appointment.patientUserId === req.user.id) ||
                        (appointment.patientPhone && appointment.patientPhone === req.user.phone);
        if (!isOwner) {
            return res.status(403).json({ error: 'Unauthorized. You may only view your own medical appointments.' });
        }

        res.json(appointment);
    } catch (err) {
        next(err);
    }
}

// 5. Book Appointment (Atomic Concurrency-safe verification and token issuance)
async function bookAppointment(req, res, next) {
    try {
        const {
            doctorNameEn,
            hospitalId,
            appointmentDate,
            slotTime,
            patientName,
            patientAge,
            patientGender = 'Other',
            abhaId = '',
            symptoms = ''
        } = req.body;

        // Validation
        if (!doctorNameEn) {
            return res.status(400).json({ error: 'Doctor selection is required.' });
        }
        if (!appointmentDate) {
            return res.status(400).json({ error: 'Appointment date is required.' });
        }

        // Validate date is not in the past
        const todayStr = getTodayString();
        if (appointmentDate < todayStr) {
            return res.status(400).json({ error: 'Cannot book appointments for past dates.' });
        }

        // Validate date is within reasonable OPD advance booking horizon (30 days)
        const maxAdvanceDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const maxAdvanceStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(maxAdvanceDate);
        if (appointmentDate > maxAdvanceStr) {
            return res.status(400).json({ error: 'OPD appointments cannot be booked more than 30 days in advance.' });
        }

        // Fetch Doctor details (from doctors or doctor_profiles)
        let doctor = await get('SELECT * FROM doctors WHERE nameEn = ?', [doctorNameEn]);
        if (!doctor) {
            const docProf = await get("SELECT * FROM doctor_profiles WHERE fullName = ? AND verificationStatus = 'VERIFIED'", [doctorNameEn]);
            if (docProf) {
                doctor = {
                    nameEn: docProf.fullName,
                    nameTe: docProf.fullName,
                    spec: docProf.specialization,
                    hospitalId: docProf.hospitalId,
                    roomNo: docProf.roomNo || 'Room 101',
                    todayAvailable: docProf.todayAvailable
                };
            }
        }

        if (!doctor) {
            return res.status(404).json({ error: 'Selected doctor is not available or unverified.' });
        }

        // Check if doctor is on leave today
        if (appointmentDate === todayStr && doctor.todayAvailable === 0) {
            return res.status(400).json({
                error: `Dr. ${doctor.nameEn} is not available for OPD consultations today. Please choose an alternative date or doctor.`
            });
        }

        // Fetch Hospital
        const hospId = hospitalId || doctor.hospitalId;
        const hospital = (await get('SELECT * FROM hospitals WHERE id = ?', [hospId])) ||
            (await get('SELECT * FROM hospitals WHERE id = ?', ['GH_BHIMAVARAM']));

        const reportingTime = computeReportingTime(slotTime);
        const nowIso = new Date().toISOString();
        const bookingName = (patientName || req.user.fullName).trim();
        const bookingPhone = req.user.phone;
        const bookingAge = patientAge ? parseInt(patientAge, 10) : 30;

        // Atomic Transaction: Check slot reservation, compute sequential token, and insert
        let createdAppointment = null;
        await withTransaction(async () => {
            // Prevent double booking for slot
            if (slotTime && slotTime !== 'Walk-in / Next Available') {
                const existingSlot = await get(`
                    SELECT id FROM appointments 
                    WHERE doctorNameEn = ? AND appointmentDate = ? AND slotTime = ? AND status != 'CANCELLED'
                `, [doctorNameEn, appointmentDate, slotTime]);

                if (existingSlot) {
                    const err = new Error('This time slot was just reserved by another patient. Please choose an alternative slot.');
                    err.statusCode = 409;
                    throw err;
                }
            }

            // Check capacity limit (max 60 tokens per doctor session per day)
            const maxTokenRow = await get(`
                SELECT MAX(tokenNumber) as maxToken FROM appointments 
                WHERE doctorNameEn = ? AND appointmentDate = ?
            `, [doctorNameEn, appointmentDate]);

            const currentMax = maxTokenRow && maxTokenRow.maxToken ? maxTokenRow.maxToken : 0;
            if (currentMax >= 60) {
                const err = new Error(`OPD token capacity for ${doctor.nameEn} on ${appointmentDate} is full (maximum 60 tokens). Please select another date.`);
                err.statusCode = 400;
                throw err;
            }

            const nextToken = currentMax + 1;
            const refId = generateRefId();

            await run(`
                INSERT INTO appointments (
                    id, tokenNumber, patientName, patientPhone, patientAge, patientGender, abhaId, symptoms,
                    doctorNameEn, doctorNameTe, department, hospitalId, hospitalNameEn, hospitalNameTe,
                    appointmentDate, slotTime, status, roomNo, reportingTime, patientUserId, createdAt, updatedAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', ?, ?, ?, ?, ?)
            `, [
                refId,
                nextToken,
                bookingName,
                bookingPhone,
                bookingAge,
                patientGender,
                abhaId ? abhaId.trim() : '',
                symptoms.trim() || 'General Consultation',
                doctor.nameEn,
                doctor.nameTe || doctor.nameEn,
                doctor.spec,
                hospital.id,
                hospital.nameEn,
                hospital.nameTe,
                appointmentDate,
                slotTime || 'General OPD',
                doctor.roomNo || 'Room 102',
                reportingTime,
                req.user.id,
                nowIso,
                nowIso
            ]);

            createdAppointment = await get('SELECT * FROM appointments WHERE id = ?', [refId]);
        });

        res.status(201).json({
            message: 'OPD Appointment confirmed successfully.',
            appointment: createdAppointment
        });
    } catch (err) {
        if (err.message && err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({
                error: 'This time slot was just reserved by another patient. Please choose an alternative slot.'
            });
        }
        next(err);
    }
}

// 6. Reschedule Appointment
async function rescheduleMyAppointment(req, res, next) {
    try {
        const { id } = req.params;
        const { newDate, newSlotTime } = req.body;

        if (!newDate || !newSlotTime) {
            return res.status(400).json({ error: 'New appointment date and slot time are required for rescheduling.' });
        }

        const todayStr = getTodayString();
        if (newDate < todayStr) {
            return res.status(400).json({ error: 'Cannot reschedule appointments to past dates.' });
        }

        const appointment = await get('SELECT * FROM appointments WHERE UPPER(id) = UPPER(?)', [id.trim()]);
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found.' });
        }

        // Ownership verification
        const isOwner = (appointment.patientUserId && appointment.patientUserId === req.user.id) ||
                        (appointment.patientPhone && appointment.patientPhone === req.user.phone);
        if (!isOwner) {
            return res.status(403).json({ error: 'Unauthorized. You may only reschedule your own appointments.' });
        }

        if (appointment.status === 'CANCELLED') {
            return res.status(400).json({ error: 'Cancelled appointments cannot be rescheduled. Please book a new appointment.' });
        }
        if (appointment.status === 'COMPLETED') {
            return res.status(400).json({ error: 'Completed consultations cannot be rescheduled.' });
        }

        const nowIso = new Date().toISOString();
        const reportingTime = computeReportingTime(newSlotTime);
        let updatedAppointment = null;

        await withTransaction(async () => {
            // Check if target slot is already reserved by someone else
            const existingSlot = await get(`
                SELECT id FROM appointments 
                WHERE doctorNameEn = ? AND appointmentDate = ? AND slotTime = ? AND status != 'CANCELLED' AND UPPER(id) != UPPER(?)
            `, [appointment.doctorNameEn, newDate, newSlotTime, id.trim()]);

            if (existingSlot) {
                const err = new Error('The selected new slot is already reserved by another patient. Please pick an alternative slot.');
                err.statusCode = 409;
                throw err;
            }

            // Compute new sequential token on new date
            const maxTokenRow = await get(`
                SELECT MAX(tokenNumber) as maxToken FROM appointments 
                WHERE doctorNameEn = ? AND appointmentDate = ?
            `, [appointment.doctorNameEn, newDate]);

            const nextToken = (maxTokenRow && maxTokenRow.maxToken ? maxTokenRow.maxToken : 0) + 1;

            await run(`
                UPDATE appointments 
                SET appointmentDate = ?,
                    slotTime = ?,
                    tokenNumber = ?,
                    reportingTime = ?,
                    status = 'CONFIRMED',
                    updatedAt = ?
                WHERE UPPER(id) = UPPER(?)
            `, [newDate, newSlotTime, nextToken, reportingTime, nowIso, id.trim()]);

            updatedAppointment = await get('SELECT * FROM appointments WHERE UPPER(id) = UPPER(?)', [id.trim()]);
        });

        res.json({
            message: `Appointment successfully rescheduled to ${newDate} at ${newSlotTime}. Your new token is #${updatedAppointment.tokenNumber}.`,
            appointment: updatedAppointment
        });
    } catch (err) {
        if (err.message && err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({
                error: 'The selected new slot is already reserved by another patient. Please pick an alternative slot.'
            });
        }
        next(err);
    }
}

// 7. Get Live Token & Queue Status (Phase Five "My Token")
async function getTokenStatus(req, res, next) {
    try {
        const { id } = req.params;
        const appointment = await get('SELECT * FROM appointments WHERE UPPER(id) = UPPER(?)', [id.trim()]);
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found.' });
        }

        // Ownership verification
        const isOwner = (appointment.patientUserId && appointment.patientUserId === req.user.id) ||
                        (appointment.patientPhone && appointment.patientPhone === req.user.phone);
        if (!isOwner) {
            return res.status(403).json({ error: 'Unauthorized. You may only view status for your own appointments.' });
        }

        // Fetch live doctor OPD queue state
        const queueState = await get(
            'SELECT currentServingToken FROM opd_queue_state WHERE doctorNameEn = ? AND appointmentDate = ?',
            [appointment.doctorNameEn, appointment.appointmentDate]
        );

        const currentServingToken = queueState ? queueState.currentServingToken : 0;
        const tokensAhead = Math.max(0, appointment.tokenNumber - currentServingToken);
        const estimatedWaitMinutes = tokensAhead * 10;

        res.json({
            appointmentId: appointment.id,
            tokenNumber: appointment.tokenNumber,
            patientName: appointment.patientName,
            doctorNameEn: appointment.doctorNameEn,
            doctorNameTe: appointment.doctorNameTe,
            roomNo: appointment.roomNo,
            appointmentDate: appointment.appointmentDate,
            slotTime: appointment.slotTime,
            reportingTime: appointment.reportingTime,
            status: appointment.status,
            currentServingToken,
            tokensAhead,
            estimatedWaitMinutes,
            isCurrent: appointment.tokenNumber === currentServingToken && appointment.status !== 'COMPLETED',
            lastUpdated: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
}

// 8. Cancel Appointment
async function cancelMyAppointment(req, res, next) {
    try {
        const { id } = req.params;
        const appointment = await get('SELECT * FROM appointments WHERE UPPER(id) = UPPER(?)', [id.trim()]);
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found.' });
        }

        // Data isolation guard: ensure this appointment belongs to the calling patient
        const isOwner = (appointment.patientUserId && appointment.patientUserId === req.user.id) ||
                        (appointment.patientPhone && appointment.patientPhone === req.user.phone);
        if (!isOwner) {
            return res.status(403).json({ error: 'Unauthorized. You may only cancel your own appointments.' });
        }

        if (appointment.status === 'CANCELLED') {
            return res.json({ message: 'Appointment already cancelled.', appointment });
        }

        if (appointment.status === 'COMPLETED') {
            return res.status(400).json({ error: 'Completed appointments cannot be cancelled.' });
        }

        const nowIso = new Date().toISOString();
        await run("UPDATE appointments SET status = 'CANCELLED', updatedAt = ? WHERE UPPER(id) = UPPER(?)", [nowIso, id.trim()]);

        const updated = await get('SELECT * FROM appointments WHERE UPPER(id) = UPPER(?)', [id.trim()]);
        res.json({
            message: 'Appointment cancelled successfully. Time slot has been freed.',
            appointment: updated
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getProfile,
    updateProfile,
    getMyAppointments,
    getAppointmentById,
    bookAppointment,
    rescheduleMyAppointment,
    getTokenStatus,
    cancelMyAppointment
};
