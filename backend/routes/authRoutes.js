const express = require('express');
const { body } = require('express-validator');
const { register, login, getProfile, updateProfile } = require('../controllers/authAgent');
const { protect } = require('../middleware/authMiddleware');
const { validateFields } = require('../middleware/validationMiddleware');

const router = express.Router();

// Register Route (Phase 9)
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required').trim(),
    body('email').isEmail().withMessage('Please enter a valid email address').trim().toLowerCase(),
    body('phone').notEmpty().withMessage('Phone number is required').trim(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('role').optional().isIn(['Customer', 'Staff', 'Admin']).withMessage('Role must be Customer, Staff, or Admin'),
    body('address').optional().trim()
  ],
  validateFields,
  register
);

// Login Route (Phase 9)
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email address').trim().toLowerCase(),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validateFields,
  login
);

// Profile Routes (Phase 9)
router.route('/profile')
  .get(protect, getProfile)
  .put(
    protect,
    [
      body('name').optional().notEmpty().withMessage('Name cannot be empty').trim(),
      body('phone').optional().notEmpty().withMessage('Phone number cannot be empty').trim(),
      body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
      body('address').optional().trim()
    ],
    validateFields,
    updateProfile
  );

// Backward compatibility alias route
router.get('/me', protect, getProfile);

module.exports = router;
