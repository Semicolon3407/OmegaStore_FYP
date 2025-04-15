const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        count: Number,
        color: String,
        price: Number,
      },
    ],
    paymentIntent: {
      id: String,
      method: String,
      amount: Number,
      status: {
        type: String,
        default: "Pending",
        enum: ["Pending", "Completed", "Failed", "Cash on Delivery", "eSewa"],
      },
      created: Number,
      currency: String,
      transactionCode: String, // For eSewa transaction code
    },
    orderStatus: {
      type: String,
      default: "Not Processed",
      enum: [
        "Not Processed",
        "Cash on Delivery",
        "Processing",
        "Dispatched",
        "Cancelled",
        "Delivered",
        "Pending",
        "eSewa",
      ],
    },
    orderby: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },
    totalAfterDiscount: {
      type: Number,
      default: null,
    },
    shippingInfo: {
      name: { type: String },
      email: { type: String },
      address: { type: String },
      city: { type: String },
      phone: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);