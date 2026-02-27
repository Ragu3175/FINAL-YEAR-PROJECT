const Vehicle = require('../models/Vehicle');
const Violation = require('../models/Violation');

exports.getFleetOverview = async (req, res) => {
    try {
        const totalVehicles = await Vehicle.countDocuments();
        const highRiskVehicles = await Vehicle.countDocuments({ riskLevel: 'HIGH' });

        const alcoholViolations = await Violation.countDocuments({ type: 'ALCOHOL' });
        const seatbeltViolations = await Violation.countDocuments({ type: 'SEATBELT' });

        res.json({
            totalVehicles,
            highRiskVehicles,
            alcoholViolations,
            seatbeltViolations
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find().populate('owner', 'name email');
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getRecentViolations = async (req, res) => {
    try {
        const violations = await Violation.find()
            .populate('vehicle', 'deviceId vehicleNumber')
            .sort({ timestamp: -1 })
            .limit(10);
        res.json(violations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
