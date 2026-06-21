const express = require('express');
const { body, param } = require('express-validator');
const {
  createInventoryItem,
  getInventoryItems,
  updateInventoryItem
} = require('../controllers/inventoryController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { validateFields } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect); // All inventory routes require authentication

router.get('/', getInventoryItems);

// Admin-only creation
router.post(
  '/',
  adminOnly,
  [
    body('itemName').notEmpty().withMessage('Item name is required').trim(),
    body('quantity')
      .isFloat({ min: 0 })
      .withMessage('Quantity must be a non-negative number')
      .toFloat(),
    body('unit').notEmpty().withMessage('Unit is required').trim(),
    body('lowStockThreshold')
      .isFloat({ min: 0 })
      .withMessage('Low stock threshold must be a non-negative number')
      .toFloat()
  ],
  validateFields,
  createInventoryItem
);

// Staff/Admin updates
router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid Inventory Item ID'),
    body('itemName').optional().notEmpty().withMessage('Item name cannot be empty').trim(),
    body('quantity')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Quantity must be a non-negative number')
      .toFloat(),
    body('unit').optional().notEmpty().withMessage('Unit cannot be empty').trim(),
    body('lowStockThreshold')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Low stock threshold must be a non-negative number')
      .toFloat()
  ],
  validateFields,
  updateInventoryItem
);

module.exports = router;
