const mongoose = require('mongoose');

const TableSchema = new mongoose.Schema({
  tableNumber: {
    type: Number,
    required: [true, 'Please add a table number'],
    unique: true
  },
  capacity: {
    type: Number,
    required: [true, 'Please add capacity'],
    min: [1, 'Capacity must be at least 1']
  },
  status: {
    type: String,
    enum: ['Available', 'Reserved', 'Occupied'],
    default: 'Available'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Table', TableSchema);
