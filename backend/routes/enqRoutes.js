const express = require("express");
const {
  createEnquiry,
  updateEnquiry,
  deleteEnquiry,
  getEnquiry,
  getallEnquiry,
} = require("../controller/enqController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

// Enquiry management routes
router.post("/", createEnquiry); // Create a new enquiry
router.put("/:id", authMiddleware, isAdmin, updateEnquiry); // Update an enquiry (Admin only)
router.delete("/:id", authMiddleware, isAdmin, deleteEnquiry); // Delete an enquiry (Admin only)
router.get("/:id", getEnquiry); // Get a specific enquiry by ID
router.get("/", getallEnquiry); // Get all enquiries

module.exports = router;
