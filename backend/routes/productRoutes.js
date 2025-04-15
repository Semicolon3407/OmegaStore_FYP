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
const { uploadPhoto, productImgResize } = require("../middlewares/uploadImage");

const router = express.Router();

// Admin-only routes (product management)
router.post(
  "/",
  authMiddleware,
  isAdmin,
  uploadPhoto.array("images", 10),
  productImgResize,
  createProduct
);
router.put(
  "/:id",
  authMiddleware,
  isAdmin,
  uploadPhoto.array("images", 10),
  productImgResize,
  updateProduct
);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);

// Public routes (product retrieval)
router.get("/", getAllProducts);
router.get("/:id", getSingleProduct);

// User interaction routes (requires authentication)
router.put("/items/rating", authMiddleware, rating);

module.exports = router;