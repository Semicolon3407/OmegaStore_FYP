const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");


// Create a new product
const createProduct = asyncHandler(async (req, res) => {
    try {
        // Ensure the 'title' field is provided and is a string
        if (!req.body.title || typeof req.body.title !== "string") {
            return res.status(400).json({
                success: false,
                message: "Product name is required and must be a string"
            });
        }

        // Generate a slug from the product title
        const slug = slugify(req.body.title, { lower: true, strict: true });

        // Add the slug to the request body
        const newProductData = {
            ...req.body,
            slug, // Include the slug in the product data
        };

        // Create the new product and save it to the database
        const newProduct = await Product.create(newProductData);

        // Send response with product data including the generated slug and creation date
        res.status(201).json({
            success: true,
            message: "Product created successfully!",
            product: {
                ...newProduct.toObject(),  // Convert Mongoose document to plain object
                createdAt: newProduct.createdAt, // Include the createdAt timestamp
            },
        });
    } catch (error) {
        // Handle any errors that occur
        res.status(500).json({
            success: false,
            message: error.message || "Something went wrong"
        });
    }
});








// Get a single product by ID
const getSingleProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        // Find product by ID
        const product = await Product.findById(id);

        // If product not found, return a 404 error
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // If found, return the product details
        res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        // Handle invalid ObjectId error
        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }
        throw new Error(error);
    }
});





// Get All products
const getAllProducts = asyncHandler(async (req, res) => {
    try {
        // Extract filter parameters from the query
        const { category, brand, price, color, sortBy, sortOrder, excludeFields, limit, page } = req.query;

        // Build the filter object dynamically
        let filter = {};

        // If category is provided, add it to the filter
        if (category) {
            filter.category = category;
        }

        // If brand is provided, add it to the filter
        if (brand) {
            filter.brand = brand;
        }

        // If price range is provided, add it to the filter (price should be in the format 'min-max')
        if (price) {
            const priceRange = price.split('-'); // Expecting a range like '100-500'
            if (priceRange.length === 2) {
                filter.price = { $gte: priceRange[0], $lte: priceRange[1] }; // Filter by price range
            }
        }

        // If color is provided, add it to the filter
        if (color) {
            filter.color = color;
        }

        // Build sorting object if 'sortBy' and 'sortOrder' are provided
        let sort = {};
        
        // Sort by title, category, or brand based on the `sortBy` query parameter
        if (sortBy) {
            // Default to ascending order if `sortOrder` is not provided
            sortOrder = sortOrder === 'desc' ? -1 : 1;
            
            if (sortBy === 'title') {
                sort.title = sortOrder;
            } else if (sortBy === 'category') {
                sort.category = sortOrder;
            } else if (sortBy === 'brand') {
                sort.brand = sortOrder;
            }
        }

        // Build projection object for excluding fields from the result
        let projection = {};
        if (excludeFields) {
            const exclude = excludeFields.split(','); // Expecting a comma-separated list like 'price,title'
            exclude.forEach(field => {
                projection[field] = 0; // Mark fields for exclusion
            });
        }

        // Set default pagination values
        let pageNumber = parseInt(page) || 1;
        let limitNumber = parseInt(limit) || 10;

        // Calculate the skip value for pagination
        const skip = (pageNumber - 1) * limitNumber;

        // Fetch products from the database based on the filter, sort, and pagination
        const products = await Product.find(filter)
            .select(projection)
            .sort(sort)
            .skip(skip)
            .limit(limitNumber);

        // If no products found, return a 404 error
        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No products found"
            });
        }

        // Return all products along with the filter and sort strings used, and pagination info
        res.status(200).json({
            success: true,
            products,
            pagination: {
                currentPage: pageNumber,
                limit: limitNumber,
                totalProducts: await Product.countDocuments(filter),
                totalPages: Math.ceil(await Product.countDocuments(filter) / limitNumber)
            }
        });
    } catch (error) {
        // Handle any errors that occur
        res.status(500).json({
            success: false,
            message: error.message || "Something went wrong"
        });
    }
});








//Update Product 
const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        console.log("Product ID:", id); // Log the ID being passed
        console.log("Request Body:", req.body); // Log the body being passed for update

        // Find the product by ID
        let product = await Product.findById(id);

        // If product not found, return a 404 error
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Update product fields based on the request body
        if (req.body.title && req.body.title !== product.title) {
            req.body.slug = slugify(req.body.title, { lower: true, strict: true });
        }

        // Perform the update
        product = await Product.findByIdAndUpdate(id, req.body, { new: true });

        // Return updated product
        res.status(200).json({
            success: true,
            message: "Product updated successfully!",
            product
        });
    } catch (error) {
        // Handle invalid ObjectId error or other errors
        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }
        throw new Error(error);
    }
});






// Delete a product by ID
const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        // Find and delete the product by ID
        const product = await Product.findByIdAndDelete(id);

        // If product not found, return a 404 error
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Return success response
        res.status(200).json({
            success: true,
            message: "Product deleted successfully!"
        });
    } catch (error) {
        // Handle invalid ObjectId error or other errors
        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }
        throw new Error(error);
    }
});




const addToWishlist = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { prodId } = req.body;
    try {
      const user = await User.findById(_id);
      const alreadyadded = user.wishlist.find((id) => id.toString() === prodId);
      if (alreadyadded) {
        let user = await User.findByIdAndUpdate(
          _id,
          {
            $pull: { wishlist: prodId },
          },
          {
            new: true,
          }
        );
        res.json(user);
      } else {
        let user = await User.findByIdAndUpdate(
          _id,
          {
            $push: { wishlist: prodId },
          },
          {
            new: true,
          }
        );
        res.json(user);
      }
    } catch (error) {
      throw new Error(error);
    }
  });
  
  const rating = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { star, prodId, comment } = req.body;
    try {
      const product = await Product.findById(prodId);
      let alreadyRated = product.ratings.find(
        (userId) => userId.postedby.toString() === _id.toString()
      );
      if (alreadyRated) {
        const updateRating = await Product.updateOne(
          {
            ratings: { $elemMatch: alreadyRated },
          },
          {
            $set: { "ratings.$.star": star, "ratings.$.comment": comment },
          },
          {
            new: true,
          }
        );
      } else {
        const rateProduct = await Product.findByIdAndUpdate(
          prodId,
          {
            $push: {
              ratings: {
                star: star,
                comment: comment,
                postedby: _id,
              },
            },
          },
          {
            new: true,
          }
        );
      }
      const getallratings = await Product.findById(prodId);
      let totalRating = getallratings.ratings.length;
      let ratingsum = getallratings.ratings
        .map((item) => item.star)
        .reduce((prev, curr) => prev + curr, 0);
      let actualRating = Math.round(ratingsum / totalRating);
      let finalproduct = await Product.findByIdAndUpdate(
        prodId,
        {
          totalrating: actualRating,
        },
        { new: true }
      );
      res.json(finalproduct);
    } catch (error) {
      throw new Error(error);
    }
  });
  



module.exports = { createProduct, getSingleProduct, getAllProducts, updateProduct, deleteProduct,  addToWishlist,
    rating,  };
