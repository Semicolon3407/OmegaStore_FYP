const express = require("express");
const router = express.Router();
const {
  createTracking,
  getTracking,
  updateTrackingStatus,
  getTrackingByOrder,
} = require("../controllers/deliveryTrackingController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

// Create tracking for an order (admin only)
router.post("/", authMiddleware, isAdmin, createTracking);

// Get tracking by tracking number
router.get("/:trackingNumber", authMiddleware, getTracking);

// Get tracking by order ID
router.get("/order/:orderId", authMiddleware, getTrackingByOrder);

// Update tracking status (admin only)
router.put("/:trackingNumber/status", authMiddleware, isAdmin, updateTrackingStatus);

module.exports = router; 