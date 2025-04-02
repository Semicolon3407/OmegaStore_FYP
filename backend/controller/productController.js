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
      message: error.message 
    });
  }
});

// Get a single product by ID
const getSingleProduct = asyncHandler(async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid product ID" 
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }
    res.status(200).json({ 
      success: true, 
      product 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
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
      search 
    } = req.query;
    
    let filter = {};
    
    // Search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
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
        .limit(limitNumber),
      Product.countDocuments(filter)
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
        hasPreviousPage: pageNumber > 1
      },
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Update product
const updateProduct = asyncHandler(async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid product ID" 
      });
    }

    if (req.body.title) {
      req.body.slug = slugify(req.body.title, { lower: true, strict: true });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "Product updated successfully!", 
      product 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Delete product
// Delete product
const deleteProduct = asyncHandler(async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid product ID" 
      });
    }

    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    // Add the missing response statement
    res.status(200).json({
      success: true,
      message: "Product deleted successfully!"
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
}); 

   
    


// Product rating
const rating = asyncHandler(async (req, res) => {
  try {
    const { star, comment, prodId } = req.body;

    if (!prodId || !mongoose.Types.ObjectId.isValid(prodId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid product ID" 
      });
    }

    if (!star || star < 1 || star > 5) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide a rating between 1 and 5" 
      });
    }

    const product = await Product.findById(prodId);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    // Check if user already rated this product
    const existingRatingIndex = product.ratings.findIndex(
      (r) => r.postedby.toString() === req.user._id.toString()
    );

    if (existingRatingIndex >= 0) {
      // Update existing rating
      product.ratings[existingRatingIndex].star = star;
      product.ratings[existingRatingIndex].comment = comment || "";
    } else {
      // Add new rating
      product.ratings.push({
        star,
        comment: comment || "",
        postedby: req.user._id,
      });
    }

    // Calculate average rating
    const totalRating = product.ratings.length;
    const ratingSum = product.ratings.reduce((sum, r) => sum + r.star, 0);
    product.totalrating = Math.round((ratingSum / totalRating) * 10) / 10; // Round to 1 decimal place

    await product.save();

    res.status(200).json({
      success: true,
      message: existingRatingIndex >= 0 
        ? "Rating updated successfully" 
        : "Rating added successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = { 
  createProduct, 
  getSingleProduct, 
  getAllProducts, 
  updateProduct, 
  deleteProduct,
  rating 
};