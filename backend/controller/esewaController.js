const asyncHandler = require("express-async-handler");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const Coupon = require("../models/couponModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const validateMongoDbId = require("../utils/validateMangodbid");
const crypto = require("crypto");

// Environment variables
const ESEWA_SECRET = process.env.ESEWA_SECRET || "8gBm/:&EnhH.1/q";
const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";
const ESEWA_PAYMENT_URL = process.env.NODE_ENV === "production"
  ? "https://epay.esewa.com.np/api/epay/main/v2/form"
  : "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const API_URL = process.env.API_URL || "http://localhost:5001";

// Generate HMAC SHA256 signature
const generateSignature = (message, secret) => {
  return crypto.createHmac("sha256", secret).update(message).digest("base64");
};

// Create a pending order and initiate eSewa payment
const initiateEsewaPayment = asyncHandler(async (req, res) => {
  const { couponApplied, couponCode, shippingInfo } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);

  // Validate shipping info
  if (!shippingInfo?.name || !shippingInfo?.email || !shippingInfo?.address || 
      !shippingInfo?.city || !shippingInfo?.phone) {
    return res.status(400).json({ message: "Complete shipping information is required" });
  }

  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let userCart = await Cart.findOne({ orderby: user._id }).populate("products.product");
    if (!userCart?.products?.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Calculate amounts
    let finalAmount = userCart.cartTotal;
    let appliedCoupon = null;

    if (couponApplied && couponCode) {
      const validCoupon = await Coupon.findOne({
        name: couponCode.toUpperCase(),
        expiry: { $gte: new Date() },
      });
      if (validCoupon) {
        finalAmount = (userCart.cartTotal * (100 - validCoupon.discount) / 100).toFixed(2);
        appliedCoupon = validCoupon._id;
      }
    }

    const amount = finalAmount;
    const taxAmount = "0";
    const totalAmount = amount;
    const transactionUuid = `ESW-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    
    // Create a pending order
    const pendingOrder = await Order.create({
      products: userCart.products,
      paymentIntent: {
        id: transactionUuid,
        method: "eSewa",
        amount: totalAmount,
        status: "Pending", // Set initial status as pending
        created: Date.now(),
        currency: "NPR"
      },
      orderStatus: "Not Processed",
      orderby: user._id,
      coupon: appliedCoupon,
      totalAfterDiscount: totalAmount,
      shippingInfo: shippingInfo,
    });

    // Generate signature
    const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${ESEWA_PRODUCT_CODE}`;
    const signature = generateSignature(message, ESEWA_SECRET);

    // eSewa form data with API endpoints for success/failure
    const formData = {
      amount: amount,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      transaction_uuid: transactionUuid,
      product_code: ESEWA_PRODUCT_CODE,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: `${API_URL}/api/monster/esewa/payment-success?orderId=${pendingOrder._id}`,
      failure_url: `${API_URL}/api/monster/esewa/payment-failure?orderId=${pendingOrder._id}`,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature: signature,
    };

    res.json({
      paymentUrl: ESEWA_PAYMENT_URL,
      formData,
      transactionId: transactionUuid,
    });
  } catch (error) {
    console.error("Error initiating payment:", error);
    res.status(500).json({ message: "Failed to initiate payment" });
  }
});

