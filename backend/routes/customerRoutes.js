const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  getProfile,
  updateProfile
} = require('../controllers/authAgent');
const { protect } = require('../middleware/authMiddleware');
const { validateFields } = require('../middleware/validationMiddleware');

const router = express.Router();

// Customer Registration (Phase 9 legacy redirect)
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required').trim(),
    body('email').isEmail().withMessage('Please enter a valid email address').trim().toLowerCase(),
    body('phone').notEmpty().withMessage('Phone number is required').trim(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('address').optional().trim()
  ],
  validateFields,
  (req, res, next) => {
    req.body.role = 'Customer'; // Force role to Customer
    register(req, res, next);
  }
);

// Customer Login (Phase 9 legacy redirect)
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email address').trim().toLowerCase(),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validateFields,
  login
);

// Customer Profile (Phase 9 legacy redirect)
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

module.exports = router;
