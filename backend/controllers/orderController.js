const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const { deductInventoryForOrder } = require('../services/inventoryService');
const { sendSuccess, sendError } = require('../utils/responseFormatter');

// @desc    Create order
// @route   POST /api/orders
// @access  Private (Staff/Admin)
const createOrder = async (req, res, next) => {
  try {
    const { tableId, items } = req.body;

    // 1. Verify Table exists
    const table = await Table.findById(tableId);
    if (!table) {
      return sendError(res, 'Table not found', 404);
    }

    if (!items || items.length === 0) {
      return sendError(res, 'Cannot create an empty order', 400);
    }

    // 2. Fetch prices, populate items list, and calculate total amount
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem) {
        return sendError(res, `Menu item not found with ID: ${item.menuItemId}`, 404);
      }
      if (!menuItem.available) {
        return sendError(res, `Menu item '${menuItem.name}' is currently unavailable`, 400);
      }

      const price = menuItem.price;
      const quantity = parseInt(item.quantity);
      totalAmount += price * quantity;

      orderItems.push({
        menuItemId: item.menuItemId,
        quantity,
        priceAtOrder: price
      });
    }

    // 3. Create the order
    const order = await Order.create({
      tableId,
      items: orderItems,
      totalAmount,
      status: 'Pending'
    });

    // 4. Update table status to Occupied
    table.status = 'Occupied';
    await table.save();

    // 5. Deduct inventory ingredients and collect alerts
    const inventoryAlerts = await deductInventoryForOrder(orderItems);

    // Populate order details for response
    const populatedOrder = await order.populate([
      { path: 'tableId', select: 'tableNumber capacity status' },
      { path: 'items.menuItemId', select: 'name category price' }
    ]);

    return sendSuccess(res, 'Order created successfully', {
      order: populatedOrder,
      alerts: inventoryAlerts
    }, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (with pagination and optional table filter)
// @route   GET /api/orders
// @access  Private (Staff/Admin)
const getOrders = async (req, res, next) => {
  try {
    const { tableId, status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (tableId) {
      query.tableId = tableId;
    }
    if (status) {
      query.status = status;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const orders = await Order.find(query)
      .populate([
        { path: 'tableId', select: 'tableNumber capacity status' },
        { path: 'items.menuItemId', select: 'name category price' }
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Order.countDocuments(query);

    return sendSuccess(res, 'Orders retrieved successfully', {
      orders,
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

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private (Staff/Admin)
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate([
      { path: 'tableId', select: 'tableNumber capacity status' },
      { path: 'items.menuItemId', select: 'name category price' }
    ]);

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    return sendSuccess(res, 'Order retrieved successfully', order);
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private (Staff/Admin)
const updateOrder = async (req, res, next) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    if (status) {
      order.status = status;
      await order.save();

      // If order is completed or cancelled, release the table status back to Available
      if (status === 'Completed' || status === 'Cancelled') {
        const table = await Table.findById(order.tableId);
        if (table) {
          table.status = 'Available';
          await table.save();
        }
      }
    }

    const updatedOrder = await order.populate([
      { path: 'tableId', select: 'tableNumber capacity status' },
      { path: 'items.menuItemId', select: 'name category price' }
    ]);

    return sendSuccess(res, 'Order updated successfully', updatedOrder);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder
};
