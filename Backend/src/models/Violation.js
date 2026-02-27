const mongoose = require('mongoose');

const violationSchema = new mongoose.Schema({
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    type: { type: String, enum: ['ALCOHOL', 'OVERSPEED', 'SEATBELT', 'DROWSY', 'ACCIDENT'], required: true },
    severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], required: true },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true } // [lon, lat]
    },
    timestamp: { type: Date, default: Date.now }
});

violationSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Violation', violationSchema);
