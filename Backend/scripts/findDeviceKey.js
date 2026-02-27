require('dotenv').config();
const mongoose = require('mongoose');
const Vehicle = require('../src/models/Vehicle');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        const vehicles = await Vehicle.find({});
        if (vehicles.length === 0) {
            console.log('No vehicles found in the database.');
        } else {
            console.log('--- Registered Vehicles ---');
            vehicles.forEach(v => {
                console.log(`Device ID: ${v.deviceId}`);
                console.log(`Vehicle Number: ${v.vehicleNumber}`);
                console.log(`Secret Key: ${v.deviceSecretKey}`);
                console.log('---------------------------');
            });
        }
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
