const express = require('express');
const { body, param } = require('express-validator');
const {
  createTable,
  getTables,
  getTableById,
  updateTable,
  deleteTable
} = require('../controllers/tableController');
const { protect, adminOnly, eitherProtect, staffProtect } = require('../middleware/authMiddleware');
const { validateFields } = require('../middleware/validationMiddleware');

const router = express.Router();

// Customers or Staff can list tables
router.get('/', eitherProtect, getTables);

// All subsequent table routes require staff authentication
router.use(staffProtect);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid Table ID')],
  validateFields,
  getTableById
);

// Admin-only creation
router.post(
  '/',
  adminOnly,
  [
    body('tableNumber')
      .isInt({ gt: 0 })
      .withMessage('Table number must be a positive integer')
      .toInt(),
    body('capacity')
      .isInt({ gt: 0 })
      .withMessage('Capacity must be a positive integer')
      .toInt(),
    body('status')
      .optional()
      .isIn(['Available', 'Reserved', 'Occupied'])
      .withMessage('Status must be Available, Reserved, or Occupied')
  ],
  validateFields,
  createTable
);

// Staff/Admin updates (e.g. changing status manually)
router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid Table ID'),
    body('tableNumber').optional().isInt({ gt: 0 }).withMessage('Table number must be a positive integer').toInt(),
    body('capacity').optional().isInt({ gt: 0 }).withMessage('Capacity must be a positive integer').toInt(),
    body('status').optional().isIn(['Available', 'Reserved', 'Occupied']).withMessage('Status must be Available, Reserved, or Occupied')
  ],
  validateFields,
  updateTable
);

// Admin-only deletion
router.delete(
  '/:id',
  adminOnly,
  [param('id').isMongoId().withMessage('Invalid Table ID')],
  validateFields,
  deleteTable
);

module.exports = router;
