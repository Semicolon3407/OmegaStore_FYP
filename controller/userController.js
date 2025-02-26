const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const validateMongoDBID = require('../utils/validateMangodbid');
const cookieParser = require('cookie-parser');

// Generate JWT Access Token
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d', // Expiration for access token (1 day)
  });
};




// Generate JWT Refresh Token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '3d', // Expiration for refresh token (3 days)
  });
};





// Handel refresh token
const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  console.log('Cookies:', cookie); // Debugging: Check if cookies are present

  if (!cookie?.refreshToken) {
    return res.status(401).json({ message: 'No refresh token found' });
  }

  const refreshToken = cookie.refreshToken;

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Create a new access token based on the decoded user ID
    const newAccessToken = generateAccessToken(decoded.id);

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ message: 'Invalid refresh token' });
  }
});







// Logout functionality
const logoutUser = asyncHandler(async (req, res) => {
  const cookie = req.cookies;  // Use req.cookies, not res.cookies
  console.log("Cookies:", cookie); // Log cookies to check if refreshToken is there

  // Check if refreshToken exists in cookies
  if (!cookie.refreshToken) {
    console.log("No refresh token in cookies");
    throw new Error("No refresh token in cookies");
  }

  const refreshToken = cookie.refreshToken;

  // Find the user based on refreshToken
  const user = await User.findOne({ refreshToken });

  if (!user) {
    console.log("No user found with the refresh token");
    // If no user found with refreshToken, clear the cookie and return status 204
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',  // Set secure based on environment
      sameSite: "strict",  // SameSite for security
    });
    return res.status(200).json({ message: "Logged out successfully" });  // Added response body with message
  }

  // If user found, update user to clear refreshToken
  await User.findOneAndUpdate(
    { refreshToken },  // Use object for query
    { refreshToken: "" },  // Clear the refreshToken field
    { new: true }  // Ensure the updated user is returned
  );

  // Clear the refreshToken cookie
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: "strict",
  });

  console.log("User logged out successfully");
  res.status(200).json({ message: "Logged out successfully" });  // Added response body with message
});











// Register User
const registerUser = asyncHandler(async (req, res) => {
  const { firstname, lastname, email, mobile, password, isAdmin } = req.body;

  // Check if user already exists with email or mobile
  const emailExists = await User.findOne({ email });
  const mobileExists = await User.findOne({ mobile });

  if (emailExists) {
    res.status(400);
    throw new Error('Email already registered');
  }

  if (mobileExists) {
    res.status(400);
    throw new Error('Mobile number already registered');
  }

  // Create new user
  const user = await User.create({
    firstname,
    lastname,
    email,
    mobile,
    password,
    isAdmin: isAdmin || false
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      mobile: user.mobile,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});






// Login User
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Set the refresh token in the cookies
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // Makes sure the cookie can't be accessed via JavaScript
      secure: process.env.NODE_ENV === 'production', // Only set secure cookies in production
      maxAge: 3 * 24 * 60 * 60 * 1000, // Cookie expiration (3 days)
    });

    res.status(200).json({
      _id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      mobile: user.mobile,
      isAdmin: user.isAdmin,
      isBlocked: user.isBlocked,
      accessToken, // Return access token
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// Refresh Access Token
const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken; // Get the refresh token from cookies

  if (!refreshToken) {
    res.status(400);
    throw new Error('Refresh token is required');
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Create a new access token based on the decoded user ID
    const newAccessToken = generateAccessToken(decoded.id);

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403);
    throw new Error('Invalid refresh token');
  }
});








// Get all users
const getallUser = asyncHandler(async (req, res) => {
  try {
    const users = await User.find({}).select('-password'); // Exclude password
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});







// Get a single user by ID
const getSingleUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate the provided ID
  validateMongoDBID(id); // Validate the ID

  try {
    const user = await User.findById(id).select('-password');

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

  // Validate the provided ID
  validateMongoDBID(id); // Validate the ID

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

  // Validate the provided ID
  validateMongoDBID(id); // Validate the ID

  const { firstname, lastname, email, mobile, password } = req.body;

  try {
    const user = await User.findById(id);

    if (user) {
      if (email && email !== user.email) {
        const emailExists = await User.findOne({ email });
        if (emailExists) {
          res.status(400);
          throw new Error('Email already registered');
        }
      }

      if (mobile && mobile !== user.mobile) {
        const mobileExists = await User.findOne({ mobile });
        if (mobileExists) {
          res.status(400);
          throw new Error('Mobile number already registered');
        }
      }

      if (firstname) user.firstname = firstname;
      if (lastname) user.lastname = lastname;
      if (email) user.email = email;
      if (mobile) user.mobile = mobile;
      if (password) {
        user.password = await bcrypt.hash(password, 10);
      }

      const updatedUser = await user.save();

      res.status(200).json({
        _id: updatedUser._id,
        firstname: updatedUser.firstname,
        lastname: updatedUser.lastname,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
        isAdmin: updatedUser.isAdmin,
        isBlocked: updatedUser.isBlocked,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});








// Block User
const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate the provided ID
  validateMongoDBID(id); // Validate the ID

  try {
    const user = await User.findById(id);

    if (user) {
      user.isBlocked = true;
      await user.save();
      res.status(200).json({ message: 'User blocked successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});








// Unblock User
const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate the provided ID
  validateMongoDBID(id); // Validate the ID

  try {
    const user = await User.findById(id);

    if (user) {
      user.isBlocked = false;
      await user.save();
      res.status(200).json({ message: 'User unblocked successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  getallUser,
  getSingleUser,
  deleteUser,
  updateUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logoutUser,
};  