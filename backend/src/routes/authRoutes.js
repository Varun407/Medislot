const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const {
    validatePatientRegistration,
    validateDoctorRegistration,
    validateLoginInput
} = require('../middleware/validation');

// Patient Auth
router.post('/patient/register', authLimiter, validatePatientRegistration, authController.patientRegister);
router.post('/patient/login', authLimiter, validateLoginInput, authController.patientLogin);

// Doctor Auth
router.post('/doctor/register', authLimiter, validateDoctorRegistration, authController.doctorRegister);
router.post('/doctor/login', authLimiter, validateLoginInput, authController.doctorLogin);

// Admin Auth (Dedicated hidden route)
router.post('/admin/login', authLimiter, validateLoginInput, authController.adminLogin);

// Unified Login (auto detects patient, doctor, or admin)
router.post('/login', authLimiter, validateLoginInput, authController.unifiedLogin);

// Shared Session Routes
router.post('/logout', authController.logout);
router.get('/me', authenticateToken, authController.getCurrentUser);

module.exports = router;
