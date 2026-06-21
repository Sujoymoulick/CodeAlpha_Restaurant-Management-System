const Inventory = require('../models/Inventory');
const { sendSuccess, sendError } = require('../utils/responseFormatter');

// @desc    Create inventory item
// @route   POST /api/inventory
// @access  Private/Admin
const createInventoryItem = async (req, res, next) => {
  try {
    const { itemName, quantity, unit, lowStockThreshold } = req.body;

    const itemExists = await Inventory.findOne({ itemName });
    if (itemExists) {
      return sendError(res, 'Inventory item already exists', 400);
    }

    const inventoryItem = await Inventory.create({
      itemName,
      quantity,
      unit,
      lowStockThreshold
    });

    return sendSuccess(res, 'Inventory item created successfully', inventoryItem, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private (Staff/Admin)
const getInventoryItems = async (req, res, next) => {
  try {
    const inventory = await Inventory.find().sort({ itemName: 1 });
    return sendSuccess(res, 'Inventory items retrieved successfully', inventory);
  } catch (error) {
    next(error);
  }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private (Staff/Admin)
const updateInventoryItem = async (req, res, next) => {
  try {
    const inventoryItem = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!inventoryItem) {
      return sendError(res, 'Inventory item not found', 404);
    }

    // Check if updated item fell below safety threshold
    const lowStockAlert = inventoryItem.quantity <= inventoryItem.lowStockThreshold;

    return sendSuccess(res, 'Inventory item updated successfully', {
      inventoryItem,
      lowStockAlert: lowStockAlert ? `Low stock alert: ${inventoryItem.itemName} is at ${inventoryItem.quantity} ${inventoryItem.unit}` : null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInventoryItem,
  getInventoryItems,
  updateInventoryItem
};
