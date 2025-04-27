const express = require('express');
const router = express.Router();
const Order = require('../models/orderModel');
const auth = require('../middleware/auth');

// @route   GET /api/orders
// @desc    Get all orders
// @access  Private/Admin
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('orderby', 'firstname lastname')
      .populate('products.product', 'title price');
    res.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
