import React from 'react';
import './Login.css'; // Make sure you create this CSS file

const Login = () => {
  return (
    <div className="login-body">
      <div className="background">
        <div className="cube"></div>
        <div className="cube delay"></div>
        <div className="cube delay2"></div>
      </div>

      <div className="glass-container">
        <h2>Login</h2>
        <form>
          <div className="input-box">
            <input type="text" required />
            <label>Username</label>
          </div>

          <div className="input-box">
            <input type="password" required />
            <label>Password</label>
          </div>

          <button type="submit" className="login-btn">Login</button>
          <p className="register-link">
            Don't have an account? <a href="#">Register</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
