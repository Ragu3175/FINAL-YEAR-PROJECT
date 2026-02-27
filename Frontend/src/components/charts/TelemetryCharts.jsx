import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import './TelemetryCharts.css';

const TelemetryCharts = ({ data }) => {
    return (
        <div className="charts-container">
            <div className="section card">
                <div className="section-header">
                    <h3>Acceleration</h3>
                    <span className="chart-subtitle">last 20 samples</span>
                </div>
                <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="time" hide />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="x" stroke="#3b82f6" strokeWidth={2} dot={false} name="X Axis" />
                            <Line type="monotone" dataKey="y" stroke="#10b981" strokeWidth={2} dot={false} name="Y Axis" />
                            <Line type="monotone" dataKey="z" stroke="#ef4444" strokeWidth={2} dot={false} name="Z Axis" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="section card">
                <div className="section-header">
                    <h3>Gyroscope</h3>
                    <span className="chart-subtitle">last 20 samples</span>
                </div>
                <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="time" hide />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="x" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Roll" />
                            <Line type="monotone" dataKey="y" stroke="#f59e0b" strokeWidth={2} dot={false} name="Pitch" />
                            <Line type="monotone" dataKey="z" stroke="#06b6d4" strokeWidth={2} dot={false} name="Yaw" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default TelemetryCharts;
