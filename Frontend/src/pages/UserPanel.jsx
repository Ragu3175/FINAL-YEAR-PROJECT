import React, { useState, useEffect } from 'react';
// import { vehicleData as initialMockData } from '../data/mockData';

const initialVehicleData = {
    telemetry: {
        lat: "--",
        long: "--",
        speed: "--",
        temp: "--",
        lastUpdate: "Waiting for data...",
        status: "UNKNOWN",
        accidentRisk: "--",
    },
    sensors: {
        ir: "--",
        mq: "--",
        flex: "--",
        loadCell: "--"
    },
    timeSeries: []
};
import { MapPin, Zap, Thermometer, Clock, Download, Trash2, ArrowRight, AlertTriangle, Plus, Key, Copy, Check } from 'lucide-react';
import TelemetryCharts from '../components/charts/TelemetryCharts';
import ChatAssistant from '../components/chat/ChatAssistant';
import { initiateSocketConnection, subscribeToTelemetry, subscribeToEmergency, disconnectSocket } from '../services/socketService';
import vehicleService from '../services/vehicleService';
import { useAuth } from '../context/AuthContext';
import './UserPanel.css';

// Sub-components can be moved to separate files later if they grow
const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="stat-card card">
        <div className={`icon-box ${color}`}>
            <Icon size={20} />
        </div>
        <div className="stat-info">
            <span className="stat-label">{label}</span>
            <span className="stat-value">{value}</span>
        </div>
    </div>
);

