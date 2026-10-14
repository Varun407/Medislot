const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');
const { authenticateToken } = require('../middleware/auth');

// Public directory and stats exploration
router.get('/stats', publicController.getPublicStats);
router.get('/hospitals', publicController.getHospitals);
router.get('/hospitals/:id', publicController.getHospitalById);
router.get('/departments', publicController.getDepartments);
router.get('/doctors', publicController.getDoctors);
router.get('/doctors/:id', publicController.getDoctorById);

// Strictly restrict grievance submission to authenticated users with an account
router.post('/grievances', authenticateToken, publicController.submitGrievance);

module.exports = router;
