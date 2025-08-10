import { body, validationResult } from 'express-validator';

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
export const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('phone')
    .optional()
    .isMobilePhone('en-IN')
    .withMessage('Please provide a valid Indian phone number'),
  body('village')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Village name cannot exceed 100 characters'),
  body('district')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('District name cannot exceed 100 characters'),
  body('pincode')
    .optional()
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('Pincode must be 6 digits'),
  handleValidationErrors
];

// User login validation
export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Admin login validation
export const validateAdminLogin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Complaint submission validation
export const validateComplaintSubmission = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters'),
  body('category')
    .notEmpty()
    .withMessage('Category is required'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Location cannot exceed 500 characters'),
  body('urgency')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid urgency level'),
  body('contactName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Contact name must be between 2 and 100 characters'),
  body('contactPhone')
    .optional()
    .isMobilePhone('en-IN')
    .withMessage('Please provide a valid Indian phone number'),
  body('contactEmail')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('isAnonymous')
    .optional()
    .isBoolean()
    .withMessage('isAnonymous must be a boolean'),
  // Custom validation for contact details when not anonymous
  body()
    .custom((value, { req }) => {
      if (!req.body.isAnonymous) {
        if (!req.body.contactName || req.body.contactName.trim().length < 2) {
          throw new Error('Contact name is required when not submitting anonymously');
        }
        if (!req.body.contactPhone || req.body.contactPhone.trim().length < 10) {
          throw new Error('Contact phone is required when not submitting anonymously');
        }
      }
      return true;
    }),
  handleValidationErrors
];

// Feedback validation
export const validateFeedback = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('subject')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Subject cannot exceed 200 characters'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  handleValidationErrors
];

// Status update validation
export const validateStatusUpdate = [
  body('status')
    .isIn(['pending', 'acknowledged', 'in_progress', 'resolved', 'rejected'])
    .withMessage('Invalid status'),
  body('comments')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comments cannot exceed 1000 characters'),
  handleValidationErrors
];

// Complaint assignment validation
export const validateComplaintAssignment = [
  body('assignedTo')
    .isInt({ min: 1 })
    .withMessage('Invalid admin ID'),
  body('comments')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comments cannot exceed 1000 characters'),
  handleValidationErrors
];

// Password change validation
export const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  handleValidationErrors
]; 