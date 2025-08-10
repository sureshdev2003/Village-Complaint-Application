import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';
import { validateAdminLogin } from '../utils/validation.js';
import { verifyAdminToken } from '../middleware/auth.js';

const router = express.Router();

// Admin login
router.post('/login', validateAdminLogin, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find admin by username
    const [admins] = await db.execute(
      `SELECT id, username, email, password, role, name, department, designation, 
              office_location, is_active 
       FROM admin_users WHERE username = ? AND is_active = true`,
      [username]
    );

    if (admins.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    const admin = admins[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        name: admin.name,
        isAdmin: true
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Remove password from response
    delete admin.password;

    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        token,
        admin
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during admin login'
    });
  }
});

// Get current admin profile
router.get('/profile', verifyAdminToken, async (req, res) => {
  try {
    const [admins] = await db.execute(
      `SELECT id, username, email, role, name, department, designation, 
              office_location, is_active, created_at, updated_at 
       FROM admin_users WHERE id = ?`,
      [req.admin.id]
    );

    if (admins.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      data: {
        admin: admins[0]
      }
    });
  } catch (error) {
    console.error('Admin profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update admin profile
router.put('/profile', verifyAdminToken, async (req, res) => {
  try {
    const {
      email,
      name,
      department,
      designation,
      office_location
    } = req.body;

    // Update admin profile
    await db.execute(
      `UPDATE admin_users 
       SET email = ?, name = ?, department = ?, designation = ?, office_location = ?
       WHERE id = ?`,
      [email, name, department || null, designation || null, office_location || null, req.admin.id]
    );

    // Fetch updated admin data
    const [admins] = await db.execute(
      `SELECT id, username, email, role, name, department, designation, office_location
       FROM admin_users WHERE id = ?`,
      [req.admin.id]
    );

    res.json({
      success: true,
      message: 'Admin profile updated successfully',
      data: {
        admin: admins[0]
      }
    });
  } catch (error) {
    console.error('Admin profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Change admin password
router.put('/change-password', verifyAdminToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get current admin password
    const [admins] = await db.execute(
      'SELECT password FROM admin_users WHERE id = ?',
      [req.admin.id]
    );

    if (admins.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admins[0].password);
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
      'UPDATE admin_users SET password = ? WHERE id = ?',
      [hashedNewPassword, req.admin.id]
    );

    res.json({
      success: true,
      message: 'Admin password changed successfully'
    });
  } catch (error) {
    console.error('Admin password change error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify admin token endpoint
router.get('/verify', verifyAdminToken, (req, res) => {
  res.json({
    success: true,
    message: 'Admin token is valid',
    data: {
      admin: req.admin
    }
  });
});

// Get admin dashboard stats
router.get('/dashboard-stats', verifyAdminToken, async (req, res) => {
  try {
    const adminRole = req.admin.role;
    let whereClause = '';
    
    // Filter complaints based on admin role
    if (adminRole !== 'super_admin') {
      whereClause = `WHERE current_office = '${adminRole}'`;
    }

    // Get total complaints count
    const [totalComplaints] = await db.execute(
      `SELECT COUNT(*) as total FROM complaints ${whereClause}`
    );

    // Get complaints by status
    const [complaintsByStatus] = await db.execute(
      `SELECT status, COUNT(*) as count 
       FROM complaints ${whereClause}
       GROUP BY status`
    );

    // Get recent complaints (last 7 days)
    const [recentComplaints] = await db.execute(
      `SELECT COUNT(*) as count 
       FROM complaints 
       ${whereClause} ${whereClause ? 'AND' : 'WHERE'} 
       created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
    );

    // Get complaints by urgency
    const [complaintsByUrgency] = await db.execute(
      `SELECT urgency, COUNT(*) as count 
       FROM complaints ${whereClause}
       GROUP BY urgency`
    );

    // Get complaints by category
    const [complaintsByCategory] = await db.execute(
      `SELECT cc.name as category, COUNT(c.id) as count 
       FROM complaint_categories cc
       LEFT JOIN complaints c ON cc.id = c.category_id ${whereClause ? `AND c.current_office = '${adminRole}'` : ''}
       GROUP BY cc.id, cc.name
       ORDER BY count DESC`
    );

    res.json({
      success: true,
      data: {
        totalComplaints: totalComplaints[0].total,
        recentComplaints: recentComplaints[0].count,
        complaintsByStatus: complaintsByStatus.reduce((acc, item) => {
          acc[item.status] = item.count;
          return acc;
        }, {}),
        complaintsByUrgency: complaintsByUrgency.reduce((acc, item) => {
          acc[item.urgency] = item.count;
          return acc;
        }, {}),
        complaintsByCategory: complaintsByCategory
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router; 