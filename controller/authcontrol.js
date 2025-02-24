const User = require('../models/usermodel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');

// Register User
const registerUser = asyncHandler(async (req, res) => {
  const { firstname, lastname, email, mobile, password } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create new user
  const user = await User.create({
    firstname,
    lastname,
    email,
    mobile,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      mobile: user.mobile,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// Login User
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check user existence
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.status(200).json({
      _id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      mobile: user.mobile,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});



// Get all users
const getallUser = asyncHandler(async (req, res) => {
  try {
    const users = await User.find({});

    if (users && users.length > 0) {
      res.status(200).json(users);
    } else {
      res.status(404).json({ message: 'No users found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single user by ID
const getSingleUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a user by ID
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);

    if (user) {
      res.status(200).json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user by ID
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, email, mobile, password } = req.body;

  try {
    const user = await User.findById(id);

    if (user) {
      if (firstname) user.firstname = firstname;
      if (lastname) user.lastname = lastname;
      if (email) user.email = email;
      if (mobile) user.mobile = mobile;
      if (password) {
        user.password = await bcrypt.hash(password, 10);  // Hash new password
      }

      const updatedUser = await user.save();

      res.status(200).json({
        _id: updatedUser._id,
        firstname: updatedUser.firstname,
        lastname: updatedUser.lastname,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
        token: generateToken(updatedUser._id),  // Regenerate the token
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });
  };

module.exports = {
  registerUser,
  loginUser,
  getallUser,
  getSingleUser,
  deleteUser,
  updateUser,
};
