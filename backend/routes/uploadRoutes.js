const express = require("express");
const { uploadImages, deleteImages } = require("../controller/uploadController");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");
const { uploadPhoto, productImgResize } = require("../middlewares/uploadImage");

const router = express.Router();

// Route to upload images for products
// The images are uploaded, resized, and then processed (only accessible to authenticated admins)
router.post(
"/",
  authMiddleware,                      // Middleware to check if the user is authenticated
  isAdmin,                             // Middleware to check if the user has admin privileges
  uploadPhoto.array("images", 10),      // Middleware to handle multiple image uploads (max 10 images)
  productImgResize,                    // Middleware to resize the uploaded images
  uploadImages                         // Controller function to save the uploaded images
);

// Route to delete an image by its ID (only accessible to authenticated admins)
router.delete("/delete-img/:id", authMiddleware, isAdmin, deleteImages);

module.exports = router;
