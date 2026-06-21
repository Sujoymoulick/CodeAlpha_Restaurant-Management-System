const express = require('express');
const { body, param } = require('express-validator');
const {
  createMenuItem,
  getMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem
} = require('../controllers/menuController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { validateFields } = require('../middleware/validationMiddleware');

const router = express.Router();

// Public route to view items
router.get('/', getMenuItems);

// Public route to view single item
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid Menu Item ID')],
  validateFields,
  getMenuItemById
);

// Protected Admin Routes
router.post(
  '/',
  protect,
  adminOnly,
  [
    body('name').notEmpty().withMessage('Name is required').trim(),
    body('category').notEmpty().withMessage('Category is required').trim(),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be a positive number')
      .toFloat(),
    body('available').optional().isBoolean().withMessage('Available must be a boolean')
  ],
  validateFields,
  createMenuItem
);

router.put(
  '/:id',
  protect,
  adminOnly,
  [
    param('id').isMongoId().withMessage('Invalid Menu Item ID'),
    body('name').optional().notEmpty().withMessage('Name cannot be empty').trim(),
    body('category').optional().notEmpty().withMessage('Category cannot be empty').trim(),
    body('price')
      .optional()
      .isFloat({ gt: 0 })
      .withMessage('Price must be a positive number')
      .toFloat(),
    body('available').optional().isBoolean().withMessage('Available must be a boolean')
  ],
  validateFields,
  updateMenuItem
);

router.delete(
  '/:id',
  protect,
  adminOnly,
  [param('id').isMongoId().withMessage('Invalid Menu Item ID')],
  validateFields,
  deleteMenuItem
);

module.exports = router;
