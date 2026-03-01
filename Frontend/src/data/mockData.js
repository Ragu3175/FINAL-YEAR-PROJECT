export const vehicleData = {
    telemetry: {
        lat: "12.9716",
        long: "77.5946",
        speed: "65 km/h",
        temp: "34°C",
        lastUpdate: "Just now",
        status: "ABOVE_MEDIUM",
        accidentRisk: "65%",
    },
    sensors: {
        ir: "Drowsy",
        mq: "0.02 ppm",
        flex: "850°",
        loadCell: "70 kg"
    },
    timeSeries: [
        { time: "1:43:54 PM", speed: "65.00", overspeeding: "No", seatbelt: "Worn", eyeStatus: "Closed", smoking: "No", alcohol: "Normal", risk: "ABOVE_MEDIUM", x: 0.1, y: 0.2, z: 9.8 },
        { time: "1:43:52 PM", speed: "68.00", overspeeding: "No", seatbelt: "Worn", eyeStatus: "Open", smoking: "No", alcohol: "Normal", risk: "LOW", x: 0.2, y: 0.1, z: 9.7 },
        { time: "1:43:50 PM", speed: "65.00", overspeeding: "No", seatbelt: "Worn", eyeStatus: "Closed", smoking: "No", alcohol: "Normal", risk: "ABOVE_MEDIUM", x: 0.5, y: -0.2, z: 9.9 },
        { time: "1:43:48 PM", speed: "70.00", overspeeding: "No", seatbelt: "Worn", eyeStatus: "Open", smoking: "No", alcohol: "Normal", risk: "LOW", x: -0.1, y: 0.3, z: 9.6 },
        { time: "1:43:46 PM", speed: "72.00", overspeeding: "No", seatbelt: "Worn", eyeStatus: "Open", smoking: "No", alcohol: "Normal", risk: "LOW", x: 0.3, y: 0.1, z: 9.8 },
        { time: "1:43:44 PM", speed: "70.00", overspeeding: "No", seatbelt: "Worn", eyeStatus: "Open", smoking: "No", alcohol: "Normal", risk: "LOW", x: 0.8, y: -0.5, z: 9.5 },
        { time: "1:43:42 PM", speed: "68.00", overspeeding: "No", seatbelt: "Worn", eyeStatus: "Open", smoking: "No", alcohol: "Normal", risk: "LOW", x: -0.2, y: 0.2, z: 9.9 },
        { time: "1:43:40 PM", speed: "65.00", overspeeding: "No", seatbelt: "Worn", eyeStatus: "Open", smoking: "No", alcohol: "Normal", risk: "LOW", x: 0.1, y: 0.1, z: 9.7 },
    ],
};

export const fleetData = {
    stats: {
        totalVehicles: 156,
        highRiskVehicles: 3,
        alcoholViolations: 12,
        seatbeltViolations: 8,
        totalViolations: 25 // Added for live counter
    },
    vehicles: [
        { id: "VD-789", deviceId: "VEHICLE_001", speed: "65 km/h", alcohol: "Negative", seatbelt: "Fastened", status: "Low", location: [12.9716, 77.5946] },
        { id: "VD-432", deviceId: "VEHICLE_002", speed: "110 km/h", alcohol: "Positive", seatbelt: "Unfastened", status: "High", location: [12.9816, 77.6046] },
        { id: "VD-101", deviceId: "VEHICLE_003", speed: "85 km/h", alcohol: "Negative", seatbelt: "Fastened", status: "Medium", location: [13.0016, 77.5846] },
    ],
    recentViolations: [
        { id: "V-1001", vehicleId: "VD-432", type: "Overspeeding", time: "10:05 AM", severity: "High" },
        { id: "V-1002", vehicleId: "VD-101", type: "Alcohol Detected", time: "10:08 AM", severity: "High" },
        { id: "V-1003", vehicleId: "VD-432", type: "No Seatbelt", time: "10:10 AM", severity: "Medium" },
    ]
};

export const chatResponses = {
    user: "Hello! I am your SafeDrive Assistant. How can I help you today?",
    admin: "3 high risk vehicles detected within 200m."
};
