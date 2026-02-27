const express = require('express');
const router = express.Router();
const { getFleetOverview, getAllVehicles, getRecentViolations } = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(authorize('ADMIN'));

router.get('/overview', getFleetOverview);
router.get('/vehicles', getAllVehicles);
router.get('/violations', getRecentViolations);

module.exports = router;
