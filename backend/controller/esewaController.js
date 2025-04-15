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
const ESEWA_PAYMENT_URL = process.env.NODE_ENV === "production"
  ? "https://epay.esewa.com.np/api/epay/main/v2/form"
  : "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
const ESEWA_STATUS_URL = process.env.NODE_ENV === "production"
  ? "https://epay.esewa.com.np/api/epay/transaction/status"
  : "https://rc.esewa.com.np/api/epay/transaction/status";
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
    
    // Create order first
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

    // Generate signature
    const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${ESEWA_PRODUCT_CODE}`;
    const signature = generateSignature(message, ESEWA_SECRET);

    // eSewa form data
    const formData = {
      amount: amount,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      transaction_uuid: transactionUuid,
      product_code: ESEWA_PRODUCT_CODE,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: `${SUCCESS_URL}?orderId=${newOrder._id}`,
      failure_url: `${FAILURE_URL}?orderId=${newOrder._id}`,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature: signature,
    };

    res.json({
      paymentUrl: ESEWA_PAYMENT_URL,
      formData,
      orderId: newOrder._id,
    });
  } catch (error) {
    console.error("Error initiating payment:", error);
    res.status(500).json({ message: "Failed to initiate payment" });
  }
});

const handleSuccess = asyncHandler(async (req, res) => {
  const { orderId } = req.query;
  const { data } = req.query;

  if (!orderId || !data) {
    return res.redirect(`${process.env.FRONTEND_URL}/checkout?error=Invalid response`);
  }

  try {
    // Decode base64 response
    const decodedData = JSON.parse(Buffer.from(data, "base64").toString("utf8"));
    const {
      transaction_code,
      status,
      total_amount,
      transaction_uuid,
      product_code,
      signed_field_names,
      signature,
    } = decodedData;

    // Verify signature
    const message = signed_field_names
      .split(",")
      .map((field) => `${field}=${decodedData[field]}`)
      .join(",");
    const computedSignature = generateSignature(message, ESEWA_SECRET);

    if (computedSignature !== signature || status !== "COMPLETE") {
      return res.redirect(`${process.env.FRONTEND_URL}/checkout?error=Invalid transaction`);
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.redirect(`${process.env.FRONTEND_URL}/checkout?error=Order not found`);
    }

    // Update order
    order.paymentIntent.status = "Completed";
    order.paymentIntent.transactionCode = transaction_code;
    order.orderStatus = "Processing";
    await order.save();

    // Update stock
    const updates = order.products.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.count, sold: +item.count } },
      },
    }));
    await Product.bulkWrite(updates);

    // Clear cart
    await Cart.findOneAndDelete({ orderby: order.orderby });

    return res.redirect(`${process.env.FRONTEND_URL}/order-confirmation?orderId=${orderId}`);
  } catch (error) {
    console.error("Error processing success:", error);
    return res.redirect(`${process.env.FRONTEND_URL}/checkout?error=Processing failed`);
  }
});

const handleFailure = asyncHandler(async (req, res) => {
  const { orderId } = req.query;

  if (orderId) {
    try {
      const order = await Order.findById(orderId);
      if (order) {
        order.paymentIntent.status = "Failed";
        order.orderStatus = "Cancelled";
        await order.save();
      }
    } catch (error) {
      console.error("Error updating failed order:", error);
    }
  }

  return res.redirect(`${process.env.FRONTEND_URL}/checkout?error=Payment failed`);
});

const checkTransactionStatus = asyncHandler(async (req, res) => {
  const { transaction_uuid } = req.params;
  const order = await Order.findOne({ "paymentIntent.id": transaction_uuid });
  
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  try {
    const response = await axios.get(`${ESEWA_STATUS_URL}`, {
      params: {
        product_code: ESEWA_PRODUCT_CODE,
        transaction_uuid,
        total_amount: order.paymentIntent.amount,
      },
    });

    const { status, ref_id } = response.data;

    // Update order based on status
    if (status === "COMPLETE" && order.paymentIntent.status !== "Completed") {
      order.paymentIntent.status = "Completed";
      order.paymentIntent.transactionCode = ref_id;
      order.orderStatus = "Processing";
      await order.save();
      
      // Update stock and clear cart
      const updates = order.products.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { quantity: -item.count, sold: +item.count } },
        },
      }));
      await Product.bulkWrite(updates);
      await Cart.findOneAndDelete({ orderby: order.orderby });
    }

    res.json(response.data);
  } catch (error) {
    console.error("Error checking status:", error);
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