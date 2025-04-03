const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const uniqid = require("uniqid");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMangodbid");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const sendEmail = require("./emailController");

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Generate Refresh Token
const generateRefreshToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "3d" });
};

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create User
const createUser = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const findUser = await User.findOne({ email });
  if (findUser) {
    return res.status(400).json({ message: "User Already Exists" });
  }
  const newUser = await User.create(req.body);
  res.status(201).json(newUser);
});

// Login User
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const findUser = await User.findOne({ email: email.toLowerCase() });
  if (!findUser) {
    return res.status(400).json({ message: "User not found. Please sign up" });
  }

  const isMatch = await findUser.isPasswordMatched(password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const refreshToken = generateRefreshToken(findUser._id, findUser.role);
  await User.findByIdAndUpdate(findUser._id, { refreshToken }, { new: true });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 72 * 60 * 60 * 1000, // 3 days
  });

  res.json({
    _id: findUser._id,
    firstname: findUser.firstname,
    lastname: findUser.lastname,
    email: findUser.email,
    mobile: findUser.mobile,
    role: findUser.role,
    token: generateToken(findUser._id, findUser.role),
  });
});

// Login Admin
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const findAdmin = await User.findOne({ email, role: "admin" });
  if (!findAdmin) {
    return res.status(401).json({ message: "Admin not found" });
  }

  const isMatch = await findAdmin.isPasswordMatched(password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid admin credentials" });
  }

  const refreshToken = generateRefreshToken(findAdmin._id, "admin");
  await User.findByIdAndUpdate(findAdmin._id, { refreshToken }, { new: true });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 72 * 60 * 60 * 1000, // 3 days
  });

  res.json({
    _id: findAdmin._id,
    firstname: findAdmin.firstname,
    lastname: findAdmin.lastname,
    email: findAdmin.email,
    role: "admin",
    token: generateToken(findAdmin._id, "admin"),
  });
});

// Handle Refresh Token
const handleRefreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token in cookies" });
  }

  const user = await User.findOne({ refreshToken });
  if (!user) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user._id.toString() !== decoded.id) {
      return res.status(401).json({ message: "Refresh token verification failed" });
    }
    const accessToken = generateToken(user._id, user.role);
    res.json({ accessToken });
  });
});

// Logout
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    return res.sendStatus(204);
  }

  const user = await User.findOne({ refreshToken });
  if (user) {
    await User.findByIdAndUpdate(user._id, { refreshToken: "" }, { new: true });
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
  res.sendStatus(204);
});

// Update User
const updatedUser = asyncHandler(async (req, res) => {
  const { _id, firstname, lastname, email, mobile, address } = req.body;

  if (!_id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { firstname, lastname, email, mobile, address },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error while updating user" });
  }
});

// Save Address
const saveAddress = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    { address: req?.body?.address },
    { new: true }
  );
  res.json(updatedUser);
});

// Get All Users
const getallUser = asyncHandler(async (req, res) => {
  const getUsers = await User.find().populate("wishlist");
  res.json(getUsers);
});

// Get a User
const getaUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  const getaUser = await User.findById(id);
  res.json({ getaUser });
});

// Delete a User
const deleteaUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  const deleteaUser = await User.findByIdAndDelete(id);
  res.json({ deleteaUser });
});

// Block User
const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  const blockusr = await User.findByIdAndUpdate(id, { isBlocked: true }, { new: true });
  res.json(blockusr);
});

// Unblock User
const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  const unblock = await User.findByIdAndUpdate(id, { isBlocked: false }, { new: true });
  res.json({ message: "User Unblocked", unblock });
});

// Update Password
const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { currentPassword, newPassword } = req.body;
  validateMongoDbId(_id);

  const user = await User.findById(_id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isMatch = await user.isPasswordMatched(currentPassword);
  if (!isMatch) {
    return res.status(400).json({ message: "Current password is incorrect" });
  }

  if (newPassword) {
    user.password = newPassword;
    const updatedUser = await user.save();
    res.json({ message: "Password updated successfully", user: updatedUser });
  } else {
    res.json({ message: "No new password provided", user });
  }
});



