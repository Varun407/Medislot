const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const {
    validatePatientRegistration,
    validatePatientLogin,
    validateResetMpin,
    validateDoctorRegistration,
    validateLoginInput
} = require('../middleware/validation');

// Patient Auth (Mobile + 6-Digit MPIN)
router.post('/patient/register', authLimiter, validatePatientRegistration, authController.patientRegister);
router.post('/patient/login', authLimiter, validatePatientLogin, authController.patientLogin);
router.post('/patient/reset-mpin', authLimiter, validateResetMpin, authController.resetMpin);

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
