const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/stats', publicController.getPublicStats);
router.get('/hospitals', publicController.getHospitals);
router.get('/hospitals/:id', publicController.getHospitalById);
router.get('/departments', publicController.getDepartments);
router.get('/doctors', publicController.getDoctors);
router.get('/doctors/:id', publicController.getDoctorById);
router.post('/grievances', publicController.submitGrievance);

module.exports = router;
