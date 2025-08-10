import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI, utils } from '../../services/api';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
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
      const response = await authAPI.login(formData);
      
      // Store authentication data
      utils.setAuthData(response.data);
      
      // Redirect based on user type
      if (response.data.user) {
        // Regular user - redirect to home
        navigate('/');
      } else if (response.data.admin) {
        // Admin user - redirect to admin dashboard
        navigate('/admin/dashboard');
      }
    } catch (error) {
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-body">
      <div className="background">
        <div className="cube"></div>
        <div className="cube delay"></div>
        <div className="cube delay2"></div>
      </div>

      <div className="glass-container">
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="input-box">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <label>Email</label>
          </div>

          <div className="input-box">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <label>Password</label>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <p className="register-link">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
