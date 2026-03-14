import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, LayoutDashboard, LogOut, User, Info, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Don't show full navbar on login page
    if (location.pathname === '/login') return null;

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo" onClick={closeMenu}>
                    <Shield className="logo-icon" />
                    <span>SafeDrive AI</span>
                </Link>

                <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Toggle menu">
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                <div className={`navbar-links ${isMenuOpen ? 'open' : ''}`}>
                    <Link
                        to="/about"
                        className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
                        onClick={closeMenu}
                    >
                        <Info size={18} />
                        About
                    </Link>

                    <Link
                        to="/"
                        className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                        onClick={closeMenu}
                    >
                        <LayoutDashboard size={18} />
                        User Panel
                    </Link>

                    {user?.role === 'ADMIN' && (
                        <Link
                            to="/admin"
                            className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
                            onClick={closeMenu}
                        >
                            <Shield size={18} />
                            Admin Panel
                        </Link>
                    )}

                    {isAuthenticated ? (
                        <div className="nav-auth-section">
                            <div className="nav-user-info">
                                <User size={18} />
                                <span>{user?.name || 'User'}</span>
                            </div>

                            <button onClick={() => { handleLogout(); closeMenu(); }} className="logout-btn">
                                <LogOut size={18} />
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="nav-link login-link" onClick={closeMenu}>
                            <User size={18} />
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
