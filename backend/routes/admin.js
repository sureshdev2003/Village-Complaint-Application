import express from 'express';
import db from '../config/database.js';
import { verifyAdminToken, checkAdminRole } from '../middleware/auth.js';
import { validateStatusUpdate, validateComplaintAssignment } from '../utils/validation.js';

const router = express.Router();

// Get all complaints for admin (filtered by role)
router.get('/complaints', verifyAdminToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, urgency, category, search } = req.query;
    const offset = (page - 1) * limit;
    const adminRole = req.admin.role;

    let whereClause = 'WHERE 1=1';
    let queryParams = [];

    // Filter by admin role (except super_admin who can see all)
    if (adminRole !== 'super_admin') {
      whereClause += ' AND c.current_office = ?';
      queryParams.push(adminRole);
    }

    if (status) {
      whereClause += ' AND c.status = ?';
      queryParams.push(status);
    }

    if (urgency) {
      whereClause += ' AND c.urgency = ?';
      queryParams.push(urgency);
    }

    if (category) {
      whereClause += ' AND cc.name = ?';
      queryParams.push(category);
    }

    if (search) {
      whereClause += ' AND (c.title LIKE ? OR c.description LIKE ? OR c.complaint_id LIKE ?)';
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    // Get total count
    const [countResult] = await db.execute(
      `SELECT COUNT(*) as total 
       FROM complaints c
       LEFT JOIN complaint_categories cc ON c.category_id = cc.id
       ${whereClause}`,
      queryParams
    );

    // Get complaints with details
    const [complaints] = await db.execute(
      `SELECT c.id, c.complaint_id, c.title, c.description, c.location, c.urgency, 
              c.status, c.current_office, c.contact_name, c.contact_phone, 
              c.contact_email, c.is_anonymous, c.images, c.created_at, c.updated_at,
              cc.name as category_name,
              u.name as user_name, u.email as user_email,
              au.name as assigned_to_name, au.designation as assigned_to_designation
       FROM complaints c
       LEFT JOIN complaint_categories cc ON c.category_id = cc.id
       LEFT JOIN users u ON c.user_id = u.id
       LEFT JOIN admin_users au ON c.assigned_to = au.id
       ${whereClause}
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, parseInt(limit), parseInt(offset)]
    );

    res.json({
      success: true,
      data: {
        complaints,
        pagination: {
          total: countResult[0].total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Admin complaints fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get single complaint details for admin
router.get('/complaints/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const adminRole = req.admin.role;

    let whereClause = 'WHERE c.id = ?';
    let queryParams = [id];

    // Filter by admin role (except super_admin)
    if (adminRole !== 'super_admin') {
      whereClause += ' AND c.current_office = ?';
      queryParams.push(adminRole);
    }

    const [complaints] = await db.execute(
      `SELECT c.id, c.complaint_id, c.title, c.description, c.location, c.urgency, 
              c.status, c.current_office, c.contact_name, c.contact_phone, 
              c.contact_email, c.is_anonymous, c.images, c.created_at, c.updated_at,
              cc.name as category_name, cc.description as category_description,
              u.name as user_name, u.email as user_email, u.phone as user_phone,
              u.village, u.district, u.address as user_address,
              au.name as assigned_to_name, au.designation as assigned_to_designation,
              au.email as assigned_to_email
       FROM complaints c
       LEFT JOIN complaint_categories cc ON c.category_id = cc.id
       LEFT JOIN users u ON c.user_id = u.id
       LEFT JOIN admin_users au ON c.assigned_to = au.id
       ${whereClause}`,
      queryParams
    );

    if (complaints.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found or access denied'
      });
    }

    const complaint = complaints[0];

    // Get status history
    const [statusHistory] = await db.execute(
      `SELECT csh.old_status, csh.new_status, csh.comments, csh.created_at,
              au.name as changed_by_name, au.designation as changed_by_designation
       FROM complaint_status_history csh
       LEFT JOIN admin_users au ON csh.changed_by = au.id
       WHERE csh.complaint_id = ?
       ORDER BY csh.created_at ASC`,
      [id]
    );

    // Parse images if they exist
    if (complaint.images) {
      try {
        complaint.images = JSON.parse(complaint.images);
      } catch (e) {
        complaint.images = [];
      }
    } else {
      complaint.images = [];
    }

    res.json({
      success: true,
      data: {
        complaint,
        statusHistory
      }
    });
  } catch (error) {
    console.error('Admin complaint details fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update complaint status
router.put('/complaints/:id/status', verifyAdminToken, validateStatusUpdate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comments } = req.body;
    const adminRole = req.admin.role;

    // Verify complaint exists and admin has access
    let whereClause = 'WHERE id = ?';
    let queryParams = [id];

    if (adminRole !== 'super_admin') {
      whereClause += ' AND current_office = ?';
      queryParams.push(adminRole);
    }

    const [complaints] = await db.execute(
      `SELECT id, status, current_office FROM complaints ${whereClause}`,
      queryParams
    );

    if (complaints.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found or access denied'
      });
    }

    const complaint = complaints[0];
    const oldStatus = complaint.status;

    // Update complaint status
    await db.execute(
      'UPDATE complaints SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );

    // Add status history
    await db.execute(
      `INSERT INTO complaint_status_history (complaint_id, old_status, new_status, changed_by, comments) 
       VALUES (?, ?, ?, ?, ?)`,
      [id, oldStatus, status, req.admin.id, comments || null]
    );

    // Create notification for user if complaint has a user_id
    const [complaintDetails] = await db.execute(
      'SELECT user_id, title, complaint_id FROM complaints WHERE id = ?',
      [id]
    );

    if (complaintDetails[0].user_id) {
      await db.execute(
        `INSERT INTO notifications (user_id, type, title, message, related_complaint_id) 
         VALUES (?, 'status_changed', 'Complaint Status Updated', ?, ?)`,
        [
          complaintDetails[0].user_id,
          `Your complaint "${complaintDetails[0].title}" status has been updated to ${status}`,
          id
        ]
      );
    }

    // If resolved, set resolved_at timestamp
    if (status === 'resolved') {
      await db.execute(
        'UPDATE complaints SET resolved_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );
    }

    res.json({
      success: true,
      message: 'Complaint status updated successfully',
      data: {
        oldStatus,
        newStatus: status,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Assign complaint to admin
router.put('/complaints/:id/assign', verifyAdminToken, validateComplaintAssignment, async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo, comments } = req.body;
    const adminRole = req.admin.role;

    // Verify complaint exists and admin has access
    let whereClause = 'WHERE id = ?';
    let queryParams = [id];

    if (adminRole !== 'super_admin') {
      whereClause += ' AND current_office = ?';
      queryParams.push(adminRole);
    }

    const [complaints] = await db.execute(
      `SELECT id, assigned_to FROM complaints ${whereClause}`,
      queryParams
    );

    if (complaints.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found or access denied'
      });
    }

    // Verify the admin to assign exists and has the right role
    const [adminToAssign] = await db.execute(
      'SELECT id, name, role FROM admin_users WHERE id = ? AND is_active = true',
      [assignedTo]
    );

    if (adminToAssign.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Admin user not found or inactive'
      });
    }

    // Update assignment
    await db.execute(
      'UPDATE complaints SET assigned_to = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [assignedTo, id]
    );

    // Add status history entry for assignment
    await db.execute(
      `INSERT INTO complaint_status_history (complaint_id, old_status, new_status, changed_by, comments) 
       VALUES (?, (SELECT status FROM complaints WHERE id = ?), (SELECT status FROM complaints WHERE id = ?), ?, ?)`,
      [id, id, id, req.admin.id, `Assigned to ${adminToAssign[0].name}. ${comments || ''}`]
    );

    // Create notification for assigned admin
    const [complaintDetails] = await db.execute(
      'SELECT title, complaint_id FROM complaints WHERE id = ?',
      [id]
    );

    await db.execute(
      `INSERT INTO notifications (admin_id, type, title, message, related_complaint_id) 
       VALUES (?, 'assigned', 'Complaint Assigned', ?, ?)`,
      [
        assignedTo,
        `Complaint "${complaintDetails[0].title}" (${complaintDetails[0].complaint_id}) has been assigned to you`,
        id
      ]
    );

    res.json({
      success: true,
      message: 'Complaint assigned successfully',
      data: {
        assignedTo: {
          id: adminToAssign[0].id,
          name: adminToAssign[0].name,
          role: adminToAssign[0].role
        },
        assignedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Forward complaint to higher office
router.put('/complaints/:id/forward', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { targetOffice, comments } = req.body;
    const adminRole = req.admin.role;

    // Verify complaint exists and admin has access
    const [complaints] = await db.execute(
      'SELECT id, current_office, title, complaint_id FROM complaints WHERE id = ? AND current_office = ?',
      [id, adminRole]
    );

    if (complaints.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found or access denied'
      });
    }

    // Validate target office
    const validOffices = ['union_office', 'collector_office', 'cm_office'];
    if (!validOffices.includes(targetOffice)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid target office'
      });
    }

    // Ensure forward is to a higher office
    const officeHierarchy = {
      'union_office': 1,
      'collector_office': 2,
      'cm_office': 3
    };

    if (officeHierarchy[targetOffice] <= officeHierarchy[adminRole]) {
      return res.status(400).json({
        success: false,
        message: 'Can only forward to higher office level'
      });
    }

    // Update complaint office
    await db.execute(
      'UPDATE complaints SET current_office = ?, assigned_to = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [targetOffice, id]
    );

    // Add status history
    await db.execute(
      `INSERT INTO complaint_status_history (complaint_id, old_status, new_status, changed_by, comments) 
       VALUES (?, (SELECT status FROM complaints WHERE id = ?), (SELECT status FROM complaints WHERE id = ?), ?, ?)`,
      [id, id, id, req.admin.id, `Forwarded to ${targetOffice}. ${comments || ''}`]
    );

    // Notify admins in target office
    const [targetAdmins] = await db.execute(
      'SELECT id FROM admin_users WHERE role = ? AND is_active = true',
      [targetOffice]
    );

    for (const admin of targetAdmins) {
      await db.execute(
        `INSERT INTO notifications (admin_id, type, title, message, related_complaint_id) 
         VALUES (?, 'complaint_submitted', 'Complaint Forwarded', ?, ?)`,
        [
          admin.id,
          `Complaint "${complaints[0].title}" (${complaints[0].complaint_id}) has been forwarded to your office`,
          id
        ]
      );
    }

    res.json({
      success: true,
      message: 'Complaint forwarded successfully',
      data: {
        targetOffice,
        forwardedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Forward error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get admin users for assignment (filtered by role)
router.get('/users', verifyAdminToken, async (req, res) => {
  try {
    const adminRole = req.admin.role;
    let whereClause = 'WHERE is_active = true';
    let queryParams = [];

    // Super admin can see all, others see only their role
    if (adminRole !== 'super_admin') {
      whereClause += ' AND role = ?';
      queryParams.push(adminRole);
    }

    const [admins] = await db.execute(
      `SELECT id, username, email, role, name, department, designation 
       FROM admin_users ${whereClause}
       ORDER BY name`,
      queryParams
    );

    res.json({
      success: true,
      data: {
        admins
      }
    });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get admin notifications
router.get('/notifications', verifyAdminToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, unreadOnly = false } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE admin_id = ?';
    let queryParams = [req.admin.id];

    if (unreadOnly === 'true') {
      whereClause += ' AND is_read = false';
    }

    // Get total count
    const [countResult] = await db.execute(
      `SELECT COUNT(*) as total FROM notifications ${whereClause}`,
      queryParams
    );

    // Get notifications
    const [notifications] = await db.execute(
      `SELECT id, type, title, message, is_read, related_complaint_id, created_at
       FROM notifications ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, parseInt(limit), parseInt(offset)]
    );

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          total: countResult[0].total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Notifications fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;

    await db.execute(
      'UPDATE notifications SET is_read = true WHERE id = ? AND admin_id = ?',
      [id, req.admin.id]
    );

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Notification update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Mark all notifications as read
router.put('/notifications/mark-all-read', verifyAdminToken, async (req, res) => {
  try {
    await db.execute(
      'UPDATE notifications SET is_read = true WHERE admin_id = ?',
      [req.admin.id]
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Notifications update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router; 