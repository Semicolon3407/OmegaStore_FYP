const express = require('express');
const {
  registerUser,
  loginUser,
  getallUser,
  getSingleUser,
  deleteUser,
  updateUser
} = require('../controller/authcontrol');  // Make sure the import matches your file structure

const router = express.Router();

// Route for user registration
router.post('/register', registerUser);

// Route for user login
router.post('/login', loginUser);

// Route to get all users
router.get('/all-users', getallUser);

// Route to get a single user by ID
router.get('/:id', getSingleUser);

// Route to delete a user by ID
router.delete('/:id', deleteUser);

// Route to update a user by ID
router.put('/:id', updateUser);  // request to update a user by ID

module.exports = router;