// Forgot Password with OTP
const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found with this email");

  const otp = generateOTP();
  user.passwordResetToken = otp;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
  await user.save();

  const resetMessage = `
    <h2>Password Reset OTP</h2>
    <p>Hello ${user.firstname},</p>
    <p>Use the following OTP to reset your password. It is valid for 10 minutes:</p>
    <h3>${otp}</h3>
    <p>If you did not request this, please ignore this email.</p>
    <p>Regards,<br>Omega Store Team</p>
  `;
  const data = {
    to: email,
    subject: "Password Reset OTP - Omega Store",
    text: `Your OTP is ${otp}. Valid for 10 minutes.`,
    html: resetMessage,
  };

  // Log the OTP and email data before sending
  console.log("Generated OTP:", otp);
  console.log("Email data to be sent:", data);

  await sendEmail(data);
  res.json({ message: "OTP sent to your email" });
});



// Reset Password with OTP
const resetPassword = asyncHandler(async (req, res) => {
  const { otp, newPassword } = req.body;
  const user = await User.findOne({
    passwordResetToken: otp,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) throw new Error("Invalid or expired OTP. Please try again.");

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json({ message: "Password reset successfully" });
});

// User Cart
const userCart = asyncHandler(async (req, res) => {
  const { productId, quantity, color } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);

  try {
    const user = await User.findById(_id);
    let existingCart = await Cart.findOne({ orderby: user._id }).populate("products.product");

    if (!existingCart) {
      existingCart = new Cart({ products: [], cartTotal: 0, orderby: user._id });
    }

    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");
    if (product.quantity < quantity) throw new Error("Insufficient stock");

    const itemIndex = existingCart.products.findIndex(
      (item) => item.product.toString() === productId && item.color === color
    );

    if (itemIndex > -1) {
      existingCart.products[itemIndex].count += quantity;
    } else {
      existingCart.products.push({
        product: productId,
        count: quantity,
        color: color || product.color,
        price: product.price,
      });
    }

    existingCart.cartTotal = existingCart.products.reduce(
      (total, item) => total + item.price * item.count,
      0
    );

    await existingCart.save();
    const populatedCart = await Cart.findById(existingCart._id).populate("products.product");
    res.json(populatedCart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get User Cart
const getUserCarts = asyncHandler(async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = req.user._id;
    validateMongoDbId(userId);

    const cart = await Cart.findOne({ orderby: userId }).populate("products.product");

    if (!cart || !cart.products.length) {
      return res.json({
        products: [],
        cartTotal: 0,
        totalAfterDiscount: 0,
        message: "Cart is empty",
      });
    }

    const products = cart.products.map((item) => ({
      _id: item._id,
      product: item.product,
      count: item.count,
      color: item.color,
      price: item.price,
    }));

    res.json({
      products,
      cartTotal: cart.cartTotal,
      totalAfterDiscount: cart.totalAfterDiscount || cart.cartTotal,
    });
  } catch (error) {
    console.error("GetUserCart Error:", error);
    res.status(500).json({ message: "Failed to fetch cart", error: error.message });
  }
});

// Remove From Cart
const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { _id } = req.user;
  validateMongoDbId(_id);
  validateMongoDbId(productId);

  const cart = await Cart.findOne({ orderby: _id });
  if (!cart) throw new Error("Cart not found");

  cart.products = cart.products.filter(
    (item) => item.product.toString() !== productId
  );
  cart.cartTotal = cart.products.reduce(
    (total, item) => total + item.price * item.count,
    0
  );

  await cart.save();
  const populatedCart = await Cart.findById(cart._id).populate("products.product");
  res.json(populatedCart);
});

// Empty Cart
const emptyCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  const cart = await Cart.findOneAndRemove({ orderby: _id });
  res.json(cart || { message: "Cart emptied" });
});

// Apply Coupon
const applyCoupon = asyncHandler(async (req, res) => {
  const { coupon } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  const validCoupon = await Coupon.findOne({ name: coupon });
  if (!validCoupon) throw new Error("Invalid Coupon");
  const user = await User.findOne({ _id });
  let { cartTotal } = await Cart.findOne({ orderby: user._id }).populate("products.product");
  let totalAfterDiscount = (cartTotal - (cartTotal * validCoupon.discount) / 100).toFixed(2);
  await Cart.findOneAndUpdate({ orderby: user._id }, { totalAfterDiscount }, { new: true });
  res.json(totalAfterDiscount);
});

