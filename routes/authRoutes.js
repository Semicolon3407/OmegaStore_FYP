const express = require('express');
const {
  loginUser,
  refreshAccessToken, 
  registerUser,
  getallUser,
  getSingleUser,
  deleteUser,
  updateUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logoutUser
} = require('../controller/userController');

const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

// Route for user registration
router.post('/register', registerUser);

// Route for user login
router.post('/login', loginUser);

// Route for user logout
router.get('/logout', logoutUser);

// Refresh  Token
router.get('/refresh', handleRefreshToken);

// Route to get all users
router.get('/all-users', authMiddleware, isAdmin, getallUser);

// Route to get a single user by ID
router.get('/:id', authMiddleware, isAdmin, getSingleUser);

// Route to delete a user by ID
router.delete('/:id', authMiddleware, isAdmin, deleteUser);

// Route to update a user by ID
router.put('/update-user', authMiddleware, updateUser);

// Route to block a user (Admin only)
router.put('/block/:id', authMiddleware, isAdmin, blockUser);

// Route to unblock a user (Admin only)
router.put('/unblock/:id', authMiddleware, isAdmin, unblockUser);


// Route to test admin access
router.get("/admin-route", authMiddleware, isAdmin, (req, res) => {
  res.status(200).json({ message: "Admin access granted." });
});

module.exports = router;