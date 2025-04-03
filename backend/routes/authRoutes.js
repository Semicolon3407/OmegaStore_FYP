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
  getUserCarts,
  emptyCart,
  applyCoupon,
  createOrder,
  getOrders,
  updateOrderStatus,
  getAllOrders,
  removeFromCart,
  addToWishlist,
  removeFromWishlist,
  getCompare, // New
  addToCompare, // New
  removeFromCompare, // New
  clearCompare, // New
} = require("../controller/userController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

// Auth routes
router.post("/register", createUser);
router.post("/login", loginUser);
router.post("/admin-login", loginAdmin);
router.get("/refresh", handleRefreshToken);
router.get("/logout", logout);

// Password management
router.post("/forgot-password-token", forgotPasswordToken);
router.put("/reset-password/:token", resetPassword);
router.put("/password", authMiddleware, updatePassword);

// User management
router.get("/all-users", authMiddleware, isAdmin, getallUser);
router.get("/get-user/:id", authMiddleware, getaUser);
router.put("/edit-user", authMiddleware, updatedUser);
router.delete("/delete-user/:id", authMiddleware, isAdmin, deleteaUser);
router.put("/save-address", authMiddleware, saveAddress);
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser);
router.put("/unblock-user/:id", authMiddleware, isAdmin, unblockUser);

// Cart routes
router.post("/cart", authMiddleware, userCart);
router.get("/user-cart", authMiddleware, getUserCarts);
router.delete("/empty-cart", authMiddleware, emptyCart);
router.post("/cart/applycoupon", authMiddleware, applyCoupon);
router.post("/cart/cash-order", authMiddleware, createOrder);
router.delete("/cart/:productId", authMiddleware, removeFromCart);

// Order routes
router.get("/get-orders", authMiddleware, getOrders);
router.get("/getallorders", authMiddleware, isAdmin, getAllOrders);
router.put("/order/update-order/:id", authMiddleware, isAdmin, updateOrderStatus);

// Wishlist routes
router.get("/wishlist", authMiddleware, getWishlist);
router.put("/wishlist", authMiddleware, addToWishlist);
router.delete("/wishlist/:productId", authMiddleware, removeFromWishlist);

// Compare routes
router.get("/compare", authMiddleware, getCompare);
router.put("/compare", authMiddleware, addToCompare);
router.delete("/compare/:productId", authMiddleware, removeFromCompare);
router.delete("/compare/clear", authMiddleware, clearCompare);

module.exports = router;