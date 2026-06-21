const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  customerName: {
    type: String,
    required: [true, 'Please add a customer name'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    trim: true
  },
  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: [true, 'Please associate a table']
  },
  reservationDate: {
    type: Date,
    required: [true, 'Please add a reservation date']
  },
  reservationTime: {
    type: String,
    required: [true, 'Please add a reservation time'],
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Reservation', ReservationSchema);
