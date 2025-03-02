const express = require("express");
const { createProduct, getSingleProduct, getAllProducts, updateProduct, deleteProduct,  addToWishlist,
    rating, } = require("../controller/productController");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");
const { uploadPhoto } = require("../middlewares/uploadImage");

const router = express.Router();

// Route for creating a product 
router.post("/", authMiddleware, isAdmin, createProduct);

// Route for getting a single product by ID 
router.get("/:id", getSingleProduct);

// Route for getting all products 
router.get("/", getAllProducts);

// Route for updating a product 
router.put("/:id", authMiddleware, isAdmin, updateProduct);  

// Route for deleting a product 
router.delete("/:id", authMiddleware, isAdmin, deleteProduct); 


router.put("/wishlist", authMiddleware, addToWishlist);
router.put("/rating", authMiddleware, rating);

module.exports = router;
