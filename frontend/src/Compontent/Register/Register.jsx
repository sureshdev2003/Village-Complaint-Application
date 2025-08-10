import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI, utils } from '../../services/api';
import './Register.css';

const tamilNaduDistricts = [
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore",
  "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram",
  "Kanniyakumari", "Karur", "Krishnagiri", "Madurai", "Nagapattinam",
  "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram",
  "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur",
  "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur",
  "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore",
  "Viluppuram", "Virudhunagar"
];

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    village: '',
    district: '',
    pincode: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.register(formData);
      
      // Store authentication data
      utils.setAuthData(response.data);
      
      // Redirect to home page
      navigate('/');
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-body">
      <div className="background">
        <div className="cube"></div>
        <div className="cube delay"></div>
        <div className="cube delay2"></div>
      </div>

      <div className="glass-form">
        <h2>Register</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="6"
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
            pattern="[0-9]{10}"
            maxLength="10"
          />
          <input
            type="text"
            name="village"
            placeholder="Village Name"
            value={formData.village}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="pincode"
            placeholder="Pincode"
            value={formData.pincode}
            onChange={handleChange}
            required
            pattern="[0-9]{6}"
            maxLength="6"
          />

          <select
            name="district"
            required
            value={formData.district}
            onChange={handleChange}
          >
            <option value="">Select District</option>
            {tamilNaduDistricts.map((district, idx) => (
              <option key={idx} value={district}>{district}</option>
            ))}
          </select>

          <textarea
            name="address"
            placeholder="Full Address"
            value={formData.address}
            onChange={handleChange}
            rows="3"
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
          <p className="login-link">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
