const express = require("express");
// Importing necessary controller functions for product operations
const {
  createProduct,          
  getSingleProduct,       // Function to get a single product by ID
  getAllProducts,         // Function to get all products
  updateProduct,          // Function to update an existing product
  deleteProduct,          // Function to delete a product
  addToWishlist,          // Function to add a product to the user's wishlist
  rating,                 // Function to add a rating for a product
} = require("../controller/productController");

// Importing authentication and authorization middlewares
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");

// Importing the file upload middleware
const { uploadPhoto } = require("../middlewares/uploadImage");

const router = express.Router();

// Product management routes
router.post("/", authMiddleware, isAdmin, createProduct); // Create a new product (only accessible to Admins)
router.get("/:id", getSingleProduct); // Get a single product by its ID (accessible to everyone)
router.get("/", getAllProducts); // Get a list of all products (accessible to everyone)
router.put("/:id", authMiddleware, isAdmin, updateProduct); // Update an existing product (only accessible to Admins)
router.delete("/:id", authMiddleware, isAdmin, deleteProduct); // Delete a product (only accessible to Admins)

// User interaction routes
router.put("/wishlist", authMiddleware, addToWishlist); // Add a product to the user's wishlist (only accessible to authenticated users)
router.put("/rating", authMiddleware, rating); // Rate a product (only accessible to authenticated users)

module.exports = router;
