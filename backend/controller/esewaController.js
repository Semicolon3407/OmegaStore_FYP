const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const uniqid = require("uniqid");

// Use environment variable for eSewa secret key
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY;

// Verify that the secret key is loaded
if (!ESEWA_SECRET_KEY) {
  throw new Error("ESEWA_SECRET_KEY is not defined in the environment variables");
}

// Function to generate HMAC SHA256 signature
const generateSignature = (message) => {
  console.log("Message for signature:", message);
  console.log("Using secret key:", ESEWA_SECRET_KEY);
  const signature = crypto
    .createHmac("sha256", ESEWA_SECRET_KEY)
    .update(message)
    .digest("base64");
  console.log("Generated signature:", signature);
  return signature;
};

// Initiate eSewa Payment
const initiateEsewaPayment = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { couponApplied, couponCode } = req.body;

  // Fetch user cart
  const userCart = await Cart.findOne({ orderby: _id }).populate("products.product");
  if (!userCart) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  // Calculate final amount (considering coupon if applied)
  let finalAmount = userCart.cartTotal;
  if (couponApplied && couponCode) {
    const validCoupon = await Coupon.findOne({
      name: couponCode.toUpperCase(),
      expiry: { $gte: new Date() },
    });
    if (validCoupon) {
      finalAmount = userCart.totalAfterDiscount || (
        userCart.cartTotal - (userCart.cartTotal * validCoupon.discount) / 100
      ).toFixed(2);
    }
  }

  // Ensure finalAmount is a string with 2 decimal places
  const totalAmount = Number(finalAmount).toFixed(2);
  console.log("Total Amount (before sending):", totalAmount);

  // Generate a unique transaction ID
  const transaction_uuid = uniqid();
  console.log("Transaction UUID:", transaction_uuid);

  // Create an order with "Pending" status
  const newOrder = await new Order({
    products: userCart.products,
    paymentIntent: {
      id: transaction_uuid,
      method: "eSewa",
      amount: totalAmount,
      status: "Pending",
      created: Date.now(),
      currency: "NPR",
    },
    orderby: _id,
    orderStatus: "Pending",
    totalAfterDiscount: totalAmount,
  }).save();

  // Prepare data for eSewa payment request
  const params = {
    amount: totalAmount,
    tax_amount: "0",
    total_amount: totalAmount,
    transaction_uuid,
    product_code: process.env.ESEWA_PRODUCT_CODE,
    product_service_charge: "0",
    product_delivery_charge: "0",
    success_url: process.env.ESEWA_SUCCESS_URL,
    failure_url: process.env.ESEWA_FAILURE_URL,
  };

  // Log the params to verify values
  console.log("eSewa params:", params);

  // Fields to be signed
  const signed_field_names = "total_amount,transaction_uuid,product_code";
  const message = `total_amount=${params.total_amount},transaction_uuid=${params.transaction_uuid},product_code=${params.product_code}`;
  
  // Generate signature
  const signature = generateSignature(message);

  // Prepare form data for eSewa
  const formData = {
    ...params,
    signed_field_names,
    signature,
  };

  // Log the form data to verify
  console.log("Form Data sent to eSewa:", formData);

  res.json({
    message: "Payment initiated",
    formData,
    paymentUrl: process.env.ESEWA_PAYMENT_URL,
    orderId: newOrder._id,
  });
});

// Verify eSewa Payment
const verifyEsewaPayment = asyncHandler(async (req, res) => {
  const { data } = req.query;
  if (!data) {
    return res.status(400).json({ message: "Invalid response from eSewa" });
  }

  const decodedData = Buffer.from(data, "base64").toString("utf-8");
  const responseData = JSON.parse(decodedData);

  const {
    transaction_uuid,
    product_code,
    status,
    total_amount,
    transaction_code,
    signed_field_names,
    signature,
  } = responseData;

  const message = `transaction_code=${transaction_code},status=${status},total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code},signed_field_names=${signed_field_names}`;
  const generatedSignature = generateSignature(message);

  if (generatedSignature !== signature) {
    return res.status(400).json({ message: "Signature verification failed" });
  }

  const order = await Order.findOne({ "paymentIntent.id": transaction_uuid });
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (status === "COMPLETE") {
    order.paymentIntent.status = "Completed";
    order.orderStatus = "Processing";
    await order.save();

    const update = order.products.map((item) => ({
      updateOne: {
        filter: { _id: item.product._id },
        update: { $inc: { quantity: -item.count, sold: +item.count } },
      },
    }));
    await Product.bulkWrite(update, {});

    await Cart.findOneAndDelete({ orderby: order.orderby });

    res.redirect(`http://localhost:5173/order-confirmation?orderId=${order._id}`);
  } else {
    order.paymentIntent.status = "Failed";
    order.orderStatus = "Cancelled";
    await order.save();

    res.redirect(`http://localhost:5173/checkout?error=Payment failed`);
  }
});

// Handle Payment Failure
const handlePaymentFailure = asyncHandler(async (req, res) => {
  const { transaction_uuid } = req.query;

  const order = await Order.findOne({ "paymentIntent.id": transaction_uuid });
  if (order) {
    order.paymentIntent.status = "Failed";
    order.orderStatus = "Cancelled";
    await order.save();
  }

  res.redirect(`http://localhost:5173/checkout?error=Payment failed`);
});

module.exports = {
  initiateEsewaPayment,
  verifyEsewaPayment,
  handlePaymentFailure,
};