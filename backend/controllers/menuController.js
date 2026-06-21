const MenuItem = require('../models/MenuItem');
const { sendSuccess, sendError } = require('../utils/responseFormatter');

// @desc    Create menu item
// @route   POST /api/menu
// @access  Private/Admin
const createMenuItem = async (req, res, next) => {
  try {
    const { name, description, category, price, available } = req.body;

    const menuItem = await MenuItem.create({
      name,
      description,
      category,
      price,
      available
    });

    return sendSuccess(res, 'Menu item created successfully', menuItem, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all menu items (with search, filter, sort, pagination)
// @route   GET /api/menu
// @access  Public
const getMenuItems = async (req, res, next) => {
  try {
    const { search, category, sort, page = 1, limit = 10 } = req.query;

    const query = {};

    // Search by name (case-insensitive regex)
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Sort options (e.g. price:asc, price:desc)
    let sortBy = {};
    if (sort) {
      const parts = sort.split(':');
      sortBy[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
      sortBy = { name: 1 }; // Default sort alphabetically by name
    }

    // Pagination calculations
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const menuItems = await MenuItem.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(limitNum);

    const total = await MenuItem.countDocuments(query);

    return sendSuccess(res, 'Menu items retrieved successfully', {
      menuItems,
      pagination: {
        total,
        page: parseInt(page),
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single menu item by ID
// @route   GET /api/menu/:id
// @access  Public
const getMenuItemById = async (req, res, next) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return sendError(res, 'Menu item not found', 404);
    }

    return sendSuccess(res, 'Menu item retrieved successfully', menuItem);
  } catch (error) {
    next(error);
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private/Admin
const updateMenuItem = async (req, res, next) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!menuItem) {
      return sendError(res, 'Menu item not found', 404);
    }

    return sendSuccess(res, 'Menu item updated successfully', menuItem);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private/Admin
const deleteMenuItem = async (req, res, next) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);

    if (!menuItem) {
      return sendError(res, 'Menu item not found', 404);
    }

    return sendSuccess(res, 'Menu item deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMenuItem,
  getMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem
};
