const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const Table = require('../models/Table');
const Reservation = require('../models/Reservation');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const { deductInventoryForOrder } = require('../services/inventoryService');
const { sendSuccess, sendError } = require('../utils/responseFormatter');

// Generate JWT for Customer
const generateCustomerToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'jwt_secret_key_123456', {
    expiresIn: '30d'
  });
};

// ==========================================
// PHASE 1: CUSTOMER AUTHENTICATION
// ==========================================

// Register Customer
const registerCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, password, address } = req.body;

    const customerExists = await Customer.findOne({ email });
    if (customerExists) {
      return sendError(res, 'A customer with this email already exists', 400);
    }

    const customer = await Customer.create({
      name,
      email,
      phone,
      password,
      address
    });

    return sendSuccess(res, 'Customer registered successfully', {
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      token: generateCustomerToken(customer._id)
    }, 201);
  } catch (error) {
    next(error);
  }
};

// Login Customer
const loginCustomer = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const customer = await Customer.findOne({ email }).select('+password');
    if (!customer || !(await customer.matchPassword(password))) {
      return sendError(res, 'Invalid email or password', 401);
    }

    return sendSuccess(res, 'Customer login successful', {
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      role: 'customer',
      token: generateCustomerToken(customer._id)
    });
  } catch (error) {
    next(error);
  }
};

// Get Profile
const getCustomerProfile = async (req, res, next) => {
  try {
    return sendSuccess(res, 'Customer profile retrieved successfully', req.customer);
  } catch (error) {
    next(error);
  }
};

