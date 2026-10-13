const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase, run, get, all } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname)); // Also serve root files (csp_fr1.html, etc.)

// Helper: Format today's date YYYY-MM-DD
function getTodayString() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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

// ---------------------- API ROUTES ---------------------- //

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString(), system: 'AP MediSlot OPD Service' });
});

// Live Stats
app.get('/api/stats', async (req, res) => {
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
        res.status(500).json({ error: err.message });
    }
});

// Hospitals List
app.get('/api/hospitals', async (req, res) => {
    try {
        const hospitals = await all('SELECT * FROM hospitals ORDER BY totalBeds DESC');
        res.json(hospitals);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Single Hospital
app.get('/api/hospitals/:id', async (req, res) => {
    try {
        const hospital = await get('SELECT * FROM hospitals WHERE id = ?', [req.params.id]);
        if (!hospital) return res.status(404).json({ error: 'Hospital not found' });
        res.json(hospital);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Departments List
app.get('/api/departments', async (req, res) => {
    try {
        const depts = await all('SELECT * FROM departments');
        res.json(depts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Doctors List (with filters)
app.get('/api/doctors', async (req, res) => {
    try {
        const { department, hospitalId, search, date } = req.query;
        let sql = 'SELECT * FROM doctors WHERE 1=1';
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
        res.status(500).json({ error: err.message });
    }
});

// Appointments Query (by phone, refId, doctor, or date)
app.get('/api/appointments', async (req, res) => {
    try {
        const { phone, refId, doctorName, date } = req.query;
        let sql = 'SELECT * FROM appointments WHERE 1=1';
        const params = [];

        if (phone) {
            // Clean phone to last 10 digits
            const cleanPhone = phone.replace(/\D/g, '').slice(-10);
            sql += ' AND patientPhone LIKE ?';
            params.push(`%${cleanPhone}%`);
        }
        if (refId) {
            sql += ' AND UPPER(id) = UPPER(?)';
            params.push(refId.trim());
        }
        if (doctorName) {
            sql += ' AND doctorNameEn = ?';
            params.push(doctorName);
        }
        if (date) {
            sql += ' AND appointmentDate = ?';
            params.push(date);
        }

        sql += ' ORDER BY appointmentDate DESC, tokenNumber ASC';
        const appointments = await all(sql, params);
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Single Appointment by ID
app.get('/api/appointments/:id', async (req, res) => {
    try {
        const appointment = await get('SELECT * FROM appointments WHERE UPPER(id) = UPPER(?)', [req.params.id.trim()]);
        if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

        // Get current serving token for this doctor today
        const queueState = await get(
            'SELECT currentServingToken FROM opd_queue_state WHERE doctorNameEn = ? AND appointmentDate = ?',
            [appointment.doctorNameEn, appointment.appointmentDate]
        );
        const currentToken = queueState ? queueState.currentServingToken : 0;

        res.json({
            ...appointment,
            currentServingToken: currentToken
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create Appointment (Booking)
app.post('/api/appointments', async (req, res) => {
    try {
        const {
            patientName,
            patientPhone,
            patientAge,
            patientGender = 'Other',
            abhaId = '',
            symptoms = '',
            doctorNameEn,
            hospitalId,
            appointmentDate,
            slotTime
        } = req.body;

        // Validation
        if (!patientName || !patientName.trim()) {
            return res.status(400).json({ error: 'Patient name is required' });
        }
        const cleanPhone = (patientPhone || '').replace(/\D/g, '').slice(-10);
        if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
            return res.status(400).json({ error: 'Valid 10-digit Indian mobile number required' });
        }
        if (patientAge === undefined || patientAge === '' || isNaN(patientAge) || patientAge < 0 || patientAge > 125) {
            return res.status(400).json({ error: 'Valid age between 0 and 125 is required' });
        }
        if (!doctorNameEn) {
            return res.status(400).json({ error: 'Doctor selection is required' });
        }
        if (!appointmentDate) {
            return res.status(400).json({ error: 'Appointment date is required' });
        }

        // Fetch Doctor details
        const doctor = await get('SELECT * FROM doctors WHERE nameEn = ?', [doctorNameEn]);
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        // Fetch Hospital details
        const hospId = hospitalId || doctor.hospitalId;
        const hospital = await get('SELECT * FROM hospitals WHERE id = ?', [hospId]) ||
            await get('SELECT * FROM hospitals WHERE id = ?', ['GH_BHIMAVARAM']);

        // Check if slot is already booked for this doctor on this date (if slot specified)
        if (slotTime) {
            const existing = await get(
                "SELECT id FROM appointments WHERE doctorNameEn = ? AND appointmentDate = ? AND slotTime = ? AND status != 'CANCELLED'",
                [doctorNameEn, appointmentDate, slotTime]
            );
            if (existing) {
                return res.status(409).json({ error: 'Selected time slot is already booked. Please choose another slot.' });
            }
        }

        // Generate sequential Token Number for this doctor on this date
        const maxTokenRow = await get(
            'SELECT MAX(tokenNumber) as maxToken FROM appointments WHERE doctorNameEn = ? AND appointmentDate = ?',
            [doctorNameEn, appointmentDate]
        );
        const nextToken = (maxTokenRow && maxTokenRow.maxToken ? maxTokenRow.maxToken : 0) + 1;

        const refId = generateRefId();
        const reportingTime = computeReportingTime(slotTime);
        const nowIso = new Date().toISOString();

        await run(`
            INSERT INTO appointments (
                id, tokenNumber, patientName, patientPhone, patientAge, patientGender, abhaId, symptoms,
                doctorNameEn, doctorNameTe, department, hospitalId, hospitalNameEn, hospitalNameTe,
                appointmentDate, slotTime, status, roomNo, reportingTime, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            refId,
            nextToken,
            patientName.trim(),
            cleanPhone,
            parseInt(patientAge, 10),
            patientGender,
            abhaId.trim(),
            symptoms.trim() || 'General OPD Consultation',
            doctor.nameEn,
            doctor.nameTe,
            doctor.spec,
            hospital.id,
            hospital.nameEn,
            hospital.nameTe,
            appointmentDate,
            slotTime || 'Walk-in / Next Available',
            'CONFIRMED',
            doctor.roomNo,
            reportingTime,
            nowIso,
            nowIso
        ]);

        const created = await get('SELECT * FROM appointments WHERE id = ?', [refId]);

        res.status(201).json({
            message: 'OPD Appointment booked successfully',
            appointment: created
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Cancel Appointment
app.post('/api/appointments/:id/cancel', async (req, res) => {
    try {
        const id = req.params.id.trim();
        const appointment = await get('SELECT * FROM appointments WHERE UPPER(id) = UPPER(?)', [id]);
        if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

        if (appointment.status === 'CANCELLED') {
            return res.json({ message: 'Appointment already cancelled', appointment });
        }

        const nowIso = new Date().toISOString();
        await run("UPDATE appointments SET status = 'CANCELLED', updatedAt = ? WHERE UPPER(id) = UPPER(?)", [nowIso, id]);

        const updated = await get('SELECT * FROM appointments WHERE UPPER(id) = UPPER(?)', [id]);
        res.json({ message: 'Appointment cancelled successfully. Slot freed.', appointment: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Appointment Status (Doctor Queue: CALLED, IN_CONSULTATION, COMPLETED, NO_SHOW)
app.put('/api/appointments/:id/status', async (req, res) => {
    try {
        const id = req.params.id.trim();
        const { status } = req.body;
        const validStatuses = ['CONFIRMED', 'CALLED', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const nowIso = new Date().toISOString();
        await run('UPDATE appointments SET status = ?, updatedAt = ? WHERE UPPER(id) = UPPER(?)', [status, nowIso, id]);
        const updated = await get('SELECT * FROM appointments WHERE UPPER(id) = UPPER(?)', [id]);
        res.json({ message: `Status updated to ${status}`, appointment: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// OPD Queue: Get Doctor Queue for specific date
app.get('/api/queue', async (req, res) => {
    try {
        const { doctorName, date } = req.query;
        const queryDate = date || getTodayString();
        const docName = doctorName || 'Dr. K. Ramesh';

        const queueState = await get(
            'SELECT currentServingToken FROM opd_queue_state WHERE doctorNameEn = ? AND appointmentDate = ?',
            [docName, queryDate]
        );
        const currentToken = queueState ? queueState.currentServingToken : 0;

        const appointments = await all(
            'SELECT * FROM appointments WHERE doctorNameEn = ? AND appointmentDate = ? ORDER BY tokenNumber ASC',
            [docName, queryDate]
        );

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
        res.status(500).json({ error: err.message });
    }
});

// OPD Queue: Call Next Patient Token
app.post('/api/queue/call-next', async (req, res) => {
    try {
        const { doctorName, date } = req.body;
        const queryDate = date || getTodayString();
        const docName = doctorName || 'Dr. K. Ramesh';

        // Get currently serving token
        const queueState = await get(
            'SELECT currentServingToken FROM opd_queue_state WHERE doctorNameEn = ? AND appointmentDate = ?',
            [docName, queryDate]
        );
        let currentToken = queueState ? queueState.currentServingToken : 0;

        // Find the next uncompleted patient token
        const nextPatient = await get(
            "SELECT * FROM appointments WHERE doctorNameEn = ? AND appointmentDate = ? AND tokenNumber > ? AND status != 'CANCELLED' AND status != 'COMPLETED' ORDER BY tokenNumber ASC LIMIT 1",
            [docName, queryDate, currentToken]
        );

        if (!nextPatient) {
            return res.json({
                message: 'No more waiting patients in queue for today',
                currentServingToken: currentToken,
                patient: null
            });
        }

        // Advance current serving token
        const newServingToken = nextPatient.tokenNumber;
        await run(`
            INSERT INTO opd_queue_state (doctorNameEn, appointmentDate, currentServingToken)
            VALUES (?, ?, ?)
            ON CONFLICT(doctorNameEn, appointmentDate) DO UPDATE SET currentServingToken = ?
        `, [docName, queryDate, newServingToken, newServingToken]);

        // Mark appointment as CALLED
        await run("UPDATE appointments SET status = 'CALLED', updatedAt = ? WHERE id = ?", [new Date().toISOString(), nextPatient.id]);
        nextPatient.status = 'CALLED';

        res.json({
            message: `Token #${newServingToken} called for ${nextPatient.patientName}`,
            currentServingToken: newServingToken,
            patient: nextPatient
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// OPD Queue: Walk-in counter patient registration
app.post('/api/queue/walkin', async (req, res) => {
    try {
        const { patientName, patientPhone, patientAge, patientGender = 'Other', symptoms = '', doctorNameEn } = req.body;
        const today = getTodayString();
        const docName = doctorNameEn || 'Dr. K. Ramesh';

        const doctor = await get('SELECT * FROM doctors WHERE nameEn = ?', [docName]);
        if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

        const hospital = await get('SELECT * FROM hospitals WHERE id = ?', [doctor.hospitalId]) ||
            await get('SELECT * FROM hospitals WHERE id = ?', ['GH_BHIMAVARAM']);

        const maxTokenRow = await get(
            'SELECT MAX(tokenNumber) as maxToken FROM appointments WHERE doctorNameEn = ? AND appointmentDate = ?',
            [docName, today]
        );
        const nextToken = (maxTokenRow && maxTokenRow.maxToken ? maxTokenRow.maxToken : 0) + 1;
        const refId = generateRefId();
        const nowIso = new Date().toISOString();

        await run(`
            INSERT INTO appointments (
                id, tokenNumber, patientName, patientPhone, patientAge, patientGender, abhaId, symptoms,
                doctorNameEn, doctorNameTe, department, hospitalId, hospitalNameEn, hospitalNameTe,
                appointmentDate, slotTime, status, roomNo, reportingTime, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            refId,
            nextToken,
            (patientName || 'Walk-in Patient').trim(),
            (patientPhone || '9848099999').replace(/\D/g, '').slice(-10),
            parseInt(patientAge || 35, 10),
            patientGender,
            '',
            (symptoms || 'Counter Walk-in OPD Request').trim(),
            doctor.nameEn,
            doctor.nameTe,
            doctor.spec,
            hospital.id,
            hospital.nameEn,
            hospital.nameTe,
            today,
            'Walk-in Immediate',
            'CONFIRMED',
            doctor.roomNo,
            'Immediate Counter Token',
            nowIso,
            nowIso
        ]);

        const walkinRecord = await get('SELECT * FROM appointments WHERE id = ?', [refId]);
        res.status(201).json({
            message: `Walk-in Token #${nextToken} generated successfully`,
            appointment: walkinRecord
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Submit Grievance / Feedback
app.post('/api/grievances', async (req, res) => {
    try {
        const { citizenName, citizenPhone, hospitalName, category, message } = req.body;
        if (!citizenName || !citizenPhone || !message) {
            return res.status(400).json({ error: 'Name, phone, and message are required' });
        }
        const grvId = `AP-GRV-${Math.floor(1000 + Math.random() * 9000)}`;
        const nowIso = new Date().toISOString();

        await run(`
            INSERT INTO grievances (id, citizenName, citizenPhone, hospitalName, category, message, status, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, 'SUBMITTED', ?)
        `, [grvId, citizenName.trim(), citizenPhone.trim(), hospitalName || 'General', category || 'Services', message.trim(), nowIso]);

        res.status(201).json({
            message: 'Grievance submitted successfully. Your tracking ID is generated.',
            grievanceId: grvId
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Root fallback: serve index.html
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
async function startServer() {
    await initDatabase();
    app.listen(PORT, () => {
        console.log(`====================================================`);
        console.log(` MediSlot AP Government Hospital OPD System`);
        console.log(` Server is running live on: http://localhost:${PORT}`);
        console.log(` REST API endpoints available at: http://localhost:${PORT}/api/`);
        console.log(`====================================================`);
    });
}

startServer();
