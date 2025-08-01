// src/components/header.jsx
import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import './Header.css';


const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);
  const Navigate = useNavigate();

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
          <Link to="/complaints" onClick={closeMenu}>Complaints</Link>
          <Link to="/status" onClick={closeMenu}>Check Status</Link>
          <Link to="/about" onClick={closeMenu}>About</Link>
          <Link to="/contact" onClick={closeMenu}>Contact</Link>
        </nav>
        <button className='header-btn' onClick={()=>{Navigate('/login')}}>Login</button>
      </div>
    </header>
  );
};

export default Header;



