import React, { useEffect, useState } from 'react';
import { GitCompare, ShoppingCart, Trash2, ChevronLeft, Star, Info } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useCart } from '../Context/cartContext';
import { useCompare } from '../Context/compareContext';

const Compare = () => {
  const { compareItems, loading, error, removeFromCompare, clearCompare } = useCompare();
  const { addToCart, cartItems } = useCart();
  const navigate = useNavigate();
  const [features, setFeatures] = useState([]);

  // Extract all possible features from products for comparison
  useEffect(() => {
    if (compareItems.length > 0) {
      const allFeatures = ['brand', 'category', 'color', 'price', 'quantity'];
      setFeatures(allFeatures);
    }
  }, [compareItems]);

  const handleAddToCart = async (productId) => {
    const actualProductId = typeof productId === 'object' ? productId._id : productId;
    const success = await addToCart(actualProductId);
    if (success) {
      toast.success('Added to cart!');
    }
  };

  const handleClearCompare = async () => {
    const success = await clearCompare();
    if (success) {
      toast.success('Compare list cleared!');
    }
  };

  const renderFeatureValue = (product, feature) => {
    if (!product) return 'N/A';

    switch (feature) {
      case 'price':
        return `Rs ${(product.price || 0).toLocaleString()}`;
      case 'quantity':
        return product[feature] > 0 ? `${product[feature]} in stock` : 'Out of stock';
      default:
        return product[feature] || 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 flex items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-blue-900"></div>
          <p className="mt-3 sm:mt-4 text-gray-600 text-base sm:text-lg">Loading your compare list...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-100 min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 flex items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="text-center max-w-md p-6 sm:p-8 bg-white rounded-lg shadow-md hover:shadow-xl border border-gray-200">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-900 mb-3 sm:mb-4 tracking-tight">Compare List Error</h2>
          <p className="text-red-600 mb-4 sm:mb-6 text-sm sm:text-base">{error}</p>
          {!localStorage.getItem('token') && (
            <Link
              to="/sign-in"
              className="bg-blue-900 text-white px-5 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-blue-500 transition-all duration-300 shadow-md inline-block text-sm sm:text-base"
            >
              Login to View Compare List
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12 md:py-16">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 sm:mb-8 flex justify-between items-center"
        >
          <Link
            to="/products"
            className="flex items-center text-blue-900 hover:text-orange-500 font-medium transition-colors duration-300 text-sm sm:text-base"
          >
            <ChevronLeft size={16} className="mr-1 sm:mr-2" />
            Back to Products
          </Link>
          {compareItems.length > 0 && (
            <button
              onClick={handleClearCompare}
              className="text-red-600 hover:text-red-800 font-medium transition-colors duration-300 px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-red-600 hover:bg-red-50 text-sm sm:text-base"
            >
              Clear Compare List
            </button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 sm:mb-12 text-center border-b border-gray-200 pb-4"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-900 mb-2 sm:mb-3 tracking-tight">
            Compare Products
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-xl sm:max-w-2xl mx-auto leading-relaxed">
            Analyze the features of your selected products side by side to make an informed decision.
          </p>
        </motion.div>

        {compareItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center py-12 sm:py-16 bg-white rounded-lg shadow-md hover:shadow-xl border border-gray-200 max-w-md sm:max-w-lg mx-auto"
          >
            <GitCompare size={60} className="mx-auto mb-4 sm:mb-6 text-gray-300" />
            <h2 className="text-xl sm:text-2xl font-semibold text-blue-900 mb-3 sm:mb-4 tracking-tight">Your compare list is empty</h2>
            <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base max-w-sm sm:max-w-md mx-auto leading-relaxed">
              Add products to compare their features and find the best fit for your needs.
            </p>
            <Link
              to="/products"
              className="bg-blue-900 text-white px-5 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-blue-500 transition-all duration-300 shadow-md inline-block text-sm sm:text-base"
            >
              Explore Products
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-lg shadow-md border border-gray-200"
          >
            {/* Product Cards Grid for Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 p-4 sm:p-6">
              {/* Feature Labels Column */}
              <div className="sticky top-0 bg-white z-10">
                <div className="h-48 sm:h-56 flex items-center justify-center border-b border-gray-200">
                  <h3 className="text-sm sm:text-lg font-semibold text-blue-900">Features</h3>
                </div>
                <div className="border-b border-gray-200 py-3 sm:py-4">
                  <p className="text-xs sm:text-sm font-semibold text-gray-700">Price</p>
                </div>
                <div className="border-b border-gray-200 py-3 sm:py-4">
                  <p className="text-xs sm:text-sm font-semibold text-gray-700">Description</p>
                </div>
                {features.filter(f => !['price'].includes(f)).map((feature) => (
                  <div key={feature} className="border-b border-gray-200 py-3 sm:py-4">
                    <p className="text-xs sm:text-sm font-semibold text-gray-700 capitalize">{feature}</p>
                  </div>
                ))}
                <div className="border-b border-gray-200 py-3 sm:py-4">
                  <p className="text-xs sm:text-sm font-semibold text-gray-700">Availability</p>
                </div>
                <div className="py-3 sm:py-4">
                  <p className="text-xs sm:text-sm font-semibold text-gray-700">Actions</p>
                </div>
              </div>

              {/* Product Columns */}
              {compareItems.map((item) => (
                <div key={item._id} className="relative border border-gray-200 rounded-lg">
                  <button
                    onClick={() => removeFromCompare(item._id)}
                    className="absolute top-2 right-2 p-1 sm:p-2 rounded-full text-red-500 hover:bg-red-50 transition-all duration-300"
                  >
                    <Trash2 size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <Link to={`/products/${item._id}`}>
                    <div className="h-48 sm:h-56 flex items-center justify-center border-b border-gray-200">
                      <img
                        src={item.images?.[0] || '/assets/images/placeholder.png'}
                        alt={item.title || 'Product'}
                        className="h-full object-contain p-4"
                      />
                    </div>
                    <div className="border-b border-gray-200 py-3 sm:py-4 px-4">
                      <h3 className="text-sm sm:text-lg font-semibold text-blue-900 hover:text-orange-500 transition-colors duration-300">
                        {item.title || 'Product Name'}
                      </h3>
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={`w-3 h-3 sm:w-4 sm:h-4 ${
                              i < Math.round(item.totalrating || 0)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-1 sm:ml-2 text-gray-600 text-xs sm:text-sm">
                          ({item.ratings?.length || 0})
                        </span>
                      </div>
                    </div>
                  </Link>
                  <div className="border-b border-gray-200 py-3 sm:py-4 px-4">
                    <p className="text-lg sm:text-xl font-bold text-blue-900">
                      Rs {(item.price || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="border-b border-gray-200 py-3 sm:py-4 px-4">
                    <p className="text-gray-700 text-xs sm:text-sm line-clamp-2">
                      {item.description || 'No description available'}
                    </p>
                    {item.description && item.description.length > 100 && (
                      <Link to={`/products/${item._id}`} className="text-blue-900 hover:text-orange-500 text-xs sm:text-sm transition-colors duration-300">
                        Read more
                      </Link>
                    )}
                  </div>
                  {features.filter(f => !['price'].includes(f)).map((feature) => (
                    <div key={feature} className="border-b border-gray-200 py-3 sm:py-4 px-4">
                      <p className="text-xs sm:text-sm text-gray-700">{renderFeatureValue(item, feature)}</p>
                    </div>
                  ))}
                  <div className="border-b border-gray-200 py-3 sm:py-4 px-4">
                    {(item.quantity || 0) > 0 ? (
                      <span className="text-green-600 font-medium text-xs sm:text-sm">In Stock</span>
                    ) : (
                      <span className="text-red-600 font-medium text-xs sm:text-sm">Out of Stock</span>
                    )}
                  </div>
                  <div className="py-3 sm:py-4 px-4">
                    <button
                      onClick={() => handleAddToCart(item._id)}
                      disabled={
                        cartItems.some((cartItem) => cartItem.product?._id === item._id) ||
                        (item.quantity ?? 0) <= 0
                      }
                      className={`flex items-center justify-center w-full px-3 sm:px-4 py-1 sm:py-2 rounded-full transition-all duration-300 shadow-md text-xs sm:text-sm ${
                        cartItems.some((cartItem) => cartItem.product?._id === item._id)
                          ? 'bg-green-100 text-green-700'
                          : (item.quantity ?? 0) <= 0
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-900 text-white hover:bg-blue-500'
                      }`}
                    >
                      <ShoppingCart size={16} className="mr-1 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                      {cartItems.some((cartItem) => cartItem.product?._id === item._id)
                        ? 'Added'
                        : (item.quantity ?? 0) <= 0
                        ? 'Out of Stock'
                        : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {compareItems.length > 0 && compareItems.length < 4 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-6 sm:mt-8"
          >
            <Link
              to="/products"
              className="inline-flex items-center text-blue-900 hover:text-orange-500 font-medium transition-colors duration-300 text-sm sm:text-base"
            >
              <Info size={16} className="mr-1 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5" />
              You can compare up to 4 products. Add more from our Products page!
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Compare;