const Coupon = require("../models/couponModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMangodbid");

// Create a new coupon
const createCoupon = asyncHandler(async (req, res) => {
  const { name, expiry, discount, userId } = req.body;

  // Input validation
  if (!name || !expiry || !discount) {
    return res.status(400).json({ message: "Name, expiry, and discount are required" });
  }

  if (typeof name !== "string" || name.trim().length === 0) {
    return res.status(400).json({ message: "Coupon name must be a non-empty string" });
  }

  if (isNaN(Date.parse(expiry))) {
    return res.status(400).json({ message: "Expiry must be a valid date" });
  }

  const discountNum = Number(discount);
  if (isNaN(discountNum) || discountNum < 1 || discountNum > 100) {
    return res.status(400).json({ message: "Discount must be a number between 1 and 100" });
  }

  if (userId) {
    try {
      validateMongoDbId(userId);
    } catch (error) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
  }

  try {
    const coupon = await Coupon.create({
      name: name.toUpperCase().trim(),
      expiry: new Date(expiry),
      discount: discountNum,
      user: userId || null,
    });

    // Populate user details in the response
    const populatedCoupon = await Coupon.findById(coupon._id).populate(
      "user",
      "firstname lastname email"
    );
    res.status(201).json(populatedCoupon);
  } catch (error) {
    res.status(400).json({ message: "Failed to create coupon", error: error.message });
  }
});

// Get all coupons
const getAllCoupons = asyncHandler(async (req, res) => {
  try {
    const coupons = await Coupon.find().populate("user", "firstname lastname email");
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch coupons", error: error.message });
  }
});

// Get a single coupon by ID
const getCouponById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    validateMongoDbId(id);
  } catch (error) {
    return res.status(400).json({ message: "Invalid coupon ID" });
  }

  try {
    const coupon = await Coupon.findById(id).populate("user", "firstname lastname email");
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch coupon", error: error.message });
  }
});

// Update a coupon
const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, expiry, discount, userId } = req.body;

  try {
    validateMongoDbId(id);
  } catch (error) {
    return res.status(400).json({ message: "Invalid coupon ID" });
  }

  if (userId) {
    try {
      validateMongoDbId(userId);
    } catch (error) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
  }

  // Prepare update object with only provided fields
  const updateData = {};
  if (name) {
    if (typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ message: "Coupon name must be a non-empty string" });
    }
    updateData.name = name.toUpperCase().trim();
  }
  if (expiry) {
    if (isNaN(Date.parse(expiry))) {
      return res.status(400).json({ message: "Expiry must be a valid date" });
    }
    updateData.expiry = new Date(expiry);
  }
  if (discount !== undefined) {
    const discountNum = Number(discount);
    if (isNaN(discountNum) || discountNum < 1 || discountNum > 100) {
      return res.status(400).json({ message: "Discount must be a number between 1 and 100" });
    }
    updateData.discount = discountNum;
  }
  if (userId !== undefined) {
    updateData.user = userId || null; // Allow clearing user by sending empty string
  }

  try {
    const coupon = await Coupon.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("user", "firstname lastname email");

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.json(coupon);
  } catch (error) {
    res.status(400).json({ message: "Failed to update coupon", error: error.message });
  }
});

// Delete a coupon
const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    validateMongoDbId(id);
  } catch (error) {
    return res.status(400).json({ message: "Invalid coupon ID" });
  }

  try {
    const coupon = await Coupon.findByIdAndDelete(id).populate(
      "user",
      "firstname lastname email"
    );
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.json({ message: "Coupon deleted successfully", deletedCoupon: coupon });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete coupon", error: error.message });
  }
});

module.exports = {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
};