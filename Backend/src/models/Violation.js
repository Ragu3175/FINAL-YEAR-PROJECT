const mongoose = require('mongoose');

const violationSchema = new mongoose.Schema({
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    type: { type: String, enum: ['ALCOHOL', 'OVERSPEED', 'SEATBELT', 'DROWSY', 'SMOKING', 'ACCIDENT'], required: true },
    severity: { type: String, enum: ['LOW', 'MEDIUM', 'ABOVE_MEDIUM', 'HIGH'], required: true },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true } // [lon, lat]
    },
    timestamp: { type: Date, default: Date.now }
});

violationSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Violation', violationSchema);
