const Vehicle = require('../models/Vehicle');
const Violation = require('../models/Violation');
const { calculateRisk } = require('../services/riskService');

exports.updateVehicleData = async (req, res) => {
    try {
        const {
            latitude, longitude, speed, mqValue, flexValue, irStatus
        } = req.body;

        const vehicle = req.vehicle; // Attached by verifyDevice middleware

        // Update location and speed
        vehicle.lastLocation = { type: 'Point', coordinates: [longitude, latitude] };
        vehicle.lastSpeed = speed;

        // Calculate risk
        const { riskLevel, violations } = calculateRisk(req.body);
        vehicle.riskLevel = riskLevel;

        await vehicle.save();

        // If violations detected, record them
        if (violations.length > 0) {
            for (const type of violations) {
                await Violation.create({
                    vehicle: vehicle._id,
                    type,
                    severity: riskLevel,
                    location: { type: 'Point', coordinates: [longitude, latitude] }
                });
            }
        }

        // --- Real-time Socket Emission ---
        const io = req.app.get('socketio');
        const updatePayload = {
            deviceId: vehicle.deviceId,
            telemetry: {
                lat: latitude,
                long: longitude,
                speed: speed,
                riskLevel: riskLevel,
                violations: violations,
                timestamp: new Date()
            },
            sensors: {
                mq: mqValue,
                flex: flexValue,
                ir: irStatus
            }
        };

        // Broadcast to all clients (or room based on user/admin)
        io.emit('telemetryUpdate', updatePayload);

        if (violations.length > 0) {
            io.emit('newViolation', {
                vehicleId: vehicle.deviceId,
                violations,
                severity: riskLevel,
                location: [longitude, latitude]
            });
        }
        // ---------------------------------

        res.json({ message: "Update successful", riskLevel, violations });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getVehicleStatus = async (req, res) => {
    try {
        const vehicle = await Vehicle.findOne({ owner: req.user.id });
        if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
        res.json(vehicle);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
