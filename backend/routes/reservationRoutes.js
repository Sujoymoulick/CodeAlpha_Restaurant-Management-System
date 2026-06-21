const express = require('express');
const { body, param } = require('express-validator');
const {
  createReservation,
  getReservations,
  getReservationById,
  deleteReservation
} = require('../controllers/reservationController');
const { protect, staffProtect } = require('../middleware/authMiddleware');
const { validateFields } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(staffProtect); // All reservation routes are private (Staff/Admin)

router.get('/', getReservations);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid Reservation ID')],
  validateFields,
  getReservationById
);

router.post(
  '/',
  [
    body('customerName').notEmpty().withMessage('Customer name is required').trim(),
    body('phone')
      .isMobilePhone()
      .withMessage('Please provide a valid phone number'),
    body('tableId').isMongoId().withMessage('Invalid Table ID reference'),
    body('reservationDate')
      .isISO8601()
      .withMessage('Please provide a valid date in ISO 8601 format (e.g. YYYY-MM-DD)'),
    body('reservationTime')
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Time must be in HH:MM format (24-hour)')
  ],
  validateFields,
  createReservation
);

router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid Reservation ID')],
  validateFields,
  deleteReservation
);

module.exports = router;
