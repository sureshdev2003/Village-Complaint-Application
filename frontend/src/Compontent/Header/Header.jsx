// src/components/header.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { utils } from '../../services/api';
import './Header.css';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for user or admin data in localStorage
    const userData = localStorage.getItem('user');
    const adminData = localStorage.getItem('admin');
    
    if (userData) {
      setUser(JSON.parse(userData));
    }
    if (adminData) {
      setAdmin(JSON.parse(adminData));
    }
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    utils.logout();
    setUser(null);
    setAdmin(null);
    navigate('/');
  };

  const handleLogin = () => {
    if (admin) {
      navigate('/admin/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="logo">
          <Link to="/" onClick={closeMenu}>Govt. Complaint System</Link>
        </div>
        <div className="menu-icon" onClick={toggleMenu}>
          ☰
        </div>
        <nav className={`nav-links ${menuOpen ? 'active' : ''}`}>
          <Link to="/" onClick={closeMenu}>Home</Link>
          <Link to="/status" onClick={closeMenu}>Check Status</Link>
          {user && (
            <Link to="/my-complaints" onClick={closeMenu}>My Complaints</Link>
          )}
          <Link to="/about" onClick={closeMenu}>About</Link>
          <Link to="/contact" onClick={closeMenu}>Contact</Link>
        </nav>
        <div className="header-buttons">
          {!user && !admin && (
            <>
              <button className='header-btn admin-btn' onClick={() => navigate('/admin/login')}>
                Admin
              </button>
              <button className='header-btn' onClick={() => navigate('/login')}>
                Login
              </button>
            </>
          )}
          
          {user && (
            <div className="user-section">
              <span className="user-name">Welcome, {user.name}</span>
              <button className='header-btn logout-btn' onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
          
          {admin && (
            <div className="admin-section">
              <span className="admin-name">Admin: {admin.name}</span>
              <button className='header-btn logout-btn' onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;



