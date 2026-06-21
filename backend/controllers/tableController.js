const Table = require('../models/Table');
const { sendSuccess, sendError } = require('../utils/responseFormatter');

// @desc    Create table
// @route   POST /api/tables
// @access  Private/Admin
const createTable = async (req, res, next) => {
  try {
    const { tableNumber, capacity, status } = req.body;

    const tableExists = await Table.findOne({ tableNumber });
    if (tableExists) {
      return sendError(res, 'Table number already exists', 400);
    }

    const table = await Table.create({
      tableNumber,
      capacity,
      status
    });

    return sendSuccess(res, 'Table created successfully', table, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tables
// @route   GET /api/tables
// @access  Private (Staff/Admin)
const getTables = async (req, res, next) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    return sendSuccess(res, 'Tables retrieved successfully', tables);
  } catch (error) {
    next(error);
  }
};

// @desc    Get table by ID
// @route   GET /api/tables/:id
// @access  Private (Staff/Admin)
const getTableById = async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.id);

    if (!table) {
      return sendError(res, 'Table not found', 404);
    }

    return sendSuccess(res, 'Table retrieved successfully', table);
  } catch (error) {
    next(error);
  }
};

// @desc    Update table
// @route   PUT /api/tables/:id
// @access  Private (Staff/Admin)
const updateTable = async (req, res, next) => {
  try {
    const table = await Table.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!table) {
      return sendError(res, 'Table not found', 404);
    }

    return sendSuccess(res, 'Table updated successfully', table);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete table
// @route   DELETE /api/tables/:id
// @access  Private/Admin
const deleteTable = async (req, res, next) => {
  try {
    const table = await Table.findByIdAndDelete(req.params.id);

    if (!table) {
      return sendError(res, 'Table not found', 404);
    }

    return sendSuccess(res, 'Table deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTable,
  getTables,
  getTableById,
  updateTable,
  deleteTable
};
