const asyncHandler = require("express-async-handler");
const fs = require("fs").promises;
const path = require("path");

// Upload images to local storage
const uploadImages = asyncHandler(async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const imagePaths = req.files.map((file) => ({
      url: `/images/products/${file.filename}`,
      type: file.originalname.includes("main") ? "main" : "sub",
    }));

    res.status(200).json({
      message: "Images uploaded successfully",
      images: imagePaths,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Server error during image upload" });
  }
});

// Delete an image from local storage
const deleteImages = asyncHandler(async (req, res) => {
  const { filename } = req.params; // Expecting filename instead of ID
  const filePath = path.join(__dirname, "../public/images/products", filename);

  try {
    await fs.access(filePath);
    await fs.unlink(filePath);
    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(404).json({ message: "Image not found" });
    }
    console.error("Delete error:", error);
    res.status(500).json({ message: "Server error during image deletion" });
  }
});

module.exports = { uploadImages, deleteImages };