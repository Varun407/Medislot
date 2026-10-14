const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');
const { initDatabase, run, get, closeDatabase } = require('../src/config/db');

let server;
let baseUrl;

before(async () => {
    await initDatabase();
    await new Promise((resolve) => {
        server = app.listen(0, () => {
            const port = server.address().port;
            baseUrl = `http://127.0.0.1:${port}`;
            resolve();
        });
    });
});

after(async () => {
    if (server) {
        await new Promise((resolve) => server.close(resolve));
    }
    await closeDatabase();
});

describe('Medislot Backend Comprehensive Tests', () => {

    test('1. Health check returns healthy status', async () => {
        const res = await fetch(`${baseUrl}/api/health`);
        assert.equal(res.status, 200);
        const data = await res.json();
        assert.equal(data.status, 'healthy');
    });

    test('2. Unauthenticated request to content endpoints is rejected with 401', async () => {
        const resHosp = await fetch(`${baseUrl}/api/v1/public/hospitals`);
        assert.equal(resHosp.status, 401);
        const dataHosp = await resHosp.json();
        assert.ok(dataHosp.error.includes('Authentication required'));

        const resDepts = await fetch(`${baseUrl}/api/v1/public/departments`);
        assert.equal(resDepts.status, 401);
        const dataDepts = await resDepts.json();
        assert.ok(dataDepts.error.includes('Authentication required'));
    });

    const testPatientEmail = `testpatient_${Date.now()}@example.com`;
    let patientToken = '';
    let patientUserId = '';

    test('3. Patient registration succeeds with valid data', async () => {
        const res = await fetch(`${baseUrl}/api/v1/auth/patient/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fullName: 'K. Sita Devi',
                email: testPatientEmail,
                phone: '9848123456',
                password: 'PatientPassword@2026',
                confirmPassword: 'PatientPassword@2026'
            })
        });

        assert.equal(res.status, 201);
        const data = await res.json();
        assert.ok(data.token);
        assert.equal(data.user.role, 'PATIENT');
        assert.equal(data.user.email, testPatientEmail);
        patientToken = data.token;
        patientUserId = data.user.id;
    });

    test('3b. Authenticated user can access hospitals and clinical departments', async () => {
        const resHosp = await fetch(`${baseUrl}/api/v1/public/hospitals`, {
            headers: { 'Authorization': `Bearer ${patientToken}` }
        });
        assert.equal(resHosp.status, 200);
        const hospitals = await resHosp.json();
        assert.ok(Array.isArray(hospitals));
        assert.ok(hospitals.length >= 4);

        const resDepts = await fetch(`${baseUrl}/api/v1/public/departments`, {
            headers: { 'Authorization': `Bearer ${patientToken}` }
        });
        assert.equal(resDepts.status, 200);
        const depts = await resDepts.json();
        assert.ok(Array.isArray(depts));
        assert.ok(depts.length >= 9);
    });

    test('4. Duplicate patient registration is prevented', async () => {
        const res = await fetch(`${baseUrl}/api/v1/auth/patient/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fullName: 'Duplicate Sita',
                email: testPatientEmail,
                phone: '9848123456',
                password: 'PatientPassword@2026',
                confirmPassword: 'PatientPassword@2026'
            })
        });

        assert.equal(res.status, 409);
        const data = await res.json();
        assert.ok(data.error.includes('already exists'));
    });

    test('5. Patient login succeeds with correct credentials', async () => {
        const res = await fetch(`${baseUrl}/api/v1/auth/patient/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testPatientEmail,
                password: 'PatientPassword@2026'
            })
        });

        assert.equal(res.status, 200);
        const data = await res.json();
        assert.ok(data.token);
        assert.equal(data.user.role, 'PATIENT');
    });

    test('6. Patient login fails with generic error on wrong password', async () => {
        const res = await fetch(`${baseUrl}/api/v1/auth/patient/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testPatientEmail,
                password: 'WrongPassword@123'
            })
        });

        assert.equal(res.status, 401);
        const data = await res.json();
        assert.equal(data.error, 'Invalid email or password.');
    });

    const testDoctorEmail = `testdoctor_${Date.now()}@example.com`;
    let pendingDoctorUserId = '';

    test('7. Doctor registration sets status to PENDING by default', async () => {
        const res = await fetch(`${baseUrl}/api/v1/auth/doctor/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fullName: 'Dr. Ch. Vijay Kumar',
                email: testDoctorEmail,
                phone: '9848998877',
                specialization: 'Cardiology',
                qualifications: 'MBBS, MD (Medicine), DM (Cardiology)',
                experienceYears: 10,
                hospitalId: 'GH_BHIMAVARAM',
                password: 'DocPassword@2026',
                confirmPassword: 'DocPassword@2026'
            })
        });

        assert.equal(res.status, 201);
        const data = await res.json();
        assert.equal(data.verificationStatus, 'PENDING');
        assert.equal(data.user.role, 'DOCTOR');
        pendingDoctorUserId = data.user.id;
    });

    test('8. Doctor login reports PENDING verification status', async () => {
        const res = await fetch(`${baseUrl}/api/v1/auth/doctor/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testDoctorEmail,
                password: 'DocPassword@2026'
            })
        });

        assert.equal(res.status, 200);
        const data = await res.json();
        assert.equal(data.user.verificationStatus, 'PENDING');
    });

    let adminToken = '';

    test('9. Admin login succeeds with seeded admin credentials', async () => {
        const res = await fetch(`${baseUrl}/api/v1/auth/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@medislot.gov.in',
                password: 'AdminSecure@2026'
            })
        });

        assert.equal(res.status, 200);
        const data = await res.json();
        assert.equal(data.user.role, 'ADMIN');
        assert.ok(data.token);
        adminToken = data.token;
    });

    test('10. Admin can approve/verify pending doctor account', async () => {
        const res = await fetch(`${baseUrl}/api/v1/admin/doctors/${pendingDoctorUserId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                status: 'VERIFIED'
            })
        });

        assert.equal(res.status, 200);
        const data = await res.json();
        assert.equal(data.doctor.verificationStatus, 'VERIFIED');
    });

    test('11. Unauthenticated request to protected route is rejected with 401', async () => {
        const res = await fetch(`${baseUrl}/api/v1/patients/appointments`);
        assert.equal(res.status, 401);
    });

    test('12. Patient attempting admin route is rejected with 403 Forbidden', async () => {
        const res = await fetch(`${baseUrl}/api/v1/admin/dashboard`, {
            headers: {
                'Authorization': `Bearer ${patientToken}`
            }
        });
        assert.equal(res.status, 403);
    });

    let bookedAppointmentId = '';
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    test('13. Patient can safely book appointment and receive sequential token', async () => {
        await run("DELETE FROM appointments WHERE slotTime = '10:00 AM' AND appointmentDate = ?", [tomorrowStr]);
        const res = await fetch(`${baseUrl}/api/v1/patients/appointments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${patientToken}`
            },
            body: JSON.stringify({
                doctorNameEn: 'Dr. K. Ramesh',
                hospitalId: 'GH_BHIMAVARAM',
                appointmentDate: tomorrowStr,
                slotTime: '10:00 AM',
                patientAge: 32,
                patientGender: 'Female',
                symptoms: 'Mild migraine and seasonal allergy'
            })
        });

        assert.equal(res.status, 201);
        const data = await res.json();
        assert.ok(data.appointment);
        assert.equal(data.appointment.doctorNameEn, 'Dr. K. Ramesh');
        assert.equal(data.appointment.slotTime, '10:00 AM');
        assert.ok(data.appointment.tokenNumber >= 1);
        assert.ok(data.appointment.id.startsWith('AP-OPD-'));
        bookedAppointmentId = data.appointment.id;
    });

    test('14. Double booking prevention rejects reserving the same slot', async () => {
        const res = await fetch(`${baseUrl}/api/v1/patients/appointments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${patientToken}`
            },
            body: JSON.stringify({
                doctorNameEn: 'Dr. K. Ramesh',
                hospitalId: 'GH_BHIMAVARAM',
                appointmentDate: tomorrowStr,
                slotTime: '10:00 AM',
                patientAge: 45,
                patientGender: 'Male',
                symptoms: 'Chest discomfort'
            })
        });

        assert.equal(res.status, 409);
        const data = await res.json();
        assert.ok(data.error.includes('already reserved') || data.error.includes('slot'));
    });

    test('15. Patient can cancel their own appointment and slot is freed', async () => {
        const res = await fetch(`${baseUrl}/api/v1/patients/appointments/${bookedAppointmentId}/cancel`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${patientToken}`
            }
        });

        assert.equal(res.status, 200);
        const data = await res.json();
        assert.equal(data.appointment.status, 'CANCELLED');
    });

    test('16. Patient can book the freed slot after cancellation', async () => {
        const res = await fetch(`${baseUrl}/api/v1/patients/appointments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${patientToken}`
            },
            body: JSON.stringify({
                doctorNameEn: 'Dr. K. Ramesh',
                hospitalId: 'GH_BHIMAVARAM',
                appointmentDate: tomorrowStr,
                slotTime: '10:00 AM',
                patientAge: 45,
                patientGender: 'Male',
                symptoms: 'Routine consultation'
            })
        });

        assert.equal(res.status, 201);
        const data = await res.json();
        assert.equal(data.appointment.slotTime, '10:00 AM');
    });

    test('17. Verified doctor login and live queue access', async () => {
        const loginRes = await fetch(`${baseUrl}/api/v1/auth/doctor/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'dr.ramesh@medislot.gov.in',
                password: 'DoctorPass@2026'
            })
        });

        assert.equal(loginRes.status, 200);
        const docAuth = await loginRes.json();
        const docToken = docAuth.token;

        const queueRes = await fetch(`${baseUrl}/api/v1/doctors/queue`, {
            headers: { 'Authorization': `Bearer ${docToken}` }
        });

        assert.equal(queueRes.status, 200);
        const queueData = await queueRes.json();
        assert.equal(queueData.doctorNameEn, 'Dr. K. Ramesh');
        assert.ok(typeof queueData.currentServingToken === 'number');
    });

    test('18. Admin dashboard stats returns complete platform analytics', async () => {
        const res = await fetch(`${baseUrl}/api/v1/admin/dashboard`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });

        assert.equal(res.status, 200);
        const stats = await res.json();
        assert.ok(stats.patients.total >= 1);
        assert.ok(stats.doctors.verified >= 1);
        assert.ok(stats.hospitals.total >= 4);
        assert.ok(Array.isArray(stats.recentAudits));
    });

    test('19. Unified login correctly detects DOCTOR role and credentials', async () => {
        const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'dr.ramesh@medislot.gov.in',
                password: 'DoctorPass@2026'
            })
        });

        assert.equal(res.status, 200);
        const data = await res.json();
        assert.equal(data.user.role, 'DOCTOR');
        assert.equal(data.user.verificationStatus, 'VERIFIED');
    });

    test('20. Unified login correctly detects PATIENT role and credentials', async () => {
        const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testPatientEmail,
                password: 'PatientPassword@2026'
            })
        });

        assert.equal(res.status, 200);
        const data = await res.json();
        assert.equal(data.user.role, 'PATIENT');
    });

    test('21. Admin can retrieve OPD doctors roster and queue counts', async () => {
        const res = await fetch(`${baseUrl}/api/v1/admin/opd/doctors`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });

        assert.equal(res.status, 200);
        const docs = await res.json();
        assert.ok(Array.isArray(docs));
        assert.ok(docs.length > 0);
        assert.ok(docs[0].todayStats !== undefined);
    });

    test('22. Admin can update doctor OPD duty status, room number, and consultation hours', async () => {
        const getDocsRes = await fetch(`${baseUrl}/api/v1/admin/opd/doctors`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const docs = await getDocsRes.json();
        const targetDoc = docs[0];

        const updateRes = await fetch(`${baseUrl}/api/v1/admin/opd/doctors/${targetDoc.userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                todayAvailable: 1,
                roomNo: 'Room 205 (OPD Super-Specialty)',
                consultationHours: '9:00 AM - 3:00 PM',
                slots: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM']
            })
        });

        assert.equal(updateRes.status, 200);
        const data = await updateRes.json();
        assert.equal(data.doctor.roomNo, 'Room 205 (OPD Super-Specialty)');
        assert.equal(data.doctor.consultationHours, '9:00 AM - 3:00 PM');
    });

    test('23. Emergency help endpoint is accessible without authentication (Phase Five)', async () => {
        const res = await fetch(`${baseUrl}/api/v1/public/emergency`);
        assert.equal(res.status, 200);
        const data = await res.json();
        assert.ok(Array.isArray(data.primaryHotlines));
        assert.ok(data.primaryHotlines.some(h => h.number === '108'));
        assert.ok(data.primaryHotlines.some(h => h.number === '104'));
        assert.ok(Array.isArray(data.hospitalEmergencyDesks));
        assert.ok(data.disclaimer.includes('108'));
    });

    let patientRescheduleApptId = '';

    test('24. Patient can book appointment and query live token status (Phase Five My Token)', async () => {
        const dateStr = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];
        await run("DELETE FROM appointments WHERE slotTime = '11:00 AM' AND appointmentDate = ?", [dateStr]);
        const bookRes = await fetch(`${baseUrl}/api/v1/patients/appointments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${patientToken}`
            },
            body: JSON.stringify({
                doctorNameEn: 'Dr. K. Ramesh',
                hospitalId: 'GH_BHIMAVARAM',
                appointmentDate: dateStr,
                slotTime: '11:00 AM',
                patientAge: 38,
                patientGender: 'Female',
                symptoms: 'Follow-up checkup'
            })
        });

        assert.equal(bookRes.status, 201);
        const bookData = await bookRes.json();
        assert.ok(bookData.appointment.id);
        patientRescheduleApptId = bookData.appointment.id;

        const statusRes = await fetch(`${baseUrl}/api/v1/patients/appointments/${patientRescheduleApptId}/token-status`, {
            headers: { 'Authorization': `Bearer ${patientToken}` }
        });
        assert.equal(statusRes.status, 200);
        const statusData = await statusRes.json();
        assert.equal(statusData.appointmentId, patientRescheduleApptId);
        assert.ok(typeof statusData.tokensAhead === 'number');
        assert.ok(typeof statusData.estimatedWaitMinutes === 'number');
    });

    test('25. Patient can reschedule an appointment to a new date and slot (Phase Four Rescheduling)', async () => {
        const newDateStr = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
        await run("DELETE FROM appointments WHERE slotTime = '11:30 AM' AND appointmentDate = ?", [newDateStr]);
        const resRes = await fetch(`${baseUrl}/api/v1/patients/appointments/${patientRescheduleApptId}/reschedule`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${patientToken}`
            },
            body: JSON.stringify({
                newDate: newDateStr,
                newSlotTime: '11:30 AM'
            })
        });

        assert.equal(resRes.status, 200);
        const resData = await resRes.json();
        assert.equal(resData.appointment.appointmentDate, newDateStr);
        assert.equal(resData.appointment.slotTime, '11:30 AM');
        assert.equal(resData.appointment.status, 'CONFIRMED');
    });

    test('26. Patient data isolation prevents accessing another patient\'s appointment (Phase Three Security)', async () => {
        // Register a second patient
        const secondPatientEmail = `second_patient_${Date.now()}@example.com`;
        const regRes = await fetch(`${baseUrl}/api/v1/auth/patient/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fullName: 'Another Patient',
                email: secondPatientEmail,
                phone: '9849556677',
                password: 'SecondPassword@2026',
                confirmPassword: 'SecondPassword@2026'
            })
        });
        assert.equal(regRes.status, 201);
        const secondData = await regRes.json();
        const secondToken = secondData.token;

        // Second patient tries to access first patient's appointment
        const accessRes = await fetch(`${baseUrl}/api/v1/patients/appointments/${patientRescheduleApptId}`, {
            headers: { 'Authorization': `Bearer ${secondToken}` }
        });
        assert.equal(accessRes.status, 403);

        // Second patient tries to cancel first patient's appointment
        const cancelRes = await fetch(`${baseUrl}/api/v1/patients/appointments/${patientRescheduleApptId}/cancel`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${secondToken}` }
        });
        assert.equal(cancelRes.status, 403);
    });

    test('27. Doctor queue state machine supports SKIPPED status (Phase Two B & Four)', async () => {
        const loginRes = await fetch(`${baseUrl}/api/v1/auth/doctor/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'dr.ramesh@medislot.gov.in',
                password: 'DoctorPass@2026'
            })
        });
        assert.equal(loginRes.status, 200);
        const docAuth = await loginRes.json();
        const docToken = docAuth.token;

        // Doctor issues a walk-in token
        const walkinRes = await fetch(`${baseUrl}/api/v1/doctors/queue/walkin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${docToken}`
            },
            body: JSON.stringify({
                patientName: 'Test Walkin Subject',
                patientPhone: '9848112233',
                patientAge: 40,
                patientGender: 'Male',
                symptoms: 'Fever and chills'
            })
        });
        assert.equal(walkinRes.status, 201);
        const walkinData = await walkinRes.json();
        const walkinId = walkinData.appointment.id;

        // Doctor updates status to SKIPPED
        const skipRes = await fetch(`${baseUrl}/api/v1/doctors/appointments/${walkinId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${docToken}`
            },
            body: JSON.stringify({
                status: 'SKIPPED'
            })
        });
        assert.equal(skipRes.status, 200);
        const skipData = await skipRes.json();
        assert.equal(skipData.appointment.status, 'SKIPPED');

        // Doctor calls next token
        const callNextRes = await fetch(`${baseUrl}/api/v1/doctors/queue/call-next`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${docToken}`
            },
            body: JSON.stringify({})
        });
        assert.equal(callNextRes.status, 200);
    });

    test('28. Doctor cross-tenant isolation prevents updating another physician\'s appointment', async () => {
        // Log in as Dr. S. Anitha
        const anithaLoginRes = await fetch(`${baseUrl}/api/v1/auth/doctor/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'dr.anitha@medislot.gov.in',
                password: 'DoctorPass@2026'
            })
        });
        assert.equal(anithaLoginRes.status, 200);
        const anithaAuth = await anithaLoginRes.json();
        const anithaToken = anithaAuth.token;

        // Dr. Anitha tries to modify Dr. Ramesh's appointment
        const res = await fetch(`${baseUrl}/api/v1/doctors/appointments/${patientRescheduleApptId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${anithaToken}`
            },
            body: JSON.stringify({ status: 'COMPLETED' })
        });
        assert.equal(res.status, 403);
    });

    test('29. Admin can suspend and activate patient accounts with audit trail (Phase Two C)', async () => {
        // Suspend patient
        const suspendRes = await fetch(`${baseUrl}/api/v1/admin/patients/${patientUserId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({ status: 'SUSPENDED' })
        });
        assert.equal(suspendRes.status, 200);
        const suspendData = await suspendRes.json();
        assert.equal(suspendData.patient.status, 'SUSPENDED');

        // Verify suspended patient login is blocked with 403
        const loginBlockedRes = await fetch(`${baseUrl}/api/v1/auth/patient/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testPatientEmail,
                password: 'PatientPassword@2026'
            })
        });
        assert.equal(loginBlockedRes.status, 403);

        // Reactivate patient
        const reactivateRes = await fetch(`${baseUrl}/api/v1/admin/patients/${patientUserId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({ status: 'ACTIVE' })
        });
        assert.equal(reactivateRes.status, 200);
        const reactivateData = await reactivateRes.json();
        assert.equal(reactivateData.patient.status, 'ACTIVE');
    });
});
