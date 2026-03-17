const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, './Backend/.env') });

// Define models directly to avoid path issues
const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: { type: String },
    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' }
});
// Check if model already exists to avoid OverwriteModelError
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const VehicleSchema = new mongoose.Schema({
    deviceId: String,
    deviceSecretKey: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});
const Vehicle = mongoose.models.Vehicle || mongoose.model('Vehicle', VehicleSchema);

async function findOwner() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const secretKey = "20d2d1ad663fc7988210ab7f8ecbc663";
        const vehicle = await Vehicle.findOne({ deviceSecretKey: secretKey }).populate('owner');

        if (vehicle) {
            console.log('--- Vehicle Found ---');
            console.log(`Device ID: ${vehicle.deviceId}`);
            if (vehicle.owner) {
                console.log(`Owner Name: ${vehicle.owner.name}`);
                console.log(`Owner Email: ${vehicle.owner.email}`);
            } else {
                console.log('Owner: None (Orphaned vehicle)');
            }
        } else {
            console.log('--- Vehicle NOT Found with that Secret Key ---');
            // List all vehicles just in case
            const allVehicles = await Vehicle.find().populate('owner');
            console.log('\n--- All Vehicles ---');
            allVehicles.forEach(v => {
                console.log(`ID: ${v.deviceId}, Key: ${v.deviceSecretKey}, Owner: ${v.owner ? v.owner.email : 'None'}`);
            });
        }

        mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error.message);
        mongoose.connection.close();
    }
}

findOwner();
