const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// All admin routes require authenticated ADMIN role
router.use(authenticateToken);
router.use(requireRole('ADMIN'));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/doctors', adminController.getDoctors);
router.patch('/doctors/:id/status', adminController.updateDoctorStatus);
router.get('/patients', adminController.getPatients);
router.patch('/patients/:id/status', adminController.updatePatientStatus);
router.get('/appointments', adminController.getAppointments);
router.get('/audit-logs', adminController.getAuditLogs);

// Centralized OPD Management for All Doctors
router.get('/opd/doctors', adminController.getOpdDoctors);
router.put('/opd/doctors/:id', adminController.updateDoctorOpdConfig);
router.get('/opd/queue', adminController.getDoctorOpdQueue);
router.post('/opd/queue/call-next', adminController.callNextOpdToken);
router.patch('/opd/queue/status', adminController.updateAppointmentStatus);

// Citizen Grievance Redressal
router.get('/grievances', adminController.getGrievances);
router.patch('/grievances/:id/status', adminController.updateGrievanceStatus);

module.exports = router;
