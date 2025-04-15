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

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

const generateRefreshToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "3d" });
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const createUser = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const findUser = await User.findOne({ email });
  if (findUser) {
    return res.status(400).json({ message: "User Already Exists" });
  }
  const newUser = await User.create(req.body);
  res.status(201).json(newUser);
});

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
    maxAge: 72 * 60 * 60 * 1000,
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
    maxAge: 72 * 60 * 60 * 1000,
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

const getallUser = asyncHandler(async (req, res) => {
  const getUsers = await User.find().populate("wishlist");
  res.json(getUsers);
});

const getaUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  const getaUser = await User.findById(id);
  res.json({ getaUser });
});

const deleteaUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  const deleteaUser = await User.findByIdAndDelete(id);
  res.json({ deleteaUser });
});

const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  const blockusr = await User.findByIdAndUpdate(id, { isBlocked: true }, { new: true });
  res.json(blockusr);
});

const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  const unblock = await User.findByIdAndUpdate(id, { isBlocked: false }, { new: true });
  res.json({ message: "User Unblocked", unblock });
});

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

const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found with this email");

  const otp = generateOTP();
  user.passwordResetToken = otp;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
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

  await sendEmail(data);
  res.json({ message: "OTP sent to your email" });
});

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

const userCart = asyncHandler(async (req, res) => {
  const { productId, quantity, color } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);

  try {
    const user = await User.findById(_id);
    let existingCart = await Cart.findOne({ orderby: user._id }).populate(
      "products.product"
    );

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
    const populatedCart = await Cart.findById(existingCart._id).populate(
      "products.product"
    );
    res.json(populatedCart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const getUserCarts = asyncHandler(async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = req.user._id;
    validateMongoDbId(userId);

    const cart = await Cart.findOne({ orderby: userId }).populate(
      "products.product"
    );

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

const emptyCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  const cart = await Cart.findOneAndRemove({ orderby: _id });
  res.json(cart || { message: "Cart emptied" });
});

const applyCoupon = asyncHandler(async (req, res) => {
  const { coupon } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);

  const validCoupon = await Coupon.findOne({
    name: coupon.toUpperCase(),
    expiry: { $gte: new Date() },
    $or: [{ user: _id }, { user: null }],
  });

  if (!validCoupon) {
    return res.status(400).json({ message: "Invalid or expired coupon" });
  }

  const user = await User.findById(_id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  let cart = await Cart.findOne({ orderby: user._id }).populate(
    "products.product"
  );
  if (!cart) {
    return res.status(400).json({ message: "Cart not found" });
  }

  const totalAfterDiscount = (
    cart.cartTotal -
    (cart.cartTotal * validCoupon.discount) / 100
  ).toFixed(2);

  cart.totalAfterDiscount = totalAfterDiscount;
  await cart.save();

  res.json({
    totalAfterDiscount,
    discountApplied: validCoupon.discount,
    message: "Coupon applied successfully",
  });
});

const getUserOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);

  try {
    const orders = await Order.find({ orderby: _id })
      .populate("products.product")
      .populate("coupon", "name discount")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders", error: error.message });
  }
});

const createOrder = asyncHandler(async (req, res) => {
  const {
    COD,
    couponApplied,
    couponCode,
    shippingInfo,
    paymentMethod,
  } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);

  if (!COD && paymentMethod !== "eSewa") {
    return res.status(400).json({ message: "Invalid payment method" });
  }

  // Validate shipping info
  if (
    !shippingInfo ||
    !shippingInfo.name ||
    !shippingInfo.email ||
    !shippingInfo.address ||
    !shippingInfo.city ||
    !shippingInfo.phone
  ) {
    return res.status(400).json({ message: "Complete shipping information is required" });
  }

  const user = await User.findById(_id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  let userCart = await Cart.findOne({ orderby: user._id }).populate(
    "products.product"
  );
  if (!userCart || !userCart.products.length) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  // Check stock
  for (const item of userCart.products) {
    if (item.product.quantity < item.count) {
      return res.status(400).json({ message: `Insufficient stock for ${item.product.title}` });
    }
  }

  let finalAmount = userCart.cartTotal;
  let appliedCoupon = null;

  if (couponApplied && couponCode) {
    const validCoupon = await Coupon.findOne({
      name: couponCode.toUpperCase(),
      expiry: { $gte: new Date() },
    });
    if (!validCoupon) {
      return res.status(400).json({ message: "Invalid or expired coupon" });
    }
    finalAmount = (userCart.cartTotal * (100 - validCoupon.discount) / 100).toFixed(2);
    appliedCoupon = validCoupon._id;
  }

  if (COD) {
    const paymentIntent = {
      id: uniqid(),
      method: "COD",
      amount: finalAmount,
      status: "Cash on Delivery",
      created: Date.now(),
      currency: "NPR",
    };

    let newOrder = await new Order({
      products: userCart.products,
      paymentIntent,
      orderStatus: "Processing",
      orderby: user._id,
      coupon: appliedCoupon,
      totalAfterDiscount: finalAmount,
      shippingInfo,
    }).save();

    // Update stock for COD orders
    const updates = userCart.products.map((item) => ({
      updateOne: {
        filter: { _id: item.product._id },
        update: { $inc: { quantity: -item.count, sold: +item.count } },
      },
    }));
    await Product.bulkWrite(updates);

    await Cart.findOneAndDelete({ orderby: user._id });

    res.json({
      message: "Order created successfully",
      orderId: newOrder._id,
    });
  } else {
    // For eSewa, just return success to proceed to initiatePayment
    res.json({
      message: "Proceed to eSewa payment",
    });
  }
});

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("orderby", "email firstname lastname")
    .populate("coupon", "name discount");
  res.json(orders);
});

const updateOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  const { orderStatus } = req.body;
  const order = await Order.findByIdAndUpdate(
    id,
    { orderStatus },
    { new: true, runValidators: true }
  );
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  res.json(order);
});

const deleteOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  const order = await Order.findByIdAndDelete(id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  res.json({ message: "Order deleted successfully" });
});

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
    res.status(500).json({
      message: "Server error fetching wishlist",
      error: error.message,
    });
  }
});

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
    res.status(500).json({
      message: "Server error adding to wishlist",
      error: error.message,
    });
  }
});

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
    res.status(500).json({
      message: "Server error removing from wishlist",
      error: error.message,
    });
  }
});

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
    res.status(500).json({
      message: "Server error fetching compare list",
      error: error.message,
    });
  }
});

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
    res.status(500).json({
      message: "Server error adding to compare list",
      error: error.message,
    });
  }
});

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
    res.status(500).json({
      message: "Server error removing from compare list",
      error: error.message,
    });
  }
});

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
    res.status(500).json({
      message: "Server error clearing compare list",
      error: error.message,
    });
  }
});

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
  getAllOrders,
  updateOrder,
  deleteOrder,
  addToWishlist,
  removeFromWishlist,
  getCompare,
  addToCompare,
  removeFromCompare,
  clearCompare,
  getUserOrders,
};