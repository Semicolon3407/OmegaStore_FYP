// models/productModel.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
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
      required: [true, 'Product description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
    },
    brand: {
      type: String,
      required: [true, 'Product brand is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Product quantity is required'],
      min: [0, 'Quantity cannot be negative'],
    },
    sold: {
      type: Number,
      default: 0,
      min: [0, 'Sold count cannot be negative'],
    },
    images: {
      type: [String],
      validate: {
        validator: function (arr) {
          return Array.isArray(arr) && arr.every((url) => typeof url === 'string');
        },
        message: 'Images should be an array of URLs',
      },
    },
    color: {
      type: String,
      required: [true, 'Product color is required'],
    },
    ratings: [
      {
        star: {
          type: Number,
          required: [true, 'Rating star is required'],
          min: [1, 'Rating must be at least 1'],
          max: [5, 'Rating cannot exceed 5'],
        },
        comment: {
          type: String,
          default: '', // Allow empty comments but include the field
        },
        postedby: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: [true, 'Reviewer ID is required'],
        },
        createdAt: {
          type: Date,
          default: Date.now, // Explicitly add timestamp for each rating
        },
      },
    ],
    totalrating: {
      type: Number,
      default: 0, // Store the average rating
      min: [0, 'Total rating cannot be negative'],
      max: [5, 'Total rating cannot exceed 5'],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt to the product document
  }
);

module.exports = mongoose.model('Product', productSchema);