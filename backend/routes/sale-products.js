const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');
const auth = require('../middleware/auth');

// @route   GET /api/sale-products
// @desc    Get all products on sale
// @access  Public
router.get('/', async (req, res) => {
  try {
    const saleProducts = await Product.find({ onSale: true });
    res.json({ saleProducts });
  } catch (error) {
    console.error('Error fetching sale products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
