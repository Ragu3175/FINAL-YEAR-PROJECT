const express = require('express');
const router = express.Router();
const { updateVehicleData, getVehicleStatus, registerVehicle } = require('../controllers/vehicleController');
const authMiddleware = require('../middleware/authMiddleware');
const verifyDevice = require('../middleware/deviceMiddleware');

router.post('/register', authMiddleware, registerVehicle);
router.post('/update', verifyDevice, updateVehicleData);
router.get('/status', authMiddleware, getVehicleStatus);

module.exports = router;
