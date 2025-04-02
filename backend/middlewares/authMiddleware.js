const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

// Middleware to authenticate users
const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token attached to header. Authorization required." });
  }

  token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token is missing or malformed in Authorization header." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded); // Debug log
    if (!decoded.id) {
      return res.status(401).json({ message: "Invalid token payload. No user ID found." });
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found. Authorization failed." });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "Your account is blocked. Please contact support." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error); // Log for debugging
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired. Please log in again." });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token. Authorization failed." });
    }
    res.status(401).json({ message: "Not authorized. Token verification failed." });
  }
});

// Middleware to check if user is an admin
const isAdmin = asyncHandler(async (req, res, next) => {
  // Ensure req.user exists (should be set by authMiddleware)
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required before admin check." });
  }

  // Check if user has admin role
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin privileges required." });
  }

  // Optional logging for debugging (uncomment if needed)
  // console.log(`Admin access granted for user: ${req.user.email}`);

  next();
});

module.exports = { authMiddleware, isAdmin };