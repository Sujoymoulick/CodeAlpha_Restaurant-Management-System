const express = require('express');
const { body, param } = require('express-validator');
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder
} = require('../controllers/orderController');
const {
  placeOrderCustomer,
  getMyOrders,
  getOrderByIdCustomer
} = require('../controllers/customerController');
const { protect, customerProtect, eitherProtect, staffProtect } = require('../middleware/authMiddleware');
const { validateFields } = require('../middleware/validationMiddleware');

const router = express.Router();

// 1. Customer-only orders list (Placed BEFORE /:id to prevent routing issues)
router.get('/my-orders', customerProtect, getMyOrders);

// 2. Orders list (Staff / Admin only)
router.get('/', staffProtect, getOrders);

// 3. Get single order / Track status (Either Staff OR Customer)
router.get(
  '/:id',
  eitherProtect,
  [param('id').isMongoId().withMessage('Invalid Order ID')],
  validateFields,
  (req, res, next) => {
    if (req.customer) {
      return getOrderByIdCustomer(req, res, next);
    }
    return getOrderById(req, res, next);
  }
);

// 4. Place order (Either Staff OR Customer)
router.post(
  '/',
  eitherProtect,
  [
    body('tableId').isMongoId().withMessage('Invalid Table ID'),
    body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
    body('items.*.menuItemId').isMongoId().withMessage('Invalid Menu Item ID in items list'),
    body('items.*.quantity')
      .isInt({ gt: 0 })
      .withMessage('Quantity must be a positive integer')
      .toInt()
  ],
  validateFields,
  (req, res, next) => {
    if (req.customer) {
      return placeOrderCustomer(req, res, next);
    }
    return createOrder(req, res, next);
  }
);

// 5. Update order status (Staff / Admin only)
router.put(
  '/:id',
  staffProtect,
  [
    param('id').isMongoId().withMessage('Invalid Order ID'),
    body('status')
      .optional()
      .isIn(['Pending', 'Preparing', 'Ready', 'Served', 'Completed', 'Cancelled'])
      .withMessage('Status must be Pending, Preparing, Ready, Served, Completed, or Cancelled')
  ],
  validateFields,
  updateOrder
);

module.exports = router;
