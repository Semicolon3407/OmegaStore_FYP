const express = require("express");
const { uploadImages, deleteImages } = require("../controller/uploadController");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");
const { uploadPhoto, productImgResize } = require("../middlewares/uploadImage");

const router = express.Router();

// Route to upload images for products
router.post(
  "/",
  authMiddleware,
  isAdmin,
  uploadPhoto.array("images", 10), // Handle up to 10 images
  productImgResize,
  uploadImages
);

// Route to delete an image by filename
router.delete("/delete-img/:filename", authMiddleware, isAdmin, deleteImages);

module.exports = router;