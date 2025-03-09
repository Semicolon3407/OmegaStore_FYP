const express = require("express");
const {
  createUser,
  loginUser,
  getallUser,
  getaUser,
  deleteaUser,
  updatedUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logout,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  loginAdmin,
  getWishlist,
  saveAddress,
  userCart,
  getUserCart,
  emptyCart,
  applyCoupon,
  createOrder,
  getOrders,
  updateOrderStatus,
  getAllOrders,
} = require("../controller/userController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

// User registration and authentication routes
router.post("/register", createUser); // Register a new user
router.post("/login", loginUser); // User login
router.post("/admin-login", loginAdmin); // Admin login

// Password management routes
router.post("/forgot-password-token", forgotPasswordToken); // Generate forgot password token
router.put("/reset-password/:token", resetPassword); // Reset password using token
router.put("/password", authMiddleware, updatePassword); // Update password for authenticated user

// User and Admin functionalities
router.get("/all-users", getallUser); // Get all users (Admin access required)
router.get("/:id", authMiddleware, isAdmin, getaUser); // Get details of a specific user
router.put("/edit-user", authMiddleware, updatedUser); // Update user details
router.delete("/:id", deleteaUser); // Delete a user
router.put("/save-address", authMiddleware, saveAddress); // Save user address

// User cart management routes
router.post("/cart", authMiddleware, userCart); // Add items to cart
router.get("/cart", authMiddleware, getUserCart); // Get user cart details
router.delete("/empty-cart", authMiddleware, emptyCart); // Empty user cart
router.post("/cart/applycoupon", authMiddleware, applyCoupon); // Apply coupon to cart
router.post("/cart/cash-order", authMiddleware, createOrder); // Place order with cash on delivery

// Order management routes
router.get("/get-orders", authMiddleware, getOrders); // Get user orders
router.get("/getallorders", authMiddleware, isAdmin, getAllOrders); // Get all orders (Admin access required)
router.put("/order/update-order/:id", authMiddleware, isAdmin, updateOrderStatus); // Update order status

// Wishlist management
router.get("/wishlist", authMiddleware, getWishlist); // Get user wishlist

// User authentication token management
router.get("/refresh", handleRefreshToken); // Refresh authentication token
router.get("/logout", logout); // Logout user

// Admin controls for user management
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser); // Block a user
router.put("/unblock-user/:id", authMiddleware, isAdmin, unblockUser); // Unblock a user

module.exports = router;
