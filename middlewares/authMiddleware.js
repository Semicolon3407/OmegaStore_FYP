const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

// Authentication Middleware
const authMiddleware = asyncHandler(async (req, res, next) => {
    let token;
    
    // Check if token is provided and starts with 'Bearer'
    if (req.headers?.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
        
        try {
            // Verify Token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach user object to request, excluding password
            const user = await User.findById(decoded.id).select("-password");
            if (!user) {
                res.status(401);
                throw new Error("User not found. Authorization failed.");
            }
            
            // Check if user is blocked
            if (user.isBlocked) {
                res.status(403);
                throw new Error("Your account is blocked. Please contact support.");
            }
            
            req.user = user;
            next();
        } catch (error) {
            res.status(401);
            throw new Error("Not authorized. Invalid or expired token.");
        }
    } else {
        res.status(401);
        throw new Error("No token attached to header.");
    }
});

// Admin Middleware
const isAdmin = asyncHandler(async (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403);
        throw new Error("Access denied. Admins only.");
    }
});

module.exports = { authMiddleware, isAdmin };
