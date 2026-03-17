const Vehicle = require('../models/Vehicle');
const Violation = require('../models/Violation');
const User = require('../models/User');
const { calculateRisk, detectAccident } = require('../services/riskService');
const crypto = require('crypto');

exports.registerVehicle = async (req, res) => {
    try {
        const { vehicleNumber } = req.body;
        if (!vehicleNumber) {
            return res.status(400).json({ message: "Vehicle number is required" });
        }

        // Check if user already has a vehicle
        const existingVehicle = await Vehicle.findOne({ owner: req.user.id });
        if (existingVehicle) {
            return res.status(400).json({ message: "You already have a registered vehicle" });
        }

        // Generate unique credentials
        const deviceId = `SD-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        const deviceSecretKey = crypto.randomBytes(16).toString('hex');

        const vehicle = await Vehicle.create({
            deviceId,
            deviceSecretKey,
            vehicleNumber,
            owner: req.user.id
        });

        res.status(201).json({
            message: "Vehicle registered successfully",
            vehicle: {
                deviceId: vehicle.deviceId,
                deviceSecretKey: vehicle.deviceSecretKey,
                vehicleNumber: vehicle.vehicleNumber
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateVehicleData = async (req, res) => {
    try {
        const {
            latitude, longitude, speed, mqValue, flexValue, irStatus,
            accelX, accelY, accelZ, gyroX, gyroY, gyroZ, weight
        } = req.body;

        const vehicle = req.vehicle;

        // Update basic telemetry
        vehicle.lastLocation = { type: 'Point', coordinates: [longitude, latitude] };
        vehicle.lastSpeed = speed;

        // Update advanced IMU & Weight telemetry
        vehicle.lastAccel = { x: accelX || 0, y: accelY || 0, z: accelZ || 0 };
        vehicle.lastGyro = { x: gyroX || 0, y: gyroY || 0, z: gyroZ || 0 };
        vehicle.lastWeight = weight || 0;

        // Calculate and update risk
        const { riskLevel, violations } = calculateRisk(req.body);
        vehicle.riskLevel = riskLevel;

        // Detect Accident/Emergency
        const isEmergency = detectAccident(req.body);
        vehicle.isEmergency = isEmergency;

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
                isEmergency: isEmergency,
                accel: vehicle.lastAccel,
                gyro: vehicle.lastGyro,
                weight: weight,
                timestamp: new Date()
            },
            sensors: {
                mq: mqValue,
                flex: flexValue,
                ir: irStatus
            }
        };

        io.emit('telemetryUpdate', updatePayload);

        if (violations.length > 0) {
            io.emit('newViolation', {
                vehicleId: vehicle.deviceId,
                violations,
                severity: riskLevel,
                location: [longitude, latitude]
            });
        }

        // EMERGENCY NOTIFICATION LOGIC
        if (isEmergency) {
            // Find admins within 5km radius [lon, lat]
            const nearbyAdmins = await User.find({
                role: 'ADMIN',
                location: {
                    $near: {
                        $geometry: { type: "Point", coordinates: [longitude, latitude] },
                        $maxDistance: 5000 // 5km
                    }
                }
            });

            const alertPayload = {
                type: 'ACCIDENT_EMERGENCY',
                vehicleId: vehicle.deviceId,
                location: [longitude, latitude],
                severity: 'CRITICAL',
                message: `ALERT: Accident detected for vehicle ${vehicle.vehicleNumber}! Priority emergency response required.`
            };

            // Notify everyone for now, but in a real app we'd target specific admin socket rooms
            io.emit('emergencyAlert', alertPayload);
            
            console.log(`Emergency alert sent to ${nearbyAdmins.length} nearby admins.`);
        }

        res.json({ message: "Update successful", riskLevel, violations, isEmergency });
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
