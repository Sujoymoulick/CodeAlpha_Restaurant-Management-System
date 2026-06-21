const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const mongoose = require('mongoose');
const { sendSuccess } = require('../utils/responseFormatter');

// Helper to aggregate sales statistics for a given date range
const getSalesStats = async (startDate, endDate) => {
  // Aggregate total orders and revenue
  const summary = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $ne: 'Cancelled' } // Exclude cancelled orders from revenue
      }
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' }
      }
    }
  ]);

  const totalOrders = summary.length > 0 ? summary[0].totalOrders : 0;
  const totalRevenue = summary.length > 0 ? summary[0].totalRevenue : 0;

  // Aggregate most sold items
  const mostSoldItems = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $ne: 'Cancelled' }
      }
    },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.menuItemId',
        totalQuantity: { $sum: '$items.quantity' }
      }
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'menuitems', // Collection name is lowercase plural
        localField: '_id',
        foreignField: '_id',
        as: 'menuItem'
      }
    },
    { $unwind: '$menuItem' },
    {
      $project: {
        _id: 1,
        name: '$menuItem.name',
        category: '$menuItem.category',
        price: '$menuItem.price',
        totalQuantity: 1
      }
    }
  ]);

  return {
    totalOrders,
    totalRevenue,
    mostSoldItems
  };
};

// @desc    Get daily sales report
// @route   GET /api/reports/daily-sales
// @access  Private/Admin
const getDailySalesReport = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const stats = await getSalesStats(todayStart, todayEnd);

    return sendSuccess(res, 'Daily sales report retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly sales report
// @route   GET /api/reports/monthly-sales
// @access  Private/Admin
const getMonthlySalesReport = async (req, res, next) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    const stats = await getSalesStats(startOfMonth, endOfMonth);

    return sendSuccess(res, 'Monthly sales report retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

// @desc    Get low stock inventory items
// @route   GET /api/reports/low-stock
// @access  Private/Admin
const getLowStockReport = async (req, res, next) => {
  try {
    // Find where quantity <= lowStockThreshold
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] }
    }).sort({ quantity: 1 });

    return sendSuccess(res, 'Low stock items report retrieved successfully', {
      lowStockItems,
      count: lowStockItems.length
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDailySalesReport,
  getMonthlySalesReport,
  getLowStockReport
};