// Create Order
const createOrder = asyncHandler(async (req, res) => {
  const { COD, couponApplied } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  if (!COD) throw new Error("Create cash order failed");
  const user = await User.findById(_id);
  let userCart = await Cart.findOne({ orderby: user._id });
  let finalAmount = couponApplied && userCart.totalAfterDiscount ? userCart.totalAfterDiscount : userCart.cartTotal;

  let newOrder = await new Order({
    products: userCart.products,
    paymentIntent: {
      id: uniqid(),
      method: "COD",
      amount: finalAmount,
      status: "Cash on Delivery",
      created: Date.now(),
      currency: "usd",
    },
    orderby: user._id,
    orderStatus: "Cash on Delivery",
  }).save();

  let update = userCart.products.map((item) => ({
    updateOne: { filter: { _id: item.product._id }, update: { $inc: { quantity: -item.count, sold: +item.count } } },
  }));
  await Product.bulkWrite(update, {});
  res.json({ message: "success" });
});

// Get Orders
const getOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  const userOrders = await Order.find({ orderby: _id }).populate("products.product").populate("orderby").exec();
  res.json(userOrders);
});

// Get All Orders
const getAllOrders = asyncHandler(async (req, res) => {
  const allUserOrders = await Order.find().populate("products.product").populate("orderby").exec();
  res.json(allUserOrders);
});

// Update Order Status
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  validateMongoDbId(id);
  const updateOrderStatus = await Order.findByIdAndUpdate(
    id,
    { orderStatus: status, "paymentIntent.status": status },
    { new: true }
  );
  res.json(updateOrderStatus);
});

// Get Wishlist
const getWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);

  try {
    const user = await User.findById(_id).populate("wishlist");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      wishlist: user.wishlist || [],
      message: "Wishlist retrieved successfully",
    });
  } catch (error) {
    console.error("GetWishlist Error:", error);
    res.status(500).json({ message: "Server error fetching wishlist", error: error.message });
  }
});

// Add to Wishlist
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }
    await user.populate("wishlist");
    res.json({ wishlist: user.wishlist, message: "Added to wishlist" });
  } catch (error) {
    res.status(500).json({ message: "Server error adding to wishlist", error: error.message });
  }
});

// Remove from Wishlist
const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { _id } = req.user;
  validateMongoDbId(_id);
  validateMongoDbId(productId);
  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
    await user.save();
    await user.populate("wishlist");
    res.json({ wishlist: user.wishlist, message: "Removed from wishlist" });
  } catch (error) {
    res.status(500).json({ message: "Server error removing from wishlist", error: error.message });
  }
});

// Get Compare List
const getCompare = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);

  try {
    const user = await User.findById(_id).populate("compare");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      compare: user.compare || [],
      message: "Compare list retrieved successfully",
    });
  } catch (error) {
    console.error("GetCompare Error:", error);
    res.status(500).json({ message: "Server error fetching compare list", error: error.message });
  }
});

// Add to Compare
const addToCompare = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  validateMongoDbId(productId);

  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (user.compare.length >= 4) {
      return res.status(400).json({ message: "You can only compare up to 4 products" });
    }

    if (!user.compare.includes(productId)) {
      user.compare.push(productId);
      await user.save();
    }

    await user.populate("compare");
    res.json({ compare: user.compare, message: "Added to compare list" });
  } catch (error) {
    console.error("AddToCompare Error:", error);
    res.status(500).json({ message: "Server error adding to compare list", error: error.message });
  }
});

// Remove from Compare
const removeFromCompare = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { _id } = req.user;
  validateMongoDbId(_id);
  validateMongoDbId(productId);

  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.compare = user.compare.filter((id) => id.toString() !== productId);
    await user.save();
    await user.populate("compare");
    res.json({ compare: user.compare, message: "Removed from compare list" });
  } catch (error) {
    console.error("RemoveFromCompare Error:", error);
    res.status(500).json({ message: "Server error removing from compare list", error: error.message });
  }
});

// Clear Compare List
const clearCompare = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);

  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.compare = [];
    await user.save();
    res.json({ compare: user.compare, message: "Compare list cleared" });
  } catch (error) {
    console.error("ClearCompare Error:", error);
    res.status(500).json({ message: "Server error clearing compare list", error: error.message });
  }
});

// Export all functions
module.exports = {
  createUser,
  loginUser,
  getallUser,
  getaUser,
  deleteaUser,
  updatedUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logout,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  loginAdmin,
  getWishlist,
  saveAddress,
  userCart,
  getUserCarts,
  emptyCart,
  removeFromCart,
  applyCoupon,
  createOrder,
  getOrders,
  updateOrderStatus,
  getAllOrders,
  addToWishlist,
  removeFromWishlist,
  getCompare,
  addToCompare,
  removeFromCompare,
  clearCompare,
};