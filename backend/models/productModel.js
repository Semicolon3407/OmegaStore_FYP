const mongoose = require('mongoose');

// Declare the Schema of the Mongo model
const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true, // Trims whitespace from the title
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true, // Ensures slug is lowercase
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required:true,
    },
    brand: {
        type: String,
        required:true,
    },
    quantity: {
        type: Number,
        required:true, 
    },
    sold: {
        type: Number,
        default: 0, // Default value for sold items
    },
    images: {
        type: [String], // Define images as an array of strings (URLs or file paths)
    },
    color: {
        type: String,
        required:true,
    },
    ratings: [
        {
            star: {
                type: Number,
                min: 1,
                max: 5, // Star ratings should be between 1 and 5
            },
            postedby: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User", // Reference to the User model
            },
        },
    ],
}, {
    timestamps: true, // Automatically create createdAt and updatedAt fields
});

// Export the model
module.exports = mongoose.model('Product', productSchema);
