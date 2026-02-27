const Vehicle = require('../models/Vehicle');

async function verifyDevice(req, res, next) {
    const deviceKey = req.headers['x-device-key'];
    if (!deviceKey) return res.status(401).json({ message: 'Device key missing' });

    const vehicle = await Vehicle.findOne({ deviceSecretKey: deviceKey });
    if (!vehicle) return res.status(403).json({ message: 'Invalid device key' });

    req.vehicle = vehicle;
    next();
}

module.exports = verifyDevice;
