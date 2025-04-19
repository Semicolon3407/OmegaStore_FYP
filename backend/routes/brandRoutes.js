const express = require("express");
const {
  createBrand,
  updateBrand,
  deleteBrand,
  getBrand,
  getallBrand,
} = require("../controller/brandController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const { uploadBrand } = require("../middlewares/multerBrand");
const router = express.Router();

// Brand management routes
router.post("/", authMiddleware, isAdmin, uploadBrand.single("image"), createBrand); // Create a new brand (Admin only)
router.put("/:id", authMiddleware, isAdmin, uploadBrand.single("image"), updateBrand); // Update brand details (Admin only)
router.delete("/:id", authMiddleware, isAdmin, deleteBrand); // Delete a brand (Admin only)
router.get("/:id", getBrand); // Get a specific brand by ID
router.get("/", getallBrand); // Get all brands

module.exports = router;
