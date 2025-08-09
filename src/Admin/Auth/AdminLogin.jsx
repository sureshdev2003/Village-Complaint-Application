import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'union'
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Mock authentication - In real app, this would be API call
    const adminCredentials = {
      union: { username: 'union_admin', password: 'union123' },
      collector: { username: 'collector_admin', password: 'collector123' },
      cm: { username: 'cm_admin', password: 'cm123' }
    };

    const currentRole = adminCredentials[formData.role];

    if (formData.username === currentRole.username && formData.password === currentRole.password) {
      // Store admin session
      localStorage.setItem('adminRole', formData.role);
      localStorage.setItem('adminUsername', formData.username);
      
      // Redirect based on role
      switch (formData.role) {
        case 'union':
          navigate('/admin/union-office');
          break;
        case 'collector':
          navigate('/admin/collector-office');
          break;
        case 'cm':
          navigate('/admin/cm-office');
          break;
        default:
          navigate('/admin/dashboard');
      }
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <h2>Admin Login</h2>
        
        {error && (
          <div style={{ 
            background: '#f8d7da', 
            color: '#721c24', 
            padding: '10px', 
            borderRadius: '5px', 
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="admin-input-group">
            <label htmlFor="role">Admin Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="union">Union Office Admin</option>
              <option value="collector">Collector Office Admin</option>
              <option value="cm">CM Office Admin</option>
            </select>
          </div>

          <div className="admin-input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              required
            />
          </div>

          <div className="admin-input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
            />
          </div>

          <button type="submit" className="admin-login-btn">
            Login to Admin Panel
          </button>
        </form>

        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          background: '#e7f3ff', 
          borderRadius: '8px',
          fontSize: '14px',
          color: '#0066cc'
        }}>
          <strong>Demo Credentials:</strong><br />
          <strong>Union Office:</strong> union_admin / union123<br />
          <strong>Collector Office:</strong> collector_admin / collector123<br />
          <strong>CM Office:</strong> cm_admin / cm123
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 