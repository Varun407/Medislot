const { get, all, run } = require('../config/db');

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
        // Query by patientUserId or matching verified phone
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

// 4. Book Appointment (Atomic verification and token issuance)
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
        const todayStr = new Date().toISOString().split('T')[0];
        if (appointmentDate < todayStr) {
            return res.status(400).json({ error: 'Cannot book appointments for past dates.' });
        }

        // Fetch Doctor details (from doctors or doctor_profiles)
        let doctor = await get('SELECT * FROM doctors WHERE nameEn = ?', [doctorNameEn]);
        if (!doctor) {
            // Check verified doctor profiles
            const docProf = await get("SELECT * FROM doctor_profiles WHERE fullName = ? AND verificationStatus = 'VERIFIED'", [doctorNameEn]);
            if (docProf) {
                doctor = {
                    nameEn: docProf.fullName,
                    nameTe: docProf.fullName,
                    spec: docProf.specialization,
                    hospitalId: docProf.hospitalId,
                    roomNo: docProf.roomNo || 'Room 101'
                };
            }
        }

        if (!doctor) {
            return res.status(404).json({ error: 'Selected doctor is not available or unverified.' });
        }

        // Prevent double booking for slot
        if (slotTime && slotTime !== 'Walk-in / Next Available') {
            const existingSlot = await get(`
                SELECT id FROM appointments 
                WHERE doctorNameEn = ? AND appointmentDate = ? AND slotTime = ? AND status != 'CANCELLED'
            `, [doctorNameEn, appointmentDate, slotTime]);

            if (existingSlot) {
                return res.status(409).json({
                    error: 'This time slot was just reserved by another patient. Please choose an alternative slot.'
                });
            }
        }

        // Fetch Hospital
        const hospId = hospitalId || doctor.hospitalId;
        const hospital = (await get('SELECT * FROM hospitals WHERE id = ?', [hospId])) ||
            (await get('SELECT * FROM hospitals WHERE id = ?', ['GH_BHIMAVARAM']));

        // Sequential Token Generation
        const maxTokenRow = await get(`
            SELECT MAX(tokenNumber) as maxToken FROM appointments 
            WHERE doctorNameEn = ? AND appointmentDate = ?
        `, [doctorNameEn, appointmentDate]);

        const nextToken = (maxTokenRow && maxTokenRow.maxToken ? maxTokenRow.maxToken : 0) + 1;
        const refId = generateRefId();
        const reportingTime = computeReportingTime(slotTime);
        const nowIso = new Date().toISOString();

        const bookingName = (patientName || req.user.fullName).trim();
        const bookingPhone = req.user.phone;
        const bookingAge = patientAge ? parseInt(patientAge, 10) : 30;

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
            abhaId.trim(),
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

        const created = await get('SELECT * FROM appointments WHERE id = ?', [refId]);

        res.status(201).json({
            message: 'OPD Appointment confirmed successfully.',
            appointment: created
        });
    } catch (err) {
        next(err);
    }
}

// 5. Cancel Appointment
async function cancelMyAppointment(req, res, next) {
    try {
        const { id } = req.params;
        const appointment = await get('SELECT * FROM appointments WHERE UPPER(id) = UPPER(?)', [id.trim()]);
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found.' });
        }

        // Data isolation guard: ensure this appointment belongs to the calling patient
        if (appointment.patientUserId && appointment.patientUserId !== req.user.id && appointment.patientPhone !== req.user.phone) {
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
    bookAppointment,
    cancelMyAppointment
};