// Modified verifyEsewaPayment function with improved error handling
const verifyEsewaPayment = asyncHandler(async (req, res) => {
  let { orderId, data } = req.query;

  // 🔧 Fix malformed orderId that contains ?data=
  if (orderId && orderId.includes("?data=")) {
    const [cleanId, base64Data] = orderId.split("?data=");
    orderId = cleanId;
    data = base64Data;
  }

  console.log("Payment success callback received:", { orderId, data });

  // If data is missing but orderId exists, try to complete the order anyway
  if (!data && orderId) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        console.error("Order not found:", orderId);
        return res.redirect(`${FRONTEND_URL}/checkout?error=Order not found`);
      }

      if (order.paymentIntent.status === "Completed") {
        console.log("Order already processed:", orderId);
        return res.redirect(`${FRONTEND_URL}/checkout?success=true&orderId=${order._id}`);
      }

      order.paymentIntent.status = "Completed";
      order.orderStatus = "Processing";
      await order.save();

      const updates = order.products.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { quantity: -item.count, sold: +item.count } },
        },
      }));
      if (updates.length > 0) {
        await Product.bulkWrite(updates);
      }

      const deletedCart = await Cart.findOneAndDelete({ orderby: order.orderby });
      console.log("Cart cleared for user:", order.orderby, deletedCart ? "Success" : "No cart found");

      return res.redirect(`${FRONTEND_URL}/checkout?success=true&orderId=${order._id}`);
    } catch (error) {
      console.error("Error processing order without data:", error);
      return res.redirect(`${FRONTEND_URL}/checkout?error=Processing failed: ${error.message}`);
    }
  }

  if (!orderId || !data) {
    console.error("Missing required parameters");
    return res.redirect(`${FRONTEND_URL}/checkout?error=Invalid response - missing parameters`);
  }

  try {
    let decodedData;
    try {
      decodedData = JSON.parse(Buffer.from(data, "base64").toString("utf8"));
      console.log("Decoded data:", decodedData);
    } catch (decodeError) {
      console.error("Failed to decode data:", decodeError);
      return res.redirect(`${FRONTEND_URL}/checkout?error=Invalid response format`);
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

    if (!transaction_code || !status) {
      console.error("Missing critical fields in response");
      return res.redirect(`${FRONTEND_URL}/checkout?error=Incomplete payment data`);
    }

    if (signed_field_names && signature) {
      const message = signed_field_names
        .split(",")
        .map((field) => `${field}=${decodedData[field]}`)
        .join(",");
      const computedSignature = generateSignature(message, ESEWA_SECRET);

      if (computedSignature !== signature) {
        console.error("Signature verification failed");
        return res.redirect(`${FRONTEND_URL}/checkout?error=Invalid signature`);
      }
    }

    if (status !== "COMPLETE") {
      console.error("Payment status not complete:", status);
      return res.redirect(`${FRONTEND_URL}/checkout?error=Payment not completed`);
    }

    const order = await Order.findById(orderId);
    if (!order) {
      console.error("Order not found:", orderId);
      return res.redirect(`${FRONTEND_URL}/checkout?error=Order not found`);
    }

    if (order.paymentIntent.status === "Completed") {
      console.log("Order already processed:", orderId);
      return res.redirect(`${FRONTEND_URL}/checkout?success=true&orderId=${order._id}`);
    }

    order.paymentIntent.status = "Completed";
    order.paymentIntent.transactionCode = transaction_code;
    order.orderStatus = "Processing";
    await order.save();

    const updates = order.products.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.count, sold: +item.count } },
      },
    }));
    if (updates.length > 0) {
      await Product.bulkWrite(updates);
    }

    try {
      const deletedCart = await Cart.findOneAndDelete({ orderby: order.orderby });
      console.log("Cart cleared for user:", order.orderby, deletedCart ? "Success" : "No cart found");
    } catch (cartError) {
      console.error("Error clearing cart:", cartError);
    }

    return res.redirect(`${FRONTEND_URL}/checkout?success=true&orderId=${order._id}`);
  } catch (error) {
    console.error("Error processing success:", error);
    return res.redirect(`${FRONTEND_URL}/checkout?error=Processing failed: ${error.message}`);
  }
});


const handlePaymentFailure = asyncHandler(async (req, res) => {
  const { orderId } = req.query;
  console.log("Payment failure callback received for order:", orderId);

  if (orderId) {
    try {
      // Find and delete the pending order
      const deletedOrder = await Order.findByIdAndDelete(orderId);
      console.log("Deleted pending order:", deletedOrder ? "Success" : "No order found");
    } catch (error) {
      console.error("Error handling payment failure:", error);
    }
  }

  return res.redirect(`${FRONTEND_URL}/checkout?error=Payment failed or was cancelled`);
});

module.exports = {
  initiateEsewaPayment,
  verifyEsewaPayment,
  handlePaymentFailure,
};