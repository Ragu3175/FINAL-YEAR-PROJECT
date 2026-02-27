export const vehicleData = {
    telemetry: {
        lat: "12.9716",
        long: "77.5946",
        speed: "65 km/h",
        temp: "34°C",
        lastUpdate: "2 mins ago",
        status: "Medium", // Low, Medium, High
        accidentRisk: "25%",
    },
    sensors: {
        ir: "Normal",
        mq: "0.02 ppm",
        flex: "15°",
        loadCell: "70 kg"
    },
    timeSeries: [
        { time: "1:43:54 PM", speed: "0.00", overspeeding: "No", seatbelt: "Not Worn", eyeStatus: "Open", smoking: "No", alcohol: "Normal", risk: "High", x: 0.1, y: 0.2, z: 9.8 },
        { time: "1:43:54 PM", speed: "0.00", overspeeding: "No", seatbelt: "Not Worn", eyeStatus: "Open", smoking: "No", alcohol: "Normal", risk: "High", x: 0.2, y: 0.1, z: 9.7 },
        { time: "1:43:35 PM", speed: "0.00", overspeeding: "No", seatbelt: "Not Worn", eyeStatus: "Open", smoking: "No", alcohol: "Normal", risk: "High", x: 0.5, y: -0.2, z: 9.9 },
        { time: "1:43:33 PM", speed: "0.00", overspeeding: "No", seatbelt: "Not Worn", eyeStatus: "Open", smoking: "No", alcohol: "Normal", risk: "High", x: -0.1, y: 0.3, z: 9.6 },
        { time: "1:43:31 PM", speed: "0.00", overspeeding: "No", seatbelt: "Not Worn", eyeStatus: "Open", smoking: "No", alcohol: "Normal", risk: "High", x: 0.3, y: 0.1, z: 9.8 },
        { time: "1:43:29 PM", speed: "0.00", overspeeding: "No", seatbelt: "Not Worn", eyeStatus: "Open", smoking: "No", alcohol: "Normal", risk: "High", x: 0.8, y: -0.5, z: 9.5 },
        { time: "1:43:27 PM", speed: "0.00", overspeeding: "No", seatbelt: "Not Worn", eyeStatus: "Open", smoking: "No", alcohol: "Normal", risk: "High", x: -0.2, y: 0.2, z: 9.9 },
        { time: "1:43:25 PM", speed: "0.00", overspeeding: "No", seatbelt: "Not Worn", eyeStatus: "Open", smoking: "No", alcohol: "Normal", risk: "High", x: 0.1, y: 0.1, z: 9.7 },
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
