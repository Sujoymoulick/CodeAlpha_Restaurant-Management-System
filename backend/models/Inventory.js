const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: [true, 'Please add an inventory item name'],
    unique: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Please add quantity'],
    min: [0, 'Quantity cannot be negative']
  },
  unit: {
    type: String,
    required: [true, 'Please add a unit (e.g., kg, liters, pieces)'],
    trim: true
  },
  lowStockThreshold: {
    type: Number,
    required: [true, 'Please add low stock threshold'],
    min: [0, 'Threshold cannot be negative']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Inventory', InventorySchema);
