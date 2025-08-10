import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI, utils } from '../../services/api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await adminAPI.login(formData);
      
      // Store authentication data
      utils.setAuthData(response.data);
      
      // Redirect to admin dashboard
      navigate('/admin/dashboard');
    } catch (error) {
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <h2>Admin Login</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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

          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login to Admin Panel'}
          </button>
        </form>

        <div className="demo-credentials">
          <strong>Demo Credentials:</strong><br />
          <strong>Union Office:</strong> union_admin / password<br />
          <strong>Collector Office:</strong> collector_admin / password<br />
          <strong>CM Office:</strong> cm_admin / password<br />
          <strong>Super Admin:</strong> super_admin / password
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 