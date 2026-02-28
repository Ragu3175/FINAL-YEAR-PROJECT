import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, LayoutDashboard, LogOut, User, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Don't show full navbar on login page
    if (location.pathname === '/login') return null;

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <Shield className="logo-icon" />
                    <span>SafeDrive AI</span>
                </Link>

                <div className="navbar-links">
                    <Link
                        to="/about"
                        className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
                    >
                        <Info size={18} />
                        About
                    </Link>

                    {isAuthenticated && (
                        <>
                            <Link
                                to="/"
                                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                            >
                                <LayoutDashboard size={18} />
                                User Panel
                            </Link>
                            {user?.role === 'ADMIN' && (
                                <Link
                                    to="/admin"
                                    className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
                                >
                                    <Shield size={18} />
                                    Admin Panel
                                </Link>
                            )}

                            <div className="nav-user-info">
                                <User size={18} />
                                <span>{user?.name || 'User'}</span>
                            </div>

                            <button onClick={handleLogout} className="logout-btn">
                                <LogOut size={18} />
                                Logout
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