// Update Profile
const updateCustomerProfile = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.customer._id);
    if (!customer) {
      return sendError(res, 'Customer not found', 404);
    }

    const { name, phone, address, password } = req.body;

    if (name) customer.name = name;
    if (phone) customer.phone = phone;
    if (address) customer.address = address;
    if (password) customer.password = password; // pre-save hook will hash it

    const updated = await customer.save();

    return sendSuccess(res, 'Customer profile updated successfully', {
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      address: updated.address
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// PHASE 3: TABLE BOOKING SYSTEM (AUTOMATED)
// ==========================================

// Book Table (System automatically finds available table fitting guests count)
const bookTableCustomer = async (req, res, next) => {
  try {
    const { guests, reservationDate, reservationTime } = req.body;
    const customerId = req.customer._id;

    // 1. Format date boundaries
    const parsedDate = new Date(reservationDate);
    const startOfDay = new Date(parsedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(parsedDate.setHours(23, 59, 59, 999));

    // 2. Query all tables that can fit the party size, sorted by capacity ascending
    // Sorting ascending leaves larger tables free for larger groups!
    const candidateTables = await Table.find({ capacity: { $gte: parseInt(guests) } })
      .sort({ capacity: 1 });

    if (candidateTables.length === 0) {
      return sendError(res, 'We do not have tables matching your party size', 400);
    }

    // 3. Loop and find the first table with no booking overlap on date & time
    let selectedTable = null;

    for (const table of candidateTables) {
      const isReserved = await Reservation.findOne({
        tableId: table._id,
        reservationDate: {
          $gte: startOfDay,
          $lte: endOfDay
        },
        reservationTime
      });

      if (!isReserved) {
        selectedTable = table;
        break; // Available table found!
      }
    }

    if (!selectedTable) {
      return sendError(res, 'No tables are available for the selected date, time slot, and party size', 400);
    }

    // 4. Create reservation
    const booking = await Reservation.create({
      customerId,
      customerName: req.customer.name,
      phone: req.customer.phone,
      tableId: selectedTable._id,
      reservationDate: startOfDay,
      reservationTime
    });

    // If reservation date is today, update table status dynamically to Reserved
    const isToday = new Date().toDateString() === new Date(reservationDate).toDateString();
    if (isToday) {
      selectedTable.status = 'Reserved';
      await selectedTable.save();
    }

    const populated = await booking.populate('tableId', 'tableNumber capacity status');

    return sendSuccess(res, 'Table reservation booked successfully', populated, 201);
  } catch (error) {
    next(error);
  }
};

// Get My Bookings
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Reservation.find({ customerId: req.customer._id })
      .populate('tableId', 'tableNumber capacity status')
      .sort({ reservationDate: 1, reservationTime: 1 });

    return sendSuccess(res, 'Customer bookings retrieved successfully', bookings);
  } catch (error) {
    next(error);
  }
};

// Cancel My Booking
const cancelBookingCustomer = async (req, res, next) => {
  try {
    const booking = await Reservation.findOne({
      _id: req.params.id,
      customerId: req.customer._id
    });

    if (!booking) {
      return sendError(res, 'Booking not found or not authorized to cancel', 404);
    }

    // Reset Table status if booked for today
    const isToday = new Date().toDateString() === new Date(booking.reservationDate).toDateString();
    if (isToday) {
      const table = await Table.findById(booking.tableId);
      if (table && table.status === 'Reserved') {
        table.status = 'Available';
        await table.save();
      }
    }

    await Reservation.findByIdAndDelete(req.params.id);

    return sendSuccess(res, 'Booking cancelled successfully');
  } catch (error) {
    next(error);
  }
};

// ==========================================
// PHASE 4 & 5: CUSTOMER ORDER PLACEMENT & TRACKING
// ==========================================

// Place Food Order
const placeOrderCustomer = async (req, res, next) => {
  try {
    const { tableId, items } = req.body;
    const customerId = req.customer._id;

    // Verify Table
    const table = await Table.findById(tableId);
    if (!table) {
      return sendError(res, 'Table not found', 404);
    }

    // Verify Customer has an active reservation for this table (Phase 8 requirement)
    const reservation = await Reservation.findOne({
      customerId: customerId,
      tableId: tableId
    });
    if (!reservation) {
      return sendError(res, 'You do not have an active booking for this table. Please book the table first.', 403);
    }

    if (!items || items.length === 0) {
      return sendError(res, 'Cannot submit an empty order', 400);
    }

    // Calculate total amount and verify items
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

    // Create Order
    const order = await Order.create({
      customerId,
      tableId,
      items: orderItems,
      totalAmount,
      status: 'Pending'
    });

    // Update Table status to Occupied
    table.status = 'Occupied';
    await table.save();

    // Deduct stock levels atomically and check low threshold warnings
    const inventoryAlerts = await deductInventoryForOrder(orderItems);

    const populated = await order.populate([
      { path: 'tableId', select: 'tableNumber capacity status' },
      { path: 'items.menuItemId', select: 'name category price' }
    ]);

    return sendSuccess(res, 'Order placed successfully by customer', {
      order: populated,
      alerts: inventoryAlerts
    }, 201);
  } catch (error) {
    next(error);
  }
};

// Get My Orders
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customerId: req.customer._id })
      .populate([
        { path: 'tableId', select: 'tableNumber capacity status' },
        { path: 'items.menuItemId', select: 'name category price' }
      ])
      .sort({ createdAt: -1 });

    return sendSuccess(res, 'Customer orders retrieved successfully', orders);
  } catch (error) {
    next(error);
  }
};

// Get Order Details (for status tracking)
const getOrderByIdCustomer = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      customerId: req.customer._id
    }).populate([
      { path: 'tableId', select: 'tableNumber capacity status' },
      { path: 'items.menuItemId', select: 'name category price' }
    ]);

    if (!order) {
      return sendError(res, 'Order not found or unauthorized to view', 404);
    }

    // Estimate prep time based on status
    let estimatedTime = 0;
    switch (order.status) {
      case 'Pending': estimatedTime = 20; break;
      case 'Preparing': estimatedTime = 15; break;
      case 'Ready': estimatedTime = 5; break;
      case 'Served': estimatedTime = 0; break;
      case 'Completed': estimatedTime = 0; break;
      case 'Cancelled': estimatedTime = 0; break;
    }

    return sendSuccess(res, 'Order status details retrieved successfully', {
      order,
      estimatedTimeMinutes: estimatedTime
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerCustomer,
  loginCustomer,
  getCustomerProfile,
  updateCustomerProfile,
  bookTableCustomer,
  getMyBookings,
  cancelBookingCustomer,
  placeOrderCustomer,
  getMyOrders,
  getOrderByIdCustomer
};
