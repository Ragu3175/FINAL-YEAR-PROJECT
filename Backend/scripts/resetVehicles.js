// Temporary script to reset vehicle for testing
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Vehicle = require('../src/models/Vehicle');

async function resetVehicles() {
    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        const result = await Vehicle.deleteMany({});
        console.log(`Deleted ${result.deletedCount} vehicles.`);

        mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error.message);
        mongoose.connection.close();
    }
}

resetVehicles();
