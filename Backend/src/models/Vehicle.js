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
    riskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'LOW' },
}, { timestamps: true });

vehicleSchema.index({ lastLocation: '2dsphere' });

module.exports = mongoose.model('Vehicle', vehicleSchema);
