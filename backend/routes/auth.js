import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';
import { validateUserRegistration, validateUserLogin } from '../utils/validation.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Register a new user
router.post('/register', validateUserRegistration, async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      address,
      village,
      district,
      pincode
    } = req.body;

    // Check if user already exists
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const [result] = await db.execute(
      `INSERT INTO users (name, email, password, phone, address, village, district, pincode) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, phone || null, address || null, village || null, district || null, pincode || null]
    );

    // Generate JWT token
    const token = jwt.sign(
      {
        id: result.insertId,
        email: email,
        name: name,
        isAdmin: false
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: result.insertId,
          name,
          email,
          phone,
          village,
          district
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
});

// Login user
router.post('/login', validateUserLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const [users] = await db.execute(
      'SELECT id, name, email, password, phone, village, district FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: false
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Remove password from response
    delete user.password;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
});

// Get current user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const [users] = await db.execute(
      `SELECT id, name, email, phone, address, village, district, state, pincode, 
              is_verified, created_at, updated_at 
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: users[0]
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const {
      name,
      phone,
      address,
      village,
      district,
      pincode
    } = req.body;

    // Update user profile
    await db.execute(
      `UPDATE users 
       SET name = ?, phone = ?, address = ?, village = ?, district = ?, pincode = ?
       WHERE id = ?`,
      [name, phone || null, address || null, village || null, district || null, pincode || null, req.user.id]
    );

    // Fetch updated user data
    const [users] = await db.execute(
      `SELECT id, name, email, phone, address, village, district, state, pincode
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: users[0]
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Change password
router.put('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get current user password
    const [users] = await db.execute(
      'SELECT password FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, users[0].password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await db.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedNewPassword, req.user.id]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify token endpoint
router.get('/verify', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    data: {
      user: req.user
    }
  });
});

export default router; 