const UserPanel = () => {
    const { user } = useAuth();
    const [liveVehicleData, setLiveVehicleData] = useState(initialVehicleData);
    const { telemetry, sensors, timeSeries } = liveVehicleData;

    // Vehicle Registration State
    const [hasVehicle, setHasVehicle] = useState(true);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [registrationLoading, setRegistrationLoading] = useState(false);
    const [registeredVehicle, setRegisteredVehicle] = useState(null);
    const [copied, setCopied] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false);
    const [emergencyStatus, setEmergencyStatus] = useState(false);


    // Simulation Loop
    useEffect(() => {
        let interval;
        if (isSimulating) {
            interval = setInterval(() => {
                const randomSpeed = Math.floor(Math.random() * 100);
                const randomMq = Math.floor(Math.random() * 4000);
                const randomFlex = Math.floor(Math.random() * 1000);
                const randomIr = Math.random() > 0.8 ? 1 : 0;

                const violations = [];
                if (randomSpeed > 80) violations.push('OVERSPEED');
                if (randomMq > 1800 && randomMq <= 3000) violations.push('ALCOHOL');
                if (randomMq > 3000) violations.push('SMOKING');
                if (randomFlex <= 340) violations.push('SEATBELT');
                if (randomIr === 1) violations.push('DROWSY');

                let riskLevel = 'LOW';
                const totalCount = violations.length;
                const hasSeatbelt = violations.includes('SEATBELT');
                const majors = hasSeatbelt ? totalCount - 1 : totalCount;

                if (totalCount === 0) riskLevel = 'LOW';
                else if (totalCount === 1 && hasSeatbelt) riskLevel = 'MEDIUM';
                else if (majors === 1) riskLevel = 'ABOVE_MEDIUM';
                else if (majors >= 2 || totalCount >= 3) riskLevel = 'HIGH';

                const mockDataUpdate = {
                    telemetry: {
                        lat: (12.9716 + (Math.random() - 0.5) * 0.01).toFixed(4),
                        long: (77.5946 + (Math.random() - 0.5) * 0.01).toFixed(4),
                        speed: randomSpeed,
                        riskLevel: riskLevel,
                        violations: violations,
                        temp: Math.floor(25 + Math.random() * 15)
                    },
                    sensors: {
                        mq: randomMq,
                        flex: randomFlex,
                        ir: randomIr,
                        weight: 70
                    }
                };

                // Trigger update similar to socket
                updateDashboard(mockDataUpdate);
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [isSimulating]);

    const updateDashboard = (data) => {
        if (!data || !data.telemetry) return;

        setLiveVehicleData(prev => {
            const violations = data.telemetry.violations || [];
            const sensors = data.sensors || {};
            const speed = data.telemetry.speed || 0;
            const riskLevel = data.telemetry.riskLevel || 'UNKNOWN';

            const newTimeSeries = [{
                time: new Date().toLocaleTimeString(),
                speed: speed.toFixed(2),
                overspeeding: violations.includes('OVERSPEED') ? "Yes" : "No",
                seatbelt: sensors.flex !== undefined ? (sensors.flex <= 340 ? "Not Worn" : "Worn") : (violations.includes('SEATBELT') ? "Not Worn" : "Worn"),
                eyeStatus: sensors.ir !== undefined ? (sensors.ir === 1 ? "Closed" : "Open") : (violations.includes('DROWSY') ? "Closed" : "Open"),
                smoking: violations.includes('SMOKING') ? "Yes" : "No",
                alcohol: violations.includes('ALCOHOL') ? "Detected" : "Normal",
                risk: riskLevel,
                x: (data.telemetry.accel?.x || 0).toFixed(2),
                y: (data.telemetry.accel?.y || 0).toFixed(2),
                z: (data.telemetry.accel?.z || 9.8).toFixed(2)
            }, ...prev.timeSeries];

            setEmergencyStatus(Boolean(data.telemetry.isEmergency));

            return {
                ...prev,
                telemetry: {
                    ...prev.telemetry,
                    lat: data.telemetry.lat || prev.telemetry.lat,
                    long: data.telemetry.long || prev.telemetry.long,
                    speed: `${speed.toFixed(2)} km/h`,
                    temp: data.telemetry.temp !== undefined ? `${data.telemetry.temp}°C` : (prev.telemetry.temp || 'N/A'),
                    status: riskLevel,
                    accidentRisk:
                        riskLevel === 'HIGH' ? '95%' :
                            riskLevel === 'ABOVE_MEDIUM' ? '65%' :
                                riskLevel === 'MEDIUM' ? '30%' : '5%',
                    lastUpdate: "Just now"
                },
                sensors: {
                    ir: sensors.ir === 1 ? "Drowsy" : (sensors.ir === 0 ? "Normal" : "--"),
                    mq: sensors.mq !== undefined ? `${sensors.mq} ppm` : '--',
                    flex: sensors.flex !== undefined ? `${sensors.flex}` : '--',
                    loadCell: `${data.telemetry.weight !== undefined ? data.telemetry.weight : (sensors.weight || 0)} kg`
                },
                timeSeries: newTimeSeries.slice(0, 50)
            };
        });
    };

    useEffect(() => {
        const checkVehicleStatus = async () => {
            if (!user || user.role !== 'USER') return;
            try {
                const vehicle = await vehicleService.getVehicleStatus();
                if (!vehicle) {
                    setHasVehicle(false);
                } else {
                    setHasVehicle(true);
                }
            } catch (error) {
                console.error("Error checking vehicle status:", error);
            }
        };

        checkVehicleStatus();
        initiateSocketConnection();

        subscribeToTelemetry((err, data) => {
            if (err) return;
            updateDashboard(data);
        });

        subscribeToEmergency((err, data) => {
            if (err) return;
            setEmergencyStatus(true);
        });

        return () => disconnectSocket();
    }, [user]);

    const handleRegister = async (e) => {
        e.preventDefault();
        setRegistrationLoading(true);
        try {
            const result = await vehicleService.registerVehicle(vehicleNumber);
            setRegisteredVehicle(result.vehicle);
            setHasVehicle(true);
        } catch (error) {
            alert(error.message);
        } finally {
            setRegistrationLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(registeredVehicle.deviceSecretKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (registeredVehicle) {
        return (
            <div className="success-container">
                <div className="setup-card success">
                    <div className="icon-success"><Check size={40} /></div>
                    <h2>Vehicle Registered Successfully!</h2>
                    <p>Please update your ESP32 `main.cpp` code with these credentials:</p>

                    <div className="credentials-box">
                        <div className="cred-row">
                            <span>Device ID:</span>
                            <code>{registeredVehicle.deviceId}</code>
                        </div>
                        <div className="cred-row">
                            <span>Secret Key:</span>
                            <code>{registeredVehicle.deviceSecretKey}</code>
                            <button className="btn-icon" onClick={copyToClipboard} title="Copy Key">
                                {copied ? <Check size={16} color="green" /> : <Copy size={16} />}
                            </button>
                        </div>
                    </div>

                    <p className="warning-text">⚠️ Keep this key secret. You will not be able to see it again.</p>
                    <button className="btn btn-primary" onClick={() => setRegisteredVehicle(null)}>
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-grid">
            <div className="dashboard-left">
                {/* Live Data Cards */}
                <div className="stats-grid">
                    <StatCard icon={MapPin} label="Latitude" value={telemetry.lat} color="blue" />
                    <StatCard icon={MapPin} label="Longitude" value={telemetry.long} color="blue" />
                    <StatCard icon={Zap} label="Speed" value={telemetry.speed} color="yellow" />
                    <StatCard icon={Thermometer} label="Temperature" value={telemetry.temp} color="red" />
                </div>

                {emergencyStatus && (
                    <div className="emergency-banner heartbeat">
                        <AlertTriangle size={24} />
                        <div>
                            <h4>CRITICAL EMERGENCY DETECTED</h4>
                            <p>Accident condition detected. Emergency services and nearby admins are being notified.</p>
                        </div>
                    </div>
                )}


                {/* Time-Series Table */}
                <div className="section card">
                    <div className="section-header">
                        <h3>Recent Time-Series</h3>
                        <span className="badge badge-low">Live</span>
                    </div>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Speed (km/h)</th>
                                    <th>Overspeeding</th>
                                    <th>Seatbelt</th>
                                    <th>Eye Status</th>
                                    <th>Smoking</th>
                                    <th>Alcohol (mg/dL)</th>
                                    <th>Accident Risk</th>
                                </tr>
                            </thead>
                            <tbody>
                                {timeSeries.map((row, idx) => (
                                    <tr key={idx}>
                                        <td>{row.time}</td>
                                        <td>{row.speed}</td>
                                        <td>{row.overspeeding}</td>
                                        <td>{row.seatbelt}</td>
                                        <td>{row.eyeStatus}</td>
                                        <td>{row.smoking}</td>
                                        <td>{row.alcohol}</td>
                                        <td className={`risk-cell ${row.risk.toLowerCase()}`}>
                                            <AlertTriangle size={14} className="risk-icon" />
                                            {row.risk}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sensor Readings */}
                <div className="section card">
                    <div className="section-header">
                        <h3>Additional Sensor Readings</h3>
                    </div>
                    <div className="sensor-grid">
                        <div className="sensor-item">
                            <span className="sensor-label">IR Sensor</span>
                            <span className="sensor-value status-normal">{sensors.ir}</span>
                        </div>
                        <div className="sensor-item">
                            <span className="sensor-label">MQ Sensor</span>
                            <span className="sensor-value">{sensors.mq}</span>
                        </div>
                        <div className="sensor-item">
                            <span className="sensor-label">Flex Sensor</span>
                            <span className="sensor-value">{sensors.flex}</span>
                        </div>
                        <div className="sensor-item">
                            <span className="sensor-label">Load Cell</span>
                            <span className="sensor-value">{sensors.loadCell}</span>
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <TelemetryCharts data={timeSeries} />
            </div>

            <div className="dashboard-right">
                {/* Summary Card */}
                <div className="summary-card card">
                    <div className="section-header">
                        <h3>Vehicle Summary</h3>
                    </div>
                    <div className="summary-stats">
                        <div className="summary-item">
                            <Clock size={16} />
                            <span>Last Update: {telemetry.lastUpdate}</span>
                        </div>
                        <div className="summary-item">
                            <Zap size={16} />
                            <span>Records kept: {timeSeries.length}</span>
                        </div>
                    </div>
                    <div className="risk-level card">
                        <span>Accident Risk</span>
                        <div className={`risk-value ${telemetry.status.toLowerCase()}`}>{telemetry.accidentRisk}</div>
                        <span className={`badge badge-${telemetry.status.toLowerCase()}`}>
                            {telemetry.status} Risk
                        </span>
                    </div>
                    <p className="note">Overspeed threshold: 80 km/h</p>
                </div>

                {/* Quick Actions */}
                <div className="actions-card card">
                    <h3>Quick Actions</h3>
                    <div className="action-buttons">
                        <button className="btn btn-primary" onClick={() => setShowRegisterModal(true)}>
                            <Plus size={16} />
                            Register New Vehicle
                        </button>
                        <button className="btn btn-outline">
                            <Trash2 size={16} />
                            Clear table
                        </button>
                        {/* <button
                            className={`btn ${isSimulating ? 'btn-danger' : 'btn-primary'}`}
                            onClick={() => setIsSimulating(!isSimulating)}
                        >
                            <Zap size={16} />
                            {isSimulating ? 'Stop Simulator' : 'Start Simulator'}
                        </button> */}
                    </div>
                </div>
            </div>

            <ChatAssistant role="user" />

            {/* Registration Modal overlay moved here so it works over the dashboard */}
            {showRegisterModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Register Vehicle</h3>
                        <form onSubmit={handleRegister}>
                            <div className="input-group">
                                <label>Vehicle Number Plate</label>
                                <input
                                    type="text"
                                    value={vehicleNumber}
                                    onChange={(e) => setVehicleNumber(e.target.value)}
                                    placeholder="e.g. TN-01-AB-1234"
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-outline" onClick={() => setShowRegisterModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={registrationLoading}>
                                    {registrationLoading ? 'Registering...' : 'Register'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserPanel;
