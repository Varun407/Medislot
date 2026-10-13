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
router.get('/appointments', adminController.getAppointments);
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
