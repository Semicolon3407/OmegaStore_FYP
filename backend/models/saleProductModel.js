const mongoose = require('mongoose');

const saleProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Sale product title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Sale product description is required"],
    },
    price: {
      type: Number,
      required: [true, "Original price is required"],
      min: [0, "Price cannot be negative"],
    },
    salePrice: {
      type: Number,
      required: [true, "Sale price is required"],
      min: [0, "Sale price cannot be negative"],
      validate: {
        validator: function (v) {
          return v < this.price; // Sale price must be less than original price
        },
        message: "Sale price must be less than the original price",
      },
    },
    category: {
      type: String,
      required: [true, "Sale product category is required"],
    },
    brand: {
      type: String,
      required: [true, "Sale product brand is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Sale product quantity is required"],
      min: [0, "Quantity cannot be negative"],
    },
    sold: {
      type: Number,
      default: 0,
      min: [0, "Sold count cannot be negative"],
    },
    images: {
      type: [String],
      validate: {
        validator: function (arr) {
          return Array.isArray(arr) && arr.every((url) => typeof url === "string");
        },
        message: "Images should be an array of URLs",
      },
    },
    color: {
      type: String,
      required: [true, "Sale product color is required"],
    },
    ratings: [
      {
        star: {
          type: Number,
          min: [1, "Rating must be at least 1"],
          max: [5, "Rating cannot exceed 5"],
        },
        comment: {
          type: String,
          default: "",
        },
        postedby: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    totalrating: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SaleProduct', saleProductSchema);