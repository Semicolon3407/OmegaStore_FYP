const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

// @route   GET /api/revenue/all
// @desc    Get all revenue statistics
// @access  Private/Admin
router.get('/all', auth, async (req, res) => {
  try {
    const Order = mongoose.model('Order');
    
    // Get all completed orders
    const orders = await Order.find({ orderStatus: 'Delivered' });
    
    // Calculate total revenue and breakdown by payment method
    const total = orders.reduce((acc, order) => acc + (order.paymentIntent?.amount || 0), 0);
    const esewa = orders
      .filter(order => order.paymentIntent?.method === 'eSewa')
      .reduce((acc, order) => acc + (order.paymentIntent?.amount || 0), 0);
    const cod = orders
      .filter(order => order.paymentIntent?.method === 'Cash on Delivery')
      .reduce((acc, order) => acc + (order.paymentIntent?.amount || 0), 0);

    res.json({ total, esewa, cod });
  } catch (error) {
    console.error('Error fetching revenue stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/revenue/esewa
// @desc    Get total revenue from eSewa payments
// @access  Private/Admin
router.get('/esewa', auth, async (req, res) => {
  try {
    const Order = mongoose.model('Order');
    const orders = await Order.find({
      'paymentIntent.method': 'eSewa',
      orderStatus: 'Delivered'
    });
    const total = orders.reduce((acc, order) => acc + (order.paymentIntent?.amount || 0), 0);
    res.json({ total });
  } catch (error) {
    console.error('Error fetching eSewa revenue:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
