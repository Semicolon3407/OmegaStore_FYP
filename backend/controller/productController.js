// controllers/productController.js
const Product = require("../models/productModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const mongoose = require("mongoose");

// Create a new product
const createProduct = asyncHandler(async (req, res) => {
  try {
    if (!req.body.title || typeof req.body.title !== "string") {
      return res.status(400).json({
        success: false,
        message: "Product name is required and must be a string",
      });
    }
    req.body.slug = slugify(req.body.title, { lower: true, strict: true });
    const newProduct = await Product.create(req.body);
    res.status(201).json({
      success: true,
      message: "Product created successfully!",
      product: newProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get a single product by ID
const getSingleProduct = asyncHandler(async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(req.params.id).populate('ratings.postedby', 'firstname lastname'); // Updated to fetch firstname and lastname
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get all products with filtering, sorting, and pagination
const getAllProducts = asyncHandler(async (req, res) => {
  try {
    const {
      category,
      brand,
      price,
      color,
      sortBy,
      sortOrder,
      excludeFields,
      limit,
      page,
      search,
    } = req.query;

    let filter = {};

    // Search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (price) {
      const [min, max] = price.split("-").map(Number);
      if (!isNaN(min) && !isNaN(max)) filter.price = { $gte: min, $lte: max };
    }
    if (color) filter.color = color;

    let sort = { createdAt: -1 }; // Default sorting by newest
    if (sortBy) sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    let projection = {};
    if (excludeFields) {
      excludeFields.split(",").forEach((field) => (projection[field] = 0));
    }

    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const [products, totalProducts] = await Promise.all([
      Product.find(filter)
        .select(projection)
        .sort(sort)
        .skip(skip)
        .limit(limitNumber)
        .populate('ratings.postedby', 'firstname lastname'), // Updated to fetch firstname and lastname
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      products,
      pagination: {
        currentPage: pageNumber,
        limit: limitNumber,
        totalProducts,
        totalPages: Math.ceil(totalProducts / limitNumber),
        hasNextPage: pageNumber * limitNumber < totalProducts,
        hasPreviousPage: pageNumber > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Update product
const updateProduct = asyncHandler(async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    if (req.body.title) {
      req.body.slug = slugify(req.body.title, { lower: true, strict: true });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('ratings.postedby', 'firstname lastname'); // Updated to fetch firstname and lastname

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully!",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Delete product
const deleteProduct = asyncHandler(async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Product rating
const rating = asyncHandler(async (req, res) => {
  const { star, comment, prodId } = req.body;
  const userId = req.user._id;

  // Input validation
  if (!prodId || !mongoose.Types.ObjectId.isValid(prodId)) {
    return res.status(400).json({ success: false, message: "Invalid product ID" });
  }
  if (!star || star < 1 || star > 5) {
    return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
  }

  // Find the product
  const product = await Product.findById(prodId);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  // Add new rating (no check for existing rating to allow multiple reviews)
  product.ratings.push({ star, comment: comment || "", postedby: userId });

  // Calculate average rating
  const totalRatings = product.ratings.length;
  const ratingSum = product.ratings.reduce((sum, r) => sum + r.star, 0);
  product.totalrating = totalRatings > 0 ? Number((ratingSum / totalRatings).toFixed(1)) : 0;

  // Save and populate
  await product.save();
  const updatedProduct = await Product.findById(prodId).populate('ratings.postedby', 'firstname lastname'); // Updated to fetch firstname and lastname

  res.status(200).json({
    success: true,
    message: "Rating added successfully",
    product: updatedProduct,
  });
});

module.exports = {
  createProduct,
  getSingleProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  rating,
};