require('dotenv').config();
const mongoose = require('mongoose');
const Vehicle = require('../src/models/Vehicle');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        // Find existing test vehicle
        const existing = await Vehicle.findOne({ deviceId: 'VEHICLE_001' });
        if (existing) {
            console.log('--- Test Vehicle Info ---');
            console.log(`Device ID: ${existing.deviceId}`);
            console.log(`Secret Key: ${existing.deviceSecretKey}`);
            console.log('-------------------------');
            process.exit();
        }

        const testVehicle = new Vehicle({
            deviceId: 'VEHICLE_001',
            deviceSecretKey: 'SAFE_DRIVE_KEY_2026',
            vehicleNumber: 'TN-01-SD-2026',
            lastLocation: { type: 'Point', coordinates: [77.5946, 12.9716] },
            lastSpeed: 0,
            riskLevel: 'LOW'
        });

        await testVehicle.save();
        console.log('Test vehicle created successfully!');
        console.log('--- Test Vehicle Info ---');
        console.log(`Device ID: ${testVehicle.deviceId}`);
        console.log(`Secret Key: ${testVehicle.deviceSecretKey}`);
        console.log('-------------------------');
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
