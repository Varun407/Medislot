const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');
const { initDatabase, run, get } = require('../src/config/db');

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
});

describe('Medislot Backend Comprehensive Tests', () => {

    test('1. Health check returns healthy status', async () => {
        const res = await fetch(`${baseUrl}/api/health`);
        assert.equal(res.status, 200);
        const data = await res.json();
        assert.equal(data.status, 'healthy');
    });

    test('2. Public content is accessible and unauthenticated grievance submission is rejected with 401', async () => {
        const resHosp = await fetch(`${baseUrl}/api/v1/public/hospitals`);
        assert.equal(resHosp.status, 200);
        const hospitals = await resHosp.json();
        assert.ok(Array.isArray(hospitals));
        assert.ok(hospitals.length >= 4);

        const resDepts = await fetch(`${baseUrl}/api/v1/public/departments`);
        assert.equal(resDepts.status, 200);
        const depts = await resDepts.json();
        assert.ok(Array.isArray(depts));
        assert.ok(depts.length >= 9);

        // Submitting grievance without an account must be rejected with 401
        const resGrv = await fetch(`${baseUrl}/api/v1/public/grievances`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                citizenName: 'Anonymous Citizen',
                citizenPhone: '9848123456',
                message: 'Testing unauthenticated rejection'
            })
        });
        assert.equal(resGrv.status, 401);
        const dataGrv = await resGrv.json();
        assert.ok(dataGrv.error.includes('Authentication required'));
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
});
