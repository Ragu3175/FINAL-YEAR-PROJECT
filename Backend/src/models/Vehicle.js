const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    deviceId: { type: String, unique: true, required: true },
    deviceSecretKey: { type: String, required: true },
    vehicleNumber: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastLocation: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] } // [lon, lat]
    },
    lastSpeed: Number,
    lastAccel: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
        z: { type: Number, default: 0 }
    },
    lastGyro: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
        z: { type: Number, default: 0 }
    },
    lastWeight: { type: Number, default: 0 },
    riskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'ABOVE_MEDIUM', 'HIGH'], default: 'LOW' },
    isEmergency: { type: Boolean, default: false },
}, { timestamps: true });

vehicleSchema.index({ lastLocation: '2dsphere' });

module.exports = mongoose.model('Vehicle', vehicleSchema);
