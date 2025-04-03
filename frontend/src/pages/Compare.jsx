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
      <div className="bg-gray-100 min-h-screen pt-40 lg:pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading your compare list...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-100 min-h-screen pt-40 lg:pt-32 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Compare List Error</h2>
          <p className="text-red-600 mb-6">{error}</p>
          {!localStorage.getItem('token') && (
            <Link
              to="/sign-in"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md inline-block"
            >
              Login to View Compare List
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen pt-40 lg:pt-32">
      <div className="container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link
            to="/products"
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-300"
          >
            <ChevronLeft size={20} className="mr-2" />
            Back to Products
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Compare Products
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            View detailed side-by-side comparison of your selected products
          </p>
        </motion.div>

        {compareItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center py-16 bg-white rounded-2xl shadow-lg"
          >
            <GitCompare size={80} className="mx-auto mb-6 text-gray-300" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your compare list is empty</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
              Add some products to compare their features side by side!
            </p>
            <Link
              to="/products"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md inline-block"
            >
              Explore Products
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-4 text-left text-gray-700 font-semibold border-b sticky left-0 bg-gray-50 z-10 min-w-40">
                      Product
                    </th>
                    {compareItems.map((item) => (
                      <th key={item._id} className="px-6 py-4 border-b min-w-64">
                        <div className="relative">
                          <button
                            onClick={() => removeFromCompare(item._id)}
                            className="absolute top-0 right-0 p-2 rounded-full text-red-500 hover:bg-red-50 transition-all duration-300"
                          >
                            <Trash2 size={18} />
                          </button>
                          <Link to={`/products/${item._id}`}>
                            <div className="h-48 flex items-center justify-center mb-4">
                              <img
                                src={item.images?.[0] || '/assets/images/placeholder.png'}
                                alt={item.title || 'Product'}
                                className="h-full object-contain"
                              />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                              {item.title || 'Product Name'}
                            </h3>
                          </Link>
                          <div className="flex items-center mb-2 justify-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                className={`${
                                  i < Math.round(item.totalrating || 0)
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-gray-600 text-sm">
                              ({item.ratings?.length || 0})
                            </span>
                          </div>
                          <div className="mt-4">
                            <button
                              onClick={() => handleAddToCart(item._id)}
                              disabled={
                                cartItems.some((cartItem) => cartItem.product?._id === item._id) ||
                                (item.quantity ?? 0) <= 0
                              }
                              className={`flex items-center justify-center w-full px-4 py-2 rounded-full transition-all duration-300 shadow-md ${
                                cartItems.some((cartItem) => cartItem.product?._id === item._id)
                                  ? 'bg-green-100 text-green-700'
                                  : (item.quantity ?? 0) <= 0
                                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                              }`}
                            >
                              <ShoppingCart size={18} className="mr-2" />
                              {cartItems.some((cartItem) => cartItem.product?._id === item._id)
                                ? 'Added'
                                : (item.quantity ?? 0) <= 0
                                ? 'Out of Stock'
                                : 'Add to Cart'}
                            </button>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Product Price */}
                  <tr>
                    <td className="px-6 py-4 text-left font-semibold text-gray-700 border-b sticky left-0 bg-white z-10">
                      Price
                    </td>
                    {compareItems.map((item) => (
                      <td key={item._id} className="px-6 py-4 text-center border-b">
                        <p className="text-xl font-bold text-gray-900">
                          Rs {(item.price || 0).toLocaleString()}
                        </p>
                      </td>
                    ))}
                  </tr>

                  {/* Product Description */}
                  <tr>
                    <td className="px-6 py-4 text-left font-semibold text-gray-700 border-b sticky left-0 bg-white z-10">
                      Description
                    </td>
                    {compareItems.map((item) => (
                      <td key={item._id} className="px-6 py-4 text-center border-b">
                        <p className="text-gray-700 line-clamp-3">
                          {item.description || 'No description available'}
                        </p>
                        {item.description && item.description.length > 150 && (
                          <Link to={`/products/${item._id}`} className="text-blue-600 text-sm hover:underline">
                            Read more
                          </Link>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Generate rows for all other features */}
                  {features.filter(f => !['price'].includes(f)).map((feature) => (
                    <tr key={feature}>
                      <td className="px-6 py-4 text-left font-semibold text-gray-700 border-b sticky left-0 bg-white z-10 capitalize">
                        {feature}
                      </td>
                      {compareItems.map((item) => (
                        <td key={item._id} className="px-6 py-4 text-center border-b">
                          {renderFeatureValue(item, feature)}
                        </td>
                      ))}
                    </tr>
                  ))}

                  {/* Availability based on quantity */}
                  <tr>
                    <td className="px-6 py-4 text-left font-semibold text-gray-700 border-b sticky left-0 bg-white z-10">
                      Availability
                    </td>
                    {compareItems.map((item) => (
                      <td key={item._id} className="px-6 py-4 text-center border-b">
                        {(item.quantity || 0) > 0 ? (
                          <span className="text-green-600 font-medium">In Stock</span>
                        ) : (
                          <span className="text-red-600 font-medium">Out of Stock</span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {compareItems.length > 0 && (
              <div className="p-6 flex justify-center border-t">
                <button
                  onClick={handleClearCompare}
                  className="text-red-600 hover:text-red-800 font-medium transition-colors duration-300 px-6 py-3 rounded-full border border-red-600 hover:bg-red-50"
                >
                  Clear Compare List
                </button>
              </div>
            )}
          </motion.div>
        )}

        {compareItems.length > 0 && compareItems.length < 4 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-8"
          >
            <Link
              to="/products"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-300"
            >
              <Info size={18} className="mr-2" />
              You can compare up to 4 products. Add more from our Products page!
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Compare;