const express = require("express");
const {
  createSaleProduct,
  getSingleSaleProduct,
  getAllSaleProducts,
  updateSaleProduct,
  deleteSaleProduct,
  rating,
} = require("../controller/saleProductController");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");
const { uploadPhoto } = require("../middlewares/uploadImage");

const router = express.Router();

// Admin-only routes (sale product management)
router.post("/", authMiddleware, isAdmin, uploadPhoto.single("image"), createSaleProduct);
router.put("/:id", authMiddleware, isAdmin, uploadPhoto.single("image"), updateSaleProduct);
router.delete("/:id", authMiddleware, isAdmin, deleteSaleProduct);

// Public routes (sale product retrieval)
router.get("/", getAllSaleProducts);
router.get("/:id", getSingleSaleProduct);

// User interaction routes (requires authentication)
router.put("/rating", authMiddleware, rating); // Rate a sale product

module.exports = router;