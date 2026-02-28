import React from 'react';
import {
    Shield,
    Cpu,
    Database,
    Globe,
    Wifi,
    AlertTriangle,
    Map,
    Lock,
    Zap,
    Activity,
    Car,
    Eye,
    Wind,
    Gauge,
    CheckCircle,
    TrendingUp,
    Server,
    Code2,
    Layers,
} from 'lucide-react';
import './AboutPage.css';

const AboutPage = () => {
    const techStack = [
        { icon: <Cpu size={24} />, label: 'ESP32', desc: 'Microcontroller with built-in Wi-Fi' },
        { icon: <Server size={24} />, label: 'Node.js + Express', desc: 'RESTful backend API' },
        { icon: <Database size={24} />, label: 'MongoDB Atlas', desc: 'Cloud NoSQL database' },
        { icon: <Code2 size={24} />, label: 'React.js + Vite', desc: 'Modern frontend framework' },
        { icon: <Wifi size={24} />, label: 'Socket.io', desc: 'Real-time bidirectional events' },
        { icon: <Map size={24} />, label: 'Leaflet', desc: 'Interactive fleet map' },
    ];

    const sensors = [
        { icon: <Activity size={20} />, name: 'MPU6050', desc: 'Accelerometer & Gyroscope – detects sudden braking, sharp turns, crash impacts' },
        { icon: <Globe size={20} />, name: 'NEO-6M GPS', desc: 'Accurate live latitude/longitude tracking and speed measurement' },
        { icon: <Wind size={20} />, name: 'MQ3 Alcohol Sensor', desc: 'Detects alcohol presence in the cabin to prevent drunk driving' },
        { icon: <Eye size={20} />, name: 'IR Sensor', desc: 'Monitors driver eye status to detect drowsiness' },
        { icon: <Car size={20} />, name: 'Flex & Load Cell', desc: 'Ensures seatbelt compliance and passenger presence detection' },
    ];

    const features = [
        {
            icon: <Lock size={22} />,
            title: 'Secure Login-First Access',
            desc: 'A ProtectedRoute wrapper in React ensures only authenticated users with valid JWT tokens can access dashboards.',
        },
        {
            icon: <Shield size={22} />,
            title: 'Vehicle Registration & Hardware Provisioning',
            desc: 'Backend generates a unique Device ID and cryptographic Secret Key to bridge the software account with physical ESP32 hardware.',
        },
        {
            icon: <Zap size={22} />,
            title: 'Real-Time Telemetry & Risk Analysis',
            desc: 'The custom riskService.js dynamically calculates a Risk Level (Low/Medium/High) from incoming ESP32 sensor payloads every 1.5 seconds.',
        },
        {
            icon: <Map size={22} />,
            title: 'Interactive Live Fleet Map',
            desc: 'Admin dashboard uses Leaflet to plot all vehicles with color-coded risk markers (Green/Yellow/Red) updated live via Socket.io.',
        },
    ];

    const challenges = [
        {
            problem: 'MongoDB ECONNREFUSED',
            solution: 'Debugged environment variables; fixed URI formatting issues and corrected connection string parsing in the .env file.',
            color: '#ef4444',
        },
        {
            problem: '403 Errors on Hardware Registration',
            solution: 'Fixed aggressive JWT token expiry (15m) and a JWT_SECRET mismatch in authMiddleware.js, aligning env variables.',
            color: '#eab308',
        },
        {
            problem: 'Real-Time Map Not Showing New Vehicles',
            solution: 'Rewrote React state in AdminPanel.jsx to dynamically append new vehicles when incoming Socket.io deviceId is not found.',
            color: '#3b82f6',
        },
        {
            problem: 'Mixed Content HTTPS vs HTTP',
            solution: 'Replaced all hardcoded localhost URLs with VITE_API_URL env variables, enabling secure HTTPS communication on Vercel.',
            color: '#22c55e',
        },
    ];

    return (
        <div className="about-page">
            {/* Hero Section */}
            <section className="about-hero">
                <div className="about-hero-glow" />
                <div className="about-hero-content">
                    <div className="about-hero-badge">
                        <Shield size={16} />
                        Final Year Project — 2026
                    </div>
                    <h1 className="about-hero-title">
                        SafeDrive <span className="about-hero-accent">AI</span>
                    </h1>
                    <p className="about-hero-subtitle">
                        Intelligent Fleet &amp; Vehicle Monitoring System
                    </p>
                    <p className="about-hero-desc">
                        A comprehensive, real-time IoT platform that integrates custom ESP32 hardware with a modern MERN stack
                        web application to detect and visualize critical telemetry — enhancing road safety and preventing
                        accidents caused by overspeeding, drowsy driving, and drunk driving.
                    </p>
                    <div className="about-stats-row">
                        <div className="about-stat">
                            <span className="about-stat-value">5</span>
                            <span className="about-stat-label">Sensors</span>
                        </div>
                        <div className="about-stat">
                            <span className="about-stat-value">1.5s</span>
                            <span className="about-stat-label">Update Rate</span>
                        </div>
                        <div className="about-stat">
                            <span className="about-stat-value">3</span>
                            <span className="about-stat-label">Risk Levels</span>
                        </div>
                        <div className="about-stat">
                            <span className="about-stat-value">Live</span>
                            <span className="about-stat-label">Fleet Map</span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="about-container">
                {/* Architecture Section */}
                <section className="about-section">
                    <div className="about-section-header">
                        <Layers size={24} className="about-section-icon" />
                        <h2>System Architecture</h2>
                    </div>
                    <p className="about-section-intro">
                        The project follows a distributed <strong>Client-Server-Hardware</strong> architecture
                        divided into three tiers working seamlessly together.
                    </p>
                    <div className="about-arch-grid">
                        <div className="about-arch-card hardware">
                            <div className="about-arch-card-top">
                                <Cpu size={28} />
                                <h3>Hardware Tier</h3>
                                <span className="about-arch-tag">ESP32 C++ Firmware</span>
                            </div>
                            <p>The ESP32 microcontroller collects data from 5 sensors, formats it into a JSON payload, and transmits it over Wi-Fi via HTTP POST to the cloud backend every 1.5 seconds.</p>
                            <ul className="about-arch-list">
                                {sensors.map((s, i) => (
                                    <li key={i}>
                                        <span className="about-arch-list-icon">{s.icon}</span>
                                        <div>
                                            <strong>{s.name}</strong>
                                            <span>{s.desc}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="about-arch-card backend">
                            <div className="about-arch-card-top">
                                <Server size={28} />
                                <h3>Backend Tier</h3>
                                <span className="about-arch-tag">Node.js · Express · MongoDB</span>
                            </div>
                            <p>The central nervous system of the platform. It handles authentication, vehicle management, real-time processing, and database operations.</p>
                            <ul className="about-arch-list">
                                <li>
                                    <span className="about-arch-list-icon"><Lock size={18} /></span>
                                    <div><strong>JWT Auth</strong><span>Secure login & role-based access control</span></div>
                                </li>
                                <li>
                                    <span className="about-arch-list-icon"><Activity size={18} /></span>
                                    <div><strong>Risk Engine</strong><span>riskService.js — analyzes speed, alcohol, seatbelt & IR data</span></div>
                                </li>
                                <li>
                                    <span className="about-arch-list-icon"><Wifi size={18} /></span>
                                    <div><strong>Socket.io</strong><span>Real-time broadcasts to all connected clients</span></div>
                                </li>
                                <li>
                                    <span className="about-arch-list-icon"><Database size={18} /></span>
                                    <div><strong>MongoDB Atlas</strong><span>Cloud storage for users, vehicles & violation logs</span></div>
                                </li>
                            </ul>
                        </div>

                        <div className="about-arch-card frontend">
                            <div className="about-arch-card-top">
                                <Globe size={28} />
                                <h3>Frontend Tier</h3>
                                <span className="about-arch-tag">React.js · Vite · Tailwind CSS</span>
                            </div>
                            <p>A highly responsive, premium web dashboard providing two distinct role-based views with glassmorphic dark-mode aesthetics.</p>
                            <ul className="about-arch-list">
                                <li>
                                    <span className="about-arch-list-icon"><Gauge size={18} /></span>
                                    <div><strong>User Panel</strong><span>Live telemetry, sensor charts, driving history</span></div>
                                </li>
                                <li>
                                    <span className="about-arch-list-icon"><Map size={18} /></span>
                                    <div><strong>Admin Panel</strong><span>Global fleet map with live risk-status markers</span></div>
                                </li>
                                <li>
                                    <span className="about-arch-list-icon"><TrendingUp size={18} /></span>
                                    <div><strong>Recharts</strong><span>Time-series data visualization for telemetry</span></div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Key Features */}
                <section className="about-section">
                    <div className="about-section-header">
                        <Zap size={24} className="about-section-icon" />
                        <h2>Key Features</h2>
                    </div>
                    <div className="about-features-grid">
                        {features.map((f, i) => (
                            <div key={i} className="about-feature-card">
                                <div className="about-feature-icon">{f.icon}</div>
                                <h3>{f.title}</h3>
                                <p>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Tech Stack */}
                <section className="about-section">
                    <div className="about-section-header">
                        <Code2 size={24} className="about-section-icon" />
                        <h2>Technology Stack</h2>
                    </div>
                    <div className="about-tech-grid">
                        {techStack.map((t, i) => (
                            <div key={i} className="about-tech-card">
                                <div className="about-tech-icon">{t.icon}</div>
                                <h4>{t.label}</h4>
                                <p>{t.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Challenges */}
                <section className="about-section">
                    <div className="about-section-header">
                        <AlertTriangle size={24} className="about-section-icon" />
                        <h2>Challenges &amp; Solutions</h2>
                    </div>
                    <div className="about-challenges-grid">
                        {challenges.map((c, i) => (
                            <div key={i} className="about-challenge-card" style={{ borderLeftColor: c.color }}>
                                <div className="about-challenge-header">
                                    <span className="about-challenge-dot" style={{ background: c.color }} />
                                    <h4>{c.problem}</h4>
                                </div>
                                <div className="about-challenge-solution">
                                    <CheckCircle size={16} className="about-solution-icon" />
                                    <p>{c.solution}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Conclusion */}
                <section className="about-conclusion">
                    <Shield size={40} className="about-conclusion-icon" />
                    <h2>Project Conclusion</h2>
                    <p>
                        SafeDrive AI successfully bridges <strong>embedded C++ hardware engineering</strong> with{' '}
                        <strong>modern, real-time web development</strong>. By overcoming significant networking,
                        state management, and real-time synchronization challenges, the project delivers a
                        professional, scalable prototype capable of actively monitoring fleets, detecting dangerous
                        behaviors, and ultimately promoting safer roads.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default AboutPage;
