const express = require('express');
const router = express.Router();
const { updateVehicleData, getVehicleStatus } = require('../controllers/vehicleController');
const authMiddleware = require('../middleware/authMiddleware');
const verifyDevice = require('../middleware/deviceMiddleware');

router.post('/update', verifyDevice, updateVehicleData);
router.get('/status', authMiddleware, getVehicleStatus);

module.exports = router;
