import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, ShoppingCart, Heart } from "lucide-react";
import Image from "../components/Image";
import { products } from "../data/products";

const ProductDetails = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);

  // Find the product based on the id
  const product = products.find((p) => p.id === parseInt(id));

  // Mock reviews data
  const reviews = [
    {
      id: 1,
      user: "Alice",
      rating: 5,
      comment: "Great product, highly recommended!",
    },
    {
      id: 2,
      user: "Bob",
      rating: 4,
      comment: "Good quality, but a bit pricey.",
    },
    {
      id: 3,
      user: "Charlie",
      rating: 5,
      comment: "Excellent customer service and fast shipping.",
    },
  ];

  // Find related products (same category, excluding current product)
  const relatedProducts = products
    .filter((p) => p.category === product?.category && p.id !== product?.id)
    .slice(0, 4);

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <motion.div
              className="md:w-1/2"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src={product.image}
                alt={product.name}
                className="w-full h-auto"
              />
            </motion.div>
            <div className="md:w-1/2 p-8">
              <motion.h1
                className="text-3xl font-bold mb-4 text-gray-800"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {product.name}
              </motion.h1>
              <motion.div
                className="flex items-center mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="flex text-yellow-400 mr-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      fill={
                        i < Math.floor(product.rating) ? "currentColor" : "none"
                      }
                    />
                  ))}
                </div>
                <span className="text-gray-600">
                  ({reviews.length} reviews)
                </span>
              </motion.div>
              <motion.p
                className="text-gray-600 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                {product.description}
              </motion.p>

              {/* Display Product Color and Brand */}
              <motion.div
                className="text-gray-600 mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <strong>Color:</strong> {product.color}
              </motion.div>
              <motion.div
                className="text-gray-600 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <strong>Brand:</strong> {product.brand}
              </motion.div>

              <motion.div
                className="text-3xl font-bold mb-6 text-primary-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                Rs {product.price.toFixed(2)}
              </motion.div>
              <div className="flex items-center mb-6">
                <label htmlFor="quantity" className="mr-4 text-gray-700">
                  Quantity:
                </label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value)))
                  }
                  className="w-20 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </div>
              <motion.div
                className="flex space-x-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1 }}
              >
                <button className="bg-primary-600 text-white px-6 py-3 rounded-full flex items-center hover:bg-primary-700 transition-colors">
                  <ShoppingCart className="mr-2" size={20} />
                  Add to Cart
                </button>
                <button className="border border-primary-600 text-primary-600 px-6 py-3 rounded-full flex items-center hover:bg-primary-50 transition-colors">
                  <Heart className="mr-2" size={20} />
                  Add to Wishlist
                </button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-lg shadow-md p-4 mb-4"
            >
              <div className="flex items-center mb-2">
                <div className="flex text-yellow-400 mr-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < review.rating ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <span className="font-semibold">{review.user}</span>
              </div>
              <p className="text-gray-600">{review.comment}</p>
            </div>
          ))}
        </div>

        {/* Related Products Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <motion.div
                key={relatedProduct.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Image
                  src={relatedProduct.image}
                  alt={relatedProduct.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">
                    {relatedProduct.name}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    Rs {relatedProduct.price.toFixed(2)}
                  </p>
                  <button className="bg-primary-600 text-white px-4 py-2 rounded-full hover:bg-primary-700 transition-colors w-full">
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
