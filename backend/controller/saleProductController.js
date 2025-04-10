// controllers/saleProductController.js
const SaleProduct = require("../models/saleProductModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const mongoose = require("mongoose");

// Create a new sale product
const createSaleProduct = asyncHandler(async (req, res) => {
  try {
    if (!req.body.title || typeof req.body.title !== "string") {
      return res.status(400).json({
        success: false,
        message: "Sale product name is required and must be a string",
      });
    }
    req.body.slug = slugify(req.body.title, { lower: true, strict: true });
    const newSaleProduct = await SaleProduct.create(req.body);
    res.status(201).json({
      success: true,
      message: "Sale product created successfully!",
      saleProduct: newSaleProduct,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get a single sale product by ID
const getSingleSaleProduct = asyncHandler(async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid sale product ID" 
      });
    }

    const saleProduct = await SaleProduct.findById(req.params.id).populate('ratings.postedby', 'firstname lastname'); // Populate firstname and lastname
    if (!saleProduct) {
      return res.status(404).json({ 
        success: false, 
        message: "Sale product not found" 
      });
    }
    res.status(200).json({ 
      success: true, 
      saleProduct 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get all sale products with filtering, sorting, and pagination
const getAllSaleProducts = asyncHandler(async (req, res) => {
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
      if (!isNaN(min) && !isNaN(max)) filter.salePrice = { $gte: min, $lte: max };
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

    const [saleProducts, totalSaleProducts] = await Promise.all([
      SaleProduct.find(filter)
        .select(projection)
        .sort(sort)
        .skip(skip)
        .limit(limitNumber)
        .populate('ratings.postedby', 'firstname lastname'), // Populate firstname and lastname
      SaleProduct.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      count: saleProducts.length,
      saleProducts,
      pagination: {
        currentPage: pageNumber,
        limit: limitNumber,
        totalSaleProducts,
        totalPages: Math.ceil(totalSaleProducts / limitNumber),
        hasNextPage: pageNumber * limitNumber < totalSaleProducts,
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

// Update sale product
const updateSaleProduct = asyncHandler(async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid sale product ID" 
      });
    }

    if (req.body.title) {
      req.body.slug = slugify(req.body.title, { lower: true, strict: true });
    }

    const saleProduct = await SaleProduct.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    ).populate('ratings.postedby', 'firstname lastname'); // Populate firstname and lastname

    if (!saleProduct) {
      return res.status(404).json({ 
        success: false, 
        message: "Sale product not found" 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "Sale product updated successfully!", 
      saleProduct 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Delete sale product
const deleteSaleProduct = asyncHandler(async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid sale product ID" 
      });
    }

    const saleProduct = await SaleProduct.findByIdAndDelete(req.params.id);
    if (!saleProduct) {
      return res.status(404).json({ 
        success: false, 
        message: "Sale product not found" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Sale product deleted successfully!"
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Sale product rating
const rating = asyncHandler(async (req, res) => {
  const { star, comment, prodId } = req.body;
  const userId = req.user._id;

  // Input validation
  if (!prodId || !mongoose.Types.ObjectId.isValid(prodId)) {
    return res.status(400).json({ success: false, message: "Invalid sale product ID" });
  }
  if (!star || star < 1 || star > 5) {
    return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
  }

  // Find the sale product
  const saleProduct = await SaleProduct.findById(prodId);
  if (!saleProduct) {
    return res.status(404).json({ success: false, message: "Sale product not found" });
  }

  // Add new rating (no check for existing rating to allow multiple reviews)
  saleProduct.ratings.push({ star, comment: comment || "", postedby: userId });

  // Calculate average rating
  const totalRatings = saleProduct.ratings.length;
  const ratingSum = saleProduct.ratings.reduce((sum, r) => sum + r.star, 0);
  saleProduct.totalrating = totalRatings > 0 ? Number((ratingSum / totalRatings).toFixed(1)) : 0;

  // Save and populate
  await saleProduct.save();
  const updatedSaleProduct = await SaleProduct.findById(prodId).populate('ratings.postedby', 'firstname lastname'); // Populate firstname and lastname

  res.status(200).json({
    success: true,
    message: "Rating added successfully",
    saleProduct: updatedSaleProduct,
  });
});

module.exports = { 
  createSaleProduct, 
  getSingleSaleProduct, 
  getAllSaleProducts, 
  updateSaleProduct, 
  deleteSaleProduct,
  rating 
};