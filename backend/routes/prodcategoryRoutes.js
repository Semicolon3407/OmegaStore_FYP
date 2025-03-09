const express = require("express");
const {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getallCategory,
} = require("../controller/prodcategoryController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

// Product category management routes
router.post("/", authMiddleware, isAdmin, createCategory); // Create a new category (Admin only)
router.put("/:id", authMiddleware, isAdmin, updateCategory); // Update a category (Admin only)
router.delete("/:id", authMiddleware, isAdmin, deleteCategory); // Delete a category (Admin only)
router.get("/:id", getCategory); // Get a specific category by ID
router.get("/", getallCategory); // Get all categories

module.exports = router;