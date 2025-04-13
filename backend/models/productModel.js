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
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ['main', 'sub'],
          required: true,
        },
      },
    ],
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
          default: '',
        },
        postedby: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: [true, 'Reviewer ID is required'],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    totalrating: {
      type: Number,
      default: 0,
      min: [0, 'Total rating cannot be negative'],
      max: [5, 'Total rating cannot exceed 5'],
    },
    isOnSale: {
      type: Boolean,
      default: false,
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: [0, 'Discount percentage cannot be negative'],
      max: [100, 'Discount percentage cannot exceed 100'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);