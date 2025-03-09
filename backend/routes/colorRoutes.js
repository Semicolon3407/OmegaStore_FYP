const express = require("express");
const {
  createColor,
  updateColor,
  deleteColor,
  getColor,
  getallColor,
} = require("../controller/colorController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

// Color management routes
router.post("/", authMiddleware, isAdmin, createColor); // Create a new color (Admin only)
router.put("/:id", authMiddleware, isAdmin, updateColor); // Update color details (Admin only)
router.delete("/:id", authMiddleware, isAdmin, deleteColor); // Delete a color (Admin only)
router.get("/:id", getColor); // Get a specific color by ID
router.get("/", getallColor); // Get all colors

module.exports = router;
