import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';
import { validateComplaintSubmission } from '../utils/validation.js';
import { verifyToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Generate unique complaint ID
const generateComplaintId = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `VCM${timestamp}${random}`;
};

// Test database connection and show available categories
router.get('/categories', async (req, res) => {
  try {
    // Test database connection
    await db.execute('SELECT 1');
    
    // Get all active categories
    const [categories] = await db.execute(
      'SELECT id, name, description FROM complaint_categories WHERE is_active = true ORDER BY name'
    );
    
    res.json({
      success: true,
      message: 'Categories retrieved successfully',
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Test database connection and show system status
router.get('/status', async (req, res) => {
  try {
    // Test database connection
    await db.execute('SELECT 1');
    
    // Check if tables exist
    const [tables] = await db.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME IN ('complaints', 'complaint_categories', 'users', 'admin_users')
    `, [process.env.DB_NAME || 'village_complaint_db']);
    
    // Get categories count
    const [categoriesCount] = await db.execute('SELECT COUNT(*) as count FROM complaint_categories');
    
    // Get complaints count
    const [complaintsCount] = await db.execute('SELECT COUNT(*) as count FROM complaints');
    
    res.json({
      success: true,
      message: 'System status retrieved successfully',
      data: {
        database: 'Connected',
        tables: tables.map(t => t.TABLE_NAME),
        categoriesCount: categoriesCount[0].count,
        complaintsCount: complaintsCount[0].count,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error checking system status:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking system status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Test database connection
router.get('/test', async (req, res) => {
  try {
    // Test database connection
    await db.execute('SELECT 1');
    
    // Test if tables exist
    const [tables] = await db.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME IN ('complaints', 'complaint_categories', 'users', 'admin_users')
    `, [process.env.DB_NAME || 'village_complaint_db']);
    
    // Test if categories exist
    const [categories] = await db.execute('SELECT COUNT(*) as count FROM complaint_categories');
    
    res.json({
      success: true,
      message: 'Database connection successful',
      data: {
        tables: tables.map(t => t.TABLE_NAME),
        categoriesCount: categories[0].count
      }
    });
  } catch (error) {
    console.error('Database test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Database test failed',
      error: error.message
    });
  }
});

// Submit a new complaint
router.post('/submit', optionalAuth, validateComplaintSubmission, async (req, res) => {
  try {
    // Test database connection first
    try {
      await db.execute('SELECT 1');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Database connection failed',
        error: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      });
    }

    const {
      title,
      description,
      category,
      location,
      urgency = 'medium',
      contactName,
      contactPhone,
      contactEmail,
      isAnonymous = false,
      images = []
    } = req.body;

    console.log('Received complaint data:', {
      title,
      description,
      category,
      location,
      urgency,
      contactName,
      contactPhone,
      contactEmail,
      isAnonymous,
      images
    });

    // Validate required fields
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and category are required'
      });
    }

    // Get category ID
    let categories;
    try {
      [categories] = await db.execute(
        'SELECT id FROM complaint_categories WHERE name = ? AND is_active = true',
        [category]
      );
    } catch (categoryError) {
      console.error('Error fetching category:', categoryError);
      return res.status(500).json({
        success: false,
        message: 'Error fetching complaint category',
        error: process.env.NODE_ENV === 'development' ? categoryError.message : undefined
      });
    }

    if (categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid complaint category: ${category}. Available categories: Road & Infrastructure, Water Supply Issues, Electricity Problems, Sanitation & Drainage, Health & Hygiene, Public Safety, Education Facilities, Welfare Scheme Issues, Pollution & Environment, Corruption or Misuse, Others`
      });
    }

    const categoryId = categories[0].id;
    const complaintId = generateComplaintId();
    const userId = req.user ? req.user.id : null;

    // Handle contact details based on anonymous submission
    const finalContactName = isAnonymous ? null : (contactName || null);
    const finalContactPhone = isAnonymous ? null : (contactPhone || null);
    const finalContactEmail = isAnonymous ? null : (contactEmail || null);

    console.log('Processed complaint data:', {
      complaintId,
      userId,
      categoryId,
      finalContactName,
      finalContactPhone,
      finalContactEmail,
      isAnonymous
    });

    // Insert complaint
    let result;
    try {
      [result] = await db.execute(
        `INSERT INTO complaints 
         (complaint_id, user_id, category_id, title, description, location, urgency, 
          contact_name, contact_phone, contact_email, is_anonymous, images, status, current_office) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'union_office')`,
        [
          complaintId,
          userId,
          categoryId,
          title,
          description,
          location || null,
          urgency,
          finalContactName,
          finalContactPhone,
          finalContactEmail,
          isAnonymous,
          JSON.stringify(images)
        ]
      );
    } catch (insertError) {
      console.error('Error inserting complaint:', insertError);
      return res.status(500).json({
        success: false,
        message: 'Error inserting complaint into database',
        error: process.env.NODE_ENV === 'development' ? insertError.message : undefined
      });
    }

    console.log('Complaint inserted successfully:', result.insertId);

    // Add initial status history
    try {
      await db.execute(
        `INSERT INTO complaint_status_history (complaint_id, old_status, new_status, comments) 
         VALUES (?, NULL, 'pending', 'Complaint submitted')`,
        [result.insertId]
      );
    } catch (historyError) {
      console.error('Error inserting status history:', historyError);
      // Continue even if status history fails
    }

    console.log('Status history added successfully');

    // Create notification for union office admins
    try {
      const [unionAdmins] = await db.execute(
        'SELECT id FROM admin_users WHERE role = "union_office" AND is_active = true'
      );

      for (const admin of unionAdmins) {
        await db.execute(
          `INSERT INTO notifications (admin_id, type, title, message, related_complaint_id) 
           VALUES (?, 'complaint_submitted', 'New Complaint Submitted', ?, ?)`,
          [
            admin.id,
            `New complaint "${title}" has been submitted with ID ${complaintId}`,
            result.insertId
          ]
        );
      }
    } catch (notificationError) {
      console.error('Error creating notifications:', notificationError);
      // Continue even if notifications fail
    }

    console.log('Notifications created successfully');

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: {
        complaintId,
        id: result.insertId,
        status: 'pending',
        submittedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Complaint submission error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Internal server error during complaint submission',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get complaint by ID (public endpoint)
router.get('/status/:complaintId', async (req, res) => {
  try {
    const { complaintId } = req.params;

    const [complaints] = await db.execute(
      `SELECT c.complaint_id, c.title, c.description, c.location, c.urgency, c.status, 
              c.current_office, c.contact_name, c.contact_phone, c.contact_email, 
              c.is_anonymous, c.created_at, c.updated_at, c.resolved_at,
              cc.name as category_name,
              au.name as assigned_to_name, au.designation as assigned_to_designation
       FROM complaints c
       LEFT JOIN complaint_categories cc ON c.category_id = cc.id
       LEFT JOIN admin_users au ON c.assigned_to = au.id
       WHERE c.complaint_id = ?`,
      [complaintId]
    );

    if (complaints.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    const complaint = complaints[0];

    // Get status history
    const [statusHistory] = await db.execute(
      `SELECT csh.old_status, csh.new_status, csh.comments, csh.created_at,
              au.name as changed_by_name, au.designation as changed_by_designation
       FROM complaint_status_history csh
       LEFT JOIN admin_users au ON csh.changed_by = au.id
       WHERE csh.complaint_id = (SELECT id FROM complaints WHERE complaint_id = ?)
       ORDER BY csh.created_at ASC`,
      [complaintId]
    );

    res.json({
      success: true,
      data: {
        complaint,
        statusHistory
      }
    });
  } catch (error) {
    console.error('Complaint status fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user's complaints (requires authentication)
router.get('/my-complaints', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE c.user_id = ?';
    let queryParams = [req.user.id];

    if (status) {
      whereClause += ' AND c.status = ?';
      queryParams.push(status);
    }

    // Get total count
    const [countResult] = await db.execute(
      `SELECT COUNT(*) as total FROM complaints c ${whereClause}`,
      queryParams
    );

    // Get complaints with pagination
    const [complaints] = await db.execute(
      `SELECT c.complaint_id, c.title, c.description, c.location, c.urgency, c.status, 
              c.current_office, c.created_at, c.updated_at, c.resolved_at,
              cc.name as category_name,
              au.name as assigned_to_name
       FROM complaints c
       LEFT JOIN complaint_categories cc ON c.category_id = cc.id
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
    console.error('User complaints fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all complaint categories
router.get('/categories', async (req, res) => {
  try {
    const [categories] = await db.execute(
      'SELECT id, name, description, icon_url FROM complaint_categories WHERE is_active = true ORDER BY name'
    );

    res.json({
      success: true,
      data: {
        categories
      }
    });
  } catch (error) {
    console.error('Categories fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get complaint statistics (public)
router.get('/statistics', async (req, res) => {
  try {
    // Get total complaints
    const [totalComplaints] = await db.execute(
      'SELECT COUNT(*) as total FROM complaints'
    );

    // Get resolved complaints
    const [resolvedComplaints] = await db.execute(
      'SELECT COUNT(*) as total FROM complaints WHERE status = "resolved"'
    );

    // Get complaints by status
    const [complaintsByStatus] = await db.execute(
      'SELECT status, COUNT(*) as count FROM complaints GROUP BY status'
    );

    // Get recent activity (last 30 days)
    const [recentActivity] = await db.execute(
      `SELECT DATE(created_at) as date, COUNT(*) as count 
       FROM complaints 
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date DESC`
    );

    // Get complaints by category
    const [complaintsByCategory] = await db.execute(
      `SELECT cc.name as category, COUNT(c.id) as count 
       FROM complaint_categories cc
       LEFT JOIN complaints c ON cc.id = c.category_id
       GROUP BY cc.id, cc.name
       ORDER BY count DESC`
    );

    res.json({
      success: true,
      data: {
        totalComplaints: totalComplaints[0].total,
        resolvedComplaints: resolvedComplaints[0].total,
        resolutionRate: totalComplaints[0].total > 0 
          ? Math.round((resolvedComplaints[0].total / totalComplaints[0].total) * 100) 
          : 0,
        complaintsByStatus: complaintsByStatus.reduce((acc, item) => {
          acc[item.status] = item.count;
          return acc;
        }, {}),
        recentActivity,
        complaintsByCategory
      }
    });
  } catch (error) {
    console.error('Statistics fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Search complaints (public - limited info)
router.get('/search', async (req, res) => {
  try {
    const { q, category, status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    let queryParams = [];

    if (q) {
      whereClause += ' AND (c.title LIKE ? OR c.description LIKE ? OR c.complaint_id LIKE ?)';
      const searchTerm = `%${q}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (category) {
      whereClause += ' AND cc.name = ?';
      queryParams.push(category);
    }

    if (status) {
      whereClause += ' AND c.status = ?';
      queryParams.push(status);
    }

    // Get total count
    const [countResult] = await db.execute(
      `SELECT COUNT(*) as total 
       FROM complaints c
       LEFT JOIN complaint_categories cc ON c.category_id = cc.id
       ${whereClause}`,
      queryParams
    );

    // Get complaints (limited public info)
    const [complaints] = await db.execute(
      `SELECT c.complaint_id, c.title, LEFT(c.description, 100) as description_preview, 
              c.location, c.urgency, c.status, c.current_office, c.created_at,
              cc.name as category_name
       FROM complaints c
       LEFT JOIN complaint_categories cc ON c.category_id = cc.id
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
    console.error('Complaint search error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router; 