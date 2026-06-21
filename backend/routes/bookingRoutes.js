const express = require('express');
const { body, param } = require('express-validator');
const {
  bookTableCustomer,
  getMyBookings,
  cancelBookingCustomer
} = require('../controllers/customerController');
const { customerProtect } = require('../middleware/authMiddleware');
const { validateFields } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(customerProtect); // All booking routes require customer session

router.get('/my-bookings', getMyBookings);

router.post(
  '/',
  [
    body('guests')
      .isInt({ gt: 0 })
      .withMessage('Number of guests must be a positive integer')
      .toInt(),
    body('reservationDate')
      .isISO8601()
      .withMessage('Please provide a valid reservation date in ISO format (e.g. YYYY-MM-DD)'),
    body('reservationTime')
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Time must be in HH:MM format (24-hour)')
  ],
  validateFields,
  bookTableCustomer
);

router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid Booking ID')],
  validateFields,
  cancelBookingCustomer
);

module.exports = router;
