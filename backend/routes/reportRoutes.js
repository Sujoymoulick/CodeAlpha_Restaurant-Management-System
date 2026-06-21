const express = require('express');
const {
  getDailySalesReport,
  getMonthlySalesReport,
  getLowStockReport
} = require('../controllers/reportController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(adminOnly); // All reporting routes are restricted to Admin users only

router.get('/daily-sales', getDailySalesReport);
router.get('/monthly-sales', getMonthlySalesReport);
router.get('/low-stock', getLowStockReport);

module.exports = router;
