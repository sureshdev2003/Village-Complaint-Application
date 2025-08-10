import express from 'express';
import db from '../config/database.js';
import { validateFeedback } from '../utils/validation.js';
import { verifyAdminToken } from '../middleware/auth.js';

const router = express.Router();

// Submit feedback
router.post('/submit', validateFeedback, async (req, res) => {
  try {
    const {
      name,
      email,
      subject,
      message,
      rating
    } = req.body;

    // Insert feedback
    const [result] = await db.execute(
      'INSERT INTO feedback (name, email, subject, message, rating) VALUES (?, ?, ?, ?, ?)',
      [name, email, subject || null, message, rating || null]
    );

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        id: result.insertId,
        submittedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during feedback submission'
    });
  }
});

// Get all feedback (admin only)
router.get('/all', verifyAdminToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, unreadOnly = false } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    let queryParams = [];

    if (unreadOnly === 'true') {
      whereClause += ' AND is_read = false';
    }

    // Get total count
    const [countResult] = await db.execute(
      `SELECT COUNT(*) as total FROM feedback ${whereClause}`,
      queryParams
    );

    // Get feedback with pagination
    const [feedback] = await db.execute(
      `SELECT id, name, email, subject, message, rating, is_read, created_at
       FROM feedback ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, parseInt(limit), parseInt(offset)]
    );

    res.json({
      success: true,
      data: {
        feedback,
        pagination: {
          total: countResult[0].total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Feedback fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get single feedback (admin only)
router.get('/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [feedback] = await db.execute(
      'SELECT id, name, email, subject, message, rating, is_read, created_at FROM feedback WHERE id = ?',
      [id]
    );

    if (feedback.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Mark as read when admin views it
    await db.execute(
      'UPDATE feedback SET is_read = true WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      data: {
        feedback: feedback[0]
      }
    });
  } catch (error) {
    console.error('Feedback details fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Mark feedback as read (admin only)
router.put('/:id/read', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute(
      'UPDATE feedback SET is_read = true WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.json({
      success: true,
      message: 'Feedback marked as read'
    });
  } catch (error) {
    console.error('Feedback update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete feedback (admin only)
router.delete('/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute(
      'DELETE FROM feedback WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Feedback deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get feedback statistics (admin only)
router.get('/stats/summary', verifyAdminToken, async (req, res) => {
  try {
    // Get total feedback count
    const [totalFeedback] = await db.execute(
      'SELECT COUNT(*) as total FROM feedback'
    );

    // Get unread feedback count
    const [unreadFeedback] = await db.execute(
      'SELECT COUNT(*) as total FROM feedback WHERE is_read = false'
    );

    // Get average rating
    const [avgRating] = await db.execute(
      'SELECT AVG(rating) as average FROM feedback WHERE rating IS NOT NULL'
    );

    // Get feedback by rating
    const [feedbackByRating] = await db.execute(
      'SELECT rating, COUNT(*) as count FROM feedback WHERE rating IS NOT NULL GROUP BY rating ORDER BY rating'
    );

    // Get recent feedback (last 7 days)
    const [recentFeedback] = await db.execute(
      'SELECT COUNT(*) as count FROM feedback WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
    );

    res.json({
      success: true,
      data: {
        totalFeedback: totalFeedback[0].total,
        unreadFeedback: unreadFeedback[0].total,
        averageRating: avgRating[0].average ? parseFloat(avgRating[0].average).toFixed(1) : null,
        recentFeedback: recentFeedback[0].count,
        feedbackByRating: feedbackByRating.reduce((acc, item) => {
          acc[item.rating] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Feedback statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router; 