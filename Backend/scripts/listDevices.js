const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Vehicle = require('../src/models/Vehicle');

async function listDevices() {
    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error("MONGO_URI is not defined in the .env file");
        }
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        const vehicles = await Vehicle.find().select('deviceId deviceSecretKey vehicleNumber');

        if (vehicles.length === 0) {
            console.log('\n--- No vehicles found in database ---');
        } else {
            console.log('\n--- Registered Vehicles ---');
            vehicles.forEach(v => {
                console.log(`Vehicle: ${v.vehicleNumber}`);
                console.log(`Device ID: ${v.deviceId}`);
                console.log(`Secret Key: ${v.deviceSecretKey}`);
                console.log('---------------------------');
            });
        }

        mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error.message);
        mongoose.connection.close();
    }
}

listDevices();
