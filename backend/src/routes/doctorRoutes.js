const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { authenticateToken, requireRole, requireVerifiedDoctor } = require('../middleware/auth');

// All doctor routes require authenticated DOCTOR role
router.use(authenticateToken);
router.use(requireRole('DOCTOR'));

// Profile management available to any doctor (even pending)
router.get('/me', doctorController.getDoctorProfile);
router.patch('/me', doctorController.updateDoctorProfile);

// Clinical Queue and Availability actions REQUIRE administrative verification
router.get('/availability', requireVerifiedDoctor, doctorController.getDoctorAvailability);
router.put('/availability', requireVerifiedDoctor, doctorController.updateDoctorAvailability);
router.get('/queue', requireVerifiedDoctor, doctorController.getDoctorQueue);
router.post('/queue/call-next', requireVerifiedDoctor, doctorController.callNextToken);
router.put('/appointments/:id/status', requireVerifiedDoctor, doctorController.updateAppointmentStatus);
router.post('/queue/walkin', requireVerifiedDoctor, doctorController.issueWalkinToken);

module.exports = router;
