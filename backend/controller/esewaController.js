const asyncHandler = require("express-async-handler");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const Coupon = require("../models/couponModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const validateMongoDbId = require("../utils/validateMangodbid");
const crypto = require("crypto");
const axios = require("axios");

// Environment variables
const ESEWA_SECRET = process.env.ESEWA_SECRET || "8gBm/:&EnhH.1/q";
const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";
const ESEWA_PAYMENT_URL =
  process.env.NODE_ENV === "production"
    ? "https://epay.esewa.com.np/api/epay/main/v2/form"
    : "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
const ESEWA_STATUS_URL =
  process.env.NODE_ENV === "production"
    ? "https://epay.esewa.com.np/api/epay/transaction/status/"
    : "https://rc-epay.esewa.com.np/api/epay/transaction/status/";
const SUCCESS_URL = process.env.ESEWA_SUCCESS_URL;
const FAILURE_URL = process.env.ESEWA_FAILURE_URL;

// Generate HMAC SHA256 signature
const generateSignature = (message, secret) => {
  return crypto.createHmac("sha256", secret).update(message).digest("base64");
};

const initiatePayment = asyncHandler(async (req, res) => {
  const { couponApplied, couponCode, shippingInfo } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);

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

  let userCart = await Cart.findOne({ orderby: user._id }).populate("products.product");
  if (!userCart || !userCart.products.length) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  // Check stock availability
  for (const item of userCart.products) {
    if (item.product.quantity < item.count) {
      return res.status(400).json({ message: `Insufficient stock for ${item.product.title}` });
    }
  }

  // Calculate final amount
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

  // Generate transaction ID
  const transactionUuid = `ESW-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  const totalAmount = parseFloat(finalAmount).toFixed(2);
  const taxAmount = "0.00";
  const amount = totalAmount;

  // Generate signature
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${ESEWA_PRODUCT_CODE}`;
  const signature = generateSignature(message, ESEWA_SECRET);

  // Create order
  const newOrder = await Order.create({
    products: userCart.products,
    paymentIntent: {
      id: transactionUuid,
      method: "eSewa",
      amount: totalAmount,
      status: "Pending",
      created: Date.now(),
      currency: "NPR",
    },
    orderStatus: "Pending",
    orderby: user._id,
    coupon: appliedCoupon,
    totalAfterDiscount: totalAmount,
    shippingInfo,
  });

  // eSewa form data
  const formData = {
    amount,
    tax_amount: taxAmount,
    total_amount: totalAmount,
    transaction_uuid: transactionUuid,
    product_code: ESEWA_PRODUCT_CODE,
    product_service_charge: "0",
    product_delivery_charge: "0",
    success_url: SUCCESS_URL,
    failure_url: FAILURE_URL,
    signed_field_names: "total_amount,transaction_uuid,product_code",
    signature,
  };

  res.json({
    paymentUrl: ESEWA_PAYMENT_URL,
    formData,
    orderId: newOrder._id,
  });
});

const handleSuccess = asyncHandler(async (req, res) => {
  const { data } = req.query;
  if (!data) {
    return res.redirect(`${process.env.FRONTEND_URL}/checkout?error=Invalid response from eSewa`);
  }

  let decodedData;
  try {
    decodedData = JSON.parse(Buffer.from(data, "base64").toString("utf8"));
    if (typeof decodedData === "string") {
      decodedData = JSON.parse(decodedData);
    }
  } catch (error) {
    console.error("Error decoding eSewa response:", error);
    return res.redirect(`${process.env.FRONTEND_URL}/checkout?error=Invalid response format`);
  }

  const {
    transaction_code,
    status,
    total_amount,
    transaction_uuid,
    product_code,
    signed_field_names,
    signature,
  } = decodedData;

  if (status !== "COMPLETE") {
    return res.redirect(`${process.env.FRONTEND_URL}/checkout?error=Transaction not completed`);
  }

  // Verify signature
  const message = signed_field_names
    .split(",")
    .map((field) => `${field}=${decodedData[field]}`)
    .join(",");
  const computedSignature = generateSignature(message, ESEWA_SECRET);
  if (computedSignature !== signature) {
    return res.redirect(`${process.env.FRONTEND_URL}/checkout?error=Invalid signature`);
  }

  // Find order
  const order = await Order.findOne({ "paymentIntent.id": transaction_uuid }).populate(
    "products.product"
  );
  if (!order) {
    return res.redirect(`${process.env.FRONTEND_URL}/checkout?error=Order not found`);
  }

  // Verify amount
  if (parseFloat(total_amount).toFixed(2) !== parseFloat(order.totalAfterDiscount).toFixed(2)) {
    return res.redirect(`${process.env.FRONTEND_URL}/checkout?error=Amount mismatch`);
  }

  // Update order
  order.paymentIntent.status = "Completed";
  order.paymentIntent.transactionCode = transaction_code;
  order.orderStatus = "Processing";
  await order.save();

  // Update stock
  const updates = order.products.map((item) => ({
    updateOne: {
      filter: { _id: item.product._id },
      update: { $inc: { quantity: -item.count, sold: +item.count } },
    },
  }));
  await Product.bulkWrite(updates);

  // Clear cart
  await Cart.findOneAndDelete({ orderby: order.orderby });

  res.redirect(`${process.env.FRONTEND_URL}/order-confirmation?orderId=${order._id}`);
});

const handleFailure = asyncHandler(async (req, res) => {
  const { transaction_uuid } = req.query;

  if (transaction_uuid) {
    const order = await Order.findOne({ "paymentIntent.id": transaction_uuid });
    if (order) {
      order.paymentIntent.status = "Failed";
      order.orderStatus = "Cancelled";
      await order.save();
    }
  }

  res.redirect(`${process.env.FRONTEND_URL}/checkout?error=Payment failed or cancelled`);
});

const checkTransactionStatus = asyncHandler(async (req, res) => {
  const { transaction_uuid } = req.params;

  const order = await Order.findOne({ "paymentIntent.id": transaction_uuid });
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  try {
    const response = await axios.get(ESEWA_STATUS_URL, {
      params: {
        product_code: ESEWA_PRODUCT_CODE,
        total_amount: order.paymentIntent.amount,
        transaction_uuid,
      },
    });

    const { status, ref_id } = response.data;

    switch (status) {
      case "COMPLETE":
        order.paymentIntent.status = "Completed";
        order.orderStatus = "Processing";
        order.paymentIntent.transactionCode = ref_id;
        await order.save();
        await Cart.findOneAndDelete({ orderby: order.orderby });
        break;
      case "PENDING":
        break;
      default:
        order.paymentIntent.status = "Failed";
        order.orderStatus = "Cancelled";
        await order.save();
        break;
    }

    res.json({
      status,
      transactionId: ref_id,
      orderStatus: order.orderStatus,
    });
  } catch (error) {
    console.error("Error checking transaction status:", error.response?.data || error.message);
    res.status(500).json({
      message: "Failed to check transaction status",
      error: error.message,
    });
  }
});

module.exports = {
  initiatePayment,
  handleSuccess,
  handleFailure,
  checkTransactionStatus,
};