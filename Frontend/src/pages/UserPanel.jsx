import React, { useState, useEffect } from 'react';
import { vehicleData as initialMockData } from '../data/mockData';
import { MapPin, Zap, Thermometer, Clock, Download, Trash2, ArrowRight, AlertTriangle, Plus, Key, Copy, Check } from 'lucide-react';
import TelemetryCharts from '../components/charts/TelemetryCharts';
import ChatAssistant from '../components/chat/ChatAssistant';
import { initiateSocketConnection, subscribeToTelemetry, disconnectSocket } from '../services/socketService';
import vehicleService from '../services/vehicleService';
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
    const [liveVehicleData, setLiveVehicleData] = useState(initialMockData);
    const { telemetry, sensors, timeSeries } = liveVehicleData;

    // Vehicle Registration State
    const [hasVehicle, setHasVehicle] = useState(true);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [registrationLoading, setRegistrationLoading] = useState(false);
    const [registeredVehicle, setRegisteredVehicle] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const checkVehicleStatus = async () => {
            try {
                const vehicle = await vehicleService.getVehicleStatus();
                if (!vehicle) {
                    setHasVehicle(false);
                } else {
                    setHasVehicle(true);
                    // Could also set initial data here based on DB
                }
            } catch (error) {
                console.error("Error checking vehicle status:", error);
            }
        };

        checkVehicleStatus();
        initiateSocketConnection();

        subscribeToTelemetry((err, data) => {
            if (err) return;

            setLiveVehicleData(prev => {
                const newTimeSeries = [{
                    time: new Date().toLocaleTimeString(),
                    speed: data.telemetry.speed.toFixed(2),
                    overspeeding: data.telemetry.violations.includes('OVERSPEED') ? "Yes" : "No",
                    seatbelt: data.telemetry.violations.includes('SEATBELT') ? "Not Worn" : "Worn",
                    eyeStatus: data.telemetry.violations.includes('DROWSY') ? "Closed" : "Open",
                    smoking: data.telemetry.violations.includes('SMOKING') ? "Yes" : "No",
                    alcohol: data.telemetry.violations.includes('ALCOHOL') ? "Detected" : "Normal",
                    risk: data.telemetry.riskLevel,
                    // Use actual XYZ if needed or keep existing mapping
                    x: data.sensors.accelX || 0,
                    y: data.sensors.accelY || 0,
                    z: data.sensors.accelZ || 0
                }, ...prev.timeSeries];

                return {
                    ...prev,
                    telemetry: {
                        ...prev.telemetry,
                        lat: data.telemetry.lat.toFixed(4),
                        long: data.telemetry.long.toFixed(4),
                        speed: `${data.telemetry.speed.toFixed(2)} km/h`,
                        status: data.telemetry.riskLevel,
                        accidentRisk: data.telemetry.riskLevel === 'HIGH' ? '90%' : '15%'
                    },
                    sensors: {
                        ir: data.sensors.ir === 0 ? "Drowsy" : "Normal",
                        mq: `${data.sensors.mq} ppm`,
                        flex: `${data.sensors.flex}`,
                        loadCell: `${data.sensors.weight || 0} kg`
                    },
                    timeSeries: newTimeSeries.slice(0, 50) // Keep history
                };
            });
        });

        return () => disconnectSocket();
    }, []);

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

    if (!hasVehicle && !registeredVehicle) {
        return (
            <div className="no-vehicle-container">
                <div className="setup-card">
                    <h2>Welcome to SafeDrive AI</h2>
                    <p>To get started, please register your vehicle to generate your hardware credentials.</p>
                    <button className="btn btn-primary lg" onClick={() => setShowRegisterModal(true)}>
                        <Plus size={20} />
                        Register New Vehicle
                    </button>
                </div>

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
    }

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
                                        <td className="risk-cell">
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
                        <div className="risk-value">{telemetry.accidentRisk}</div>
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
                        <button className="btn btn-outline">
                            <Trash2 size={16} />
                            Clear table
                        </button>
                        <button className="btn btn-primary">
                            <Download size={16} />
                            Download CSV
                        </button>
                    </div>
                </div>
            </div>

            <ChatAssistant role="user" />
        </div>
    );
};

export default UserPanel;
