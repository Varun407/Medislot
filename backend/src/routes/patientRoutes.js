const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// All routes here require authenticated PATIENT
router.use(authenticateToken);
router.use(requireRole('PATIENT'));

router.get('/me', patientController.getProfile);
router.patch('/me', patientController.updateProfile);
router.get('/appointments', patientController.getMyAppointments);
router.post('/appointments', patientController.bookAppointment);
router.post('/appointments/:id/cancel', patientController.cancelMyAppointment);

module.exports = router;
