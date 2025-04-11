const express = require("express");
const {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
} = require("../controller/couponContoller");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

// Coupon management routes
router.post("/", authMiddleware, isAdmin, createCoupon); // Create a new coupon (Admin only)
router.get("/", authMiddleware, getAllCoupons); // Get all coupons (Allow users to view available coupons)
router.get("/:id", authMiddleware, isAdmin, getCouponById); // Get a specific coupon by ID (Admin only)
router.put("/:id", authMiddleware, isAdmin, updateCoupon); // Update a coupon (Admin only)
router.delete("/:id", authMiddleware, isAdmin, deleteCoupon); // Delete a coupon (Admin only)

module.exports = router;