import React, { useState, useEffect } from 'react';
import { fleetData } from '../data/mockData'; // Assuming vehicleData is now fleetData or contains it
import { MapPin, Users, ShieldAlert, Activity, AlertCircle, History, Car, Navigation, AlertTriangle } from 'lucide-react';
import InteractiveMap from '../components/map/InteractiveMap';
import ChatAssistant from '../components/chat/ChatAssistant';
import { initiateSocketConnection, subscribeToTelemetry, subscribeToViolations, disconnectSocket } from '../services/socketService';
import './AdminPanel.css';

const StatCard = ({ icon: Icon, label, value, color, change }) => (
    <div className="stat-card card">
        <div className="stat-content">
            <div className={`stat-icon ${color}`}>
                <Icon size={24} />
            </div>
            <div className="stat-details">
                <p className="stat-label">{label}</p>
                <h3 className="stat-value">{value}</h3>
                {change && <p className="stat-change positive">{change}</p>}
            </div>
        </div>
    </div>
);

const AdminPanel = () => {
    const [vehicles, setVehicles] = useState(fleetData.vehicles);
    const [recentViolations, setRecentViolations] = useState(fleetData.recentViolations);
    const [stats, setStats] = useState(fleetData.stats);
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    useEffect(() => {
        initiateSocketConnection();

        subscribeToTelemetry((err, data) => {
            if (err) return;
            setVehicles(prev => {
                const existingIndex = prev.findIndex(v => v.id === data.deviceId);
                const updatedVehicle = {
                    id: data.deviceId,
                    owner: data.ownerName || 'Live User',
                    speed: `${(data.telemetry?.speed || 0).toFixed(1)} km/h`,
                    status: data.telemetry?.riskLevel || 'Low',
                    location: [data.telemetry?.lat || 0, data.telemetry?.long || 0],
                    alcohol: data.telemetry?.violations?.includes('ALCOHOL') ? 'Positive' : 'Negative',
                    seatbelt: data.telemetry?.violations?.includes('SEATBELT') ? 'Not Worn' : 'Worn',
                };

                if (existingIndex >= 0) {
                    // Update existing vehicle
                    const newVehicles = [...prev];
                    newVehicles[existingIndex] = { ...newVehicles[existingIndex], ...updatedVehicle };
                    return newVehicles;
                } else {
                    // Add new vehicle dynamically
                    return [...prev, updatedVehicle];
                }
            });
        });

        subscribeToViolations((err, data) => {
            if (err) return;
            const newViolation = {
                id: Date.now(),
                vehicleId: data.vehicleId,
                type: data.violations.join(', '),
                severity: data.severity,
                time: "Just now",
                location: "Live Update"
            };
            setRecentViolations(prev => [newViolation, ...prev.slice(0, 9)]);

            // Update stats
            setStats(prev => ({
                ...prev,
                totalViolations: prev.totalViolations + data.violations.length,
                highRiskVehicles: data.severity === 'High' ? prev.highRiskVehicles + 1 : prev.highRiskVehicles,
                alcoholViolations: data.violations.includes('Alcohol') ? prev.alcoholViolations + 1 : prev.alcoholViolations,
                seatbeltViolations: data.violations.includes('Seatbelt') ? prev.seatbeltViolations + 1 : prev.seatbeltViolations,
            }));
        });

        return () => disconnectSocket();
    }, []);

    return (
        <div className="admin-container">
            <div className="admin-grid">
                <div className="admin-left">
                    {/* Real Map Integration */}
                    <div className="map-card card">
                        <div className="section-header">
                            <h3>Fleet Monitoring Map</h3>
                            <div className="map-legend">
                                <span className="dot green"></span> Normal
                                <span className="dot yellow"></span> Warning
                                <span className="dot red"></span> High Risk
                            </div>
                        </div>

                        <InteractiveMap
                            vehicles={vehicles}
                            onVehicleSelect={setSelectedVehicle}
                        />

                        {selectedVehicle && (
                            <div className="vehicle-info-popup card">
                                <div className="popup-header">
                                    <h4>{selectedVehicle.id}</h4>
                                    <button onClick={() => setSelectedVehicle(null)}>×</button>
                                </div>
                                <div className="popup-body">
                                    <p>Speed: <strong>{selectedVehicle.speed}</strong></p>
                                    <p>Alcohol: <span className={selectedVehicle.alcohol === 'Positive' ? 'text-red' : ''}>{selectedVehicle.alcohol}</span></p>
                                    <p>Seatbelt: <strong>{selectedVehicle.seatbelt}</strong></p>
                                    <div className={`risk-tag ${(selectedVehicle.risk || selectedVehicle.status || 'Low').toLowerCase()}`}>
                                        {selectedVehicle.risk || selectedVehicle.status || 'Low'} Risk
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Recent Violations Table */}
                    <div className="section card">
                        <div className="section-header">
                            <h3>Recent Violations</h3>
                        </div>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Vehicle</th>
                                        <th>Violation</th>
                                        <th>Time</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentViolations.map((v) => (
                                        <tr key={v.id}>
                                            <td>{v.id}</td>
                                            <td>{v.vehicleId}</td>
                                            <td>{v.type}</td>
                                            <td>{v.time}</td>
                                            <td>
                                                <span className={`badge badge-${(v.severity || v.status || 'low').toLowerCase()}`}>
                                                    {v.severity || v.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="admin-right">
                    {/* Violations Summary */}
                    <div className="summary-card card">
                        <div className="section-header">
                            <h3>Violation Summary</h3>
                        </div>
                        <div className="stats-list">
                            <div className="admin-stat-item">
                                <div className="stat-icon blue"><Car size={20} /></div>
                                <div className="stat-content">
                                    <span className="stat-val">{stats.totalVehicles}</span>
                                    <span className="stat-lbl">Total Vehicles</span>
                                </div>
                            </div>
                            <div className="admin-stat-item">
                                <div className="stat-icon red"><AlertTriangle size={20} /></div>
                                <div className="stat-content">
                                    <span className="stat-val">{stats.highRiskVehicles}</span>
                                    <span className="stat-lbl">High Risk</span>
                                </div>
                            </div>
                            <div className="admin-stat-item">
                                <div className="stat-icon yellow"><AlertCircle size={20} /></div>
                                <div className="stat-content">
                                    <span className="stat-val">{stats.alcoholViolations}</span>
                                    <span className="stat-lbl">Alcohol Violations</span>
                                </div>
                            </div>
                            <div className="admin-stat-item">
                                <div className="stat-icon blue"><Activity size={20} /></div>
                                <div className="stat-content">
                                    <span className="stat-val">{stats.seatbeltViolations}</span>
                                    <span className="stat-lbl">Seatbelt Violations</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="actions-card card">
                        <h3>Fleet Management</h3>
                        <p className="text-muted text-sm">Real-time alerts are enabled for all high-risk detections.</p>
                        <button className="btn btn-primary w-full mt-4">Generate Report</button>
                    </div>
                </div>
            </div>
            <ChatAssistant role="admin" />
        </div>
    );
};

export default AdminPanel;
