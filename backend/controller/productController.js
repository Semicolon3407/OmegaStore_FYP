const Product = require("../models/productModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");

// Create a new product
const createProduct = asyncHandler(async (req, res) => {
    try {
        if (!req.body.title || typeof req.body.title !== "string") {
            return res.status(400).json({
                success: false,
                message: "Product name is required and must be a string"
            });
        }
        req.body.slug = slugify(req.body.title, { lower: true, strict: true });
        const newProduct = await Product.create(req.body);
        res.status(201).json({
            success: true,
            message: "Product created successfully!",
            product: newProduct
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get a single product by ID
const getSingleProduct = asyncHandler(async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.status(200).json({ success: true, product });
    } catch (error) {
        res.status(400).json({ success: false, message: "Invalid product ID" });
    }
});

// Get all products with filtering, sorting, and pagination
const getAllProducts = asyncHandler(async (req, res) => {
    try {
        const { category, brand, price, color, sortBy, sortOrder, excludeFields, limit, page } = req.query;
        let filter = {};
        if (category) filter.category = category;
        if (brand) filter.brand = brand;
        if (price) {
            const [min, max] = price.split('-').map(Number);
            if (!isNaN(min) && !isNaN(max)) filter.price = { $gte: min, $lte: max };
        }
        if (color) filter.color = color;
        
        let sort = {};
        if (sortBy) sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        let projection = {};
        if (excludeFields) {
            excludeFields.split(',').forEach(field => projection[field] = 0);
        }

        let pageNumber = parseInt(page) || 1;
        let limitNumber = parseInt(limit) || 10;
        const skip = (pageNumber - 1) * limitNumber;

        const products = await Product.find(filter).select(projection).sort(sort).skip(skip).limit(limitNumber);
        const totalProducts = await Product.countDocuments(filter);

        res.status(200).json({
            success: true,
            products,
            pagination: { currentPage: pageNumber, limit: limitNumber, totalProducts, totalPages: Math.ceil(totalProducts / limitNumber) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update product
const updateProduct = asyncHandler(async (req, res) => {
    try {
        if (req.body.title) req.body.slug = slugify(req.body.title, { lower: true, strict: true });
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.status(200).json({ success: true, message: "Product updated successfully!", product });
    } catch (error) {
        res.status(400).json({ success: false, message: "Invalid product ID" });
    }
});

// Delete product
const deleteProduct = asyncHandler(async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.status(200).json({ success: true, message: "Product deleted successfully!" });
    } catch (error) {
        res.status(400).json({ success: false, message: "Invalid product ID" });
    }
});

// Add or remove from wishlist
const addToWishlist = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const update = user.wishlist.includes(req.body.prodId) ? { $pull: { wishlist: req.body.prodId } } : { $push: { wishlist: req.body.prodId } };
        const updatedUser = await User.findByIdAndUpdate(req.user._id, update, { new: true });
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Product rating
const rating = asyncHandler(async (req, res) => {
    try {
        const product = await Product.findById(req.body.prodId);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        const existingRating = product.ratings.find(r => r.postedby.toString() === req.user._id.toString());
        if (existingRating) {
            await Product.updateOne({ "ratings.postedby": req.user._id }, { $set: { "ratings.$.star": req.body.star, "ratings.$.comment": req.body.comment } });
        } else {
            await Product.findByIdAndUpdate(req.body.prodId, { $push: { ratings: { star: req.body.star, comment: req.body.comment, postedby: req.user._id } } });
        }

        const updatedProduct = await Product.findById(req.body.prodId);
        const totalRating = updatedProduct.ratings.length;
        const ratingSum = updatedProduct.ratings.reduce((sum, r) => sum + r.star, 0);
        updatedProduct.totalrating = Math.round(ratingSum / totalRating);
        await updatedProduct.save();

        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = { createProduct, getSingleProduct, getAllProducts, updateProduct, deleteProduct, addToWishlist, rating };
