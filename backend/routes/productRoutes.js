const express = require("express");
const {
  createProduct,
  getSingleProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  rating,
} = require("../controller/productController");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");
const { uploadPhoto } = require("../middlewares/uploadImage");

const router = express.Router();

// Admin-only routes (product management)
router.post("/", authMiddleware, isAdmin, uploadPhoto.single("image"), createProduct); // Create product with image upload
router.put("/:id", authMiddleware, isAdmin, uploadPhoto.single("image"), updateProduct); // Update product with optional image upload
router.delete("/:id", authMiddleware, isAdmin, deleteProduct); // Delete product

// Public routes (product retrieval)
router.get("/", getAllProducts); // Get all products (public)
router.get("/:id", getSingleProduct); // Get single product (public)

// User interaction routes (requires authentication)
router.put('/items/rating', authMiddleware, rating); // Rating requires only authentication

module.exports = router;