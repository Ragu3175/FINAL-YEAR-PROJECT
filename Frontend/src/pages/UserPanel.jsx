import React from 'react';
import { vehicleData } from '../data/mockData';
import { MapPin, Zap, Thermometer, Clock, Download, Trash2, ArrowRight, AlertTriangle } from 'lucide-react';
import TelemetryCharts from '../components/charts/TelemetryCharts';
import ChatAssistant from '../components/chat/ChatAssistant';
import { initiateSocketConnection, subscribeToTelemetry, disconnectSocket } from '../services/socketService';
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
    const [liveVehicleData, setLiveVehicleData] = React.useState(vehicleData);
    const { telemetry, sensors, timeSeries } = liveVehicleData;

    React.useEffect(() => {
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
