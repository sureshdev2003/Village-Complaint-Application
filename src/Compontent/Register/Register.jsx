import React, { useState } from 'react';
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
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    village: '',
    pincode: '',
    district: '',
    subdistrict: '',
    panchayat: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted Data:', formData);
    // Backend call goes here
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
        <form onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="Full Name" required onChange={handleChange} />
          <input type="tel" name="phone" placeholder="Phone Number" required onChange={handleChange} />
          <input type="text" name="village" placeholder="Village Name" required onChange={handleChange} />
          <input type="text" name="pincode" placeholder="Pincode" required onChange={handleChange} />

          <select name="district" required value={formData.district} onChange={handleChange}>
            <option value="">Select District</option>
            {tamilNaduDistricts.map((district, idx) => (
              <option key={idx} value={district}>{district}</option>
            ))}
          </select>

          <input type="text" name="subdistrict" placeholder="Subdistrict" required onChange={handleChange} />
          <input type="text" name="panchayat" placeholder="Panchayat Name" required onChange={handleChange} />

          <button type="submit">Register</button>
          <p className="login-link">
            Already have an account? <a href="/login">Login</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
