import React, { useState, useEffect } from 'react';
// import { fleetData } from '../data/mockData'; // Assuming vehicleData is now fleetData or contains it
import { MapPin, Users, ShieldAlert, Activity, AlertCircle, History, Car, Navigation, AlertTriangle } from 'lucide-react';
import InteractiveMap from '../components/map/InteractiveMap';
import ChatAssistant from '../components/chat/ChatAssistant';
import { initiateSocketConnection, subscribeToTelemetry, subscribeToViolations, subscribeToEmergency, disconnectSocket } from '../services/socketService';
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
    const [vehicles, setVehicles] = useState([]);
    const [recentViolations, setRecentViolations] = useState([]);
    const [stats, setStats] = useState({
        totalVehicles: 0,
        highRiskVehicles: 0,
        alcoholViolations: 0,
        seatbeltViolations: 0,
        totalViolations: 0
    });
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [emergencyAlerts, setEmergencyAlerts] = useState([]);
    /* 
    // Mock Emergency Alert for testing/screenshots:
    const [emergencyAlerts, setEmergencyAlerts] = useState([{
        id: 'test-emergency-123',
        type: 'ACCIDENT_EMERGENCY',
        vehicleId: 'SD-TEST-9999',
        location: [77.5946, 12.9716],
        severity: 'CRITICAL',
        message: 'ALERT: Accident detected for vehicle TN-01-AB-1234! Priority emergency response required.',
        time: new Date().toLocaleTimeString()
    }]);
    */

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

        subscribeToEmergency((err, data) => {
            if (err) return;
            
            // Play alarm sound using Web Audio API (No external file needed)
            playEmergencySound();

            const newAlert = {
                id: Date.now(),
                ...data,
                time: new Date().toLocaleTimeString()
            };
            setEmergencyAlerts(prev => [newAlert, ...prev]);

            // Auto-hide alert after 30 seconds
            setTimeout(() => {
                setEmergencyAlerts(prev => prev.filter(a => a.id !== newAlert.id));
            }, 30000);
        });

        return () => disconnectSocket();
    }, []);

    const playEmergencySound = () => {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.5);
            
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 1);

            // Repeat twice for "Beep Beep"
            setTimeout(() => {
                const osc2 = audioCtx.createOscillator();
                osc2.type = 'sawtooth';
                osc2.frequency.setValueAtTime(440, audioCtx.currentTime);
                osc2.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.5);
                osc2.connect(gainNode);
                osc2.start();
                osc2.stop(audioCtx.currentTime + 1);
            }, 1200);
        } catch (e) {
            console.error("Audio playback failed", e);
        }
    };

    return (
        <div className="admin-container">
            {/* Emergency Alerts Overlay */}
            <div className="emergency-overlay">
                {emergencyAlerts.map(alert => (
                    <div key={alert.id} className="emergency-toast card critical heartbeat">
                        <div className="alert-header">
                            <ShieldAlert size={28} className="text-red" />
                            <div className="alert-title">
                                <h4>CRITICAL EMERGENCY</h4>
                                <span>{alert.time}</span>
                            </div>
                            <button onClick={() => setEmergencyAlerts(prev => prev.filter(a => a.id !== alert.id))}>×</button>
                        </div>
                        <div className="alert-body">
                            <p>{alert.message}</p>
                            <div className="alert-actions">
                                <button className="btn btn-danger" onClick={() => {
                                    // Could open map at this location
                                    setSelectedVehicle({ id: alert.vehicleId, location: alert.location });
                                }}>Track Vehicle</button>
                                <button className="btn btn-outline" onClick={() => setEmergencyAlerts(prev => prev.filter(a => a.id !== alert.id))}>Dismiss</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

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
