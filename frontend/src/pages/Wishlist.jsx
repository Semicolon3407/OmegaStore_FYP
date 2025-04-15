import React from 'react';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useCart } from '../Context/cartContext';
import { useWishlist } from '../Context/wishlistContext';

const BASE_URL = 'http://localhost:5001';

const Wishlist = () => {
  const { wishlistItems, loading, error, removeFromWishlist } = useWishlist();
  const { addToCart, cartItems } = useCart();
  const navigate = useNavigate();

  const getImageUrl = (item) => {
    const imageUrl = item.images?.[0]?.url;
    if (!imageUrl) return '/placeholder.jpg';
    return imageUrl.startsWith('http') ? imageUrl : `${BASE_URL}${imageUrl}`;
  };

  const handleAddToCart = async (productId) => {
    const actualProductId = typeof productId === 'object' ? productId._id : productId;
    const success = await addToCart(actualProductId);
    if (success) {
      toast.success('Added to cart!');
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-blue-900"></div>
          <p className="mt-3 sm:mt-4 text-gray-600 text-base sm:text-lg">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-100 min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 flex items-center justify-center">
        <div className="text-center max-w-md p-6 sm:p-8 bg-white rounded-lg shadow-md hover:shadow-xl border border-gray-200">
          <h2 className="text-xl sm:text-2xl font-bold text-blue-900 mb-3 sm:mb-4 tracking-tight">Wishlist Error</h2>
          <p className="text-red-600 mb-4 sm:mb-6 text-sm sm:text-base">{error}</p>
          {!localStorage.getItem('token') && (
            <Link
              to="/sign-in"
              className="bg-blue-900 text-white px-5 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-blue-500 transition-all duration-300 shadow-md inline-block text-sm sm:text-base"
            >
              Login to View Wishlist
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-12 sm:py-16 md:py-20 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 sm:mb-10 md:mb-12 lg:mb-16 text-center"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-900 mb-3 sm:mb-4 tracking-tight">
            Your Wishlist
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-md sm:max-w-xl mx-auto leading-relaxed">
            Items you’ve saved for later
          </p>
        </motion.div>

        {wishlistItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center py-12 sm:py-16 bg-white rounded-lg shadow-md hover:shadow-xl border border-gray-200"
          >
            <Heart size={60} className="mx-auto mb-4 sm:mb-6 text-gray-300" />
            <h2 className="text-xl sm:text-2xl font-semibold text-blue-900 mb-3 sm:mb-4 tracking-tight">
              Your Wishlist is Empty
            </h2>
            <p className="text-gray-600 mb-6 sm:mb-8 max-w-sm sm:max-w-md mx-auto leading-relaxed text-sm sm:text-base">
              Add some products you love to keep track of them here!
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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {wishlistItems.map((item) => (
              <motion.div
                key={item._id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl overflow-hidden border border-gray-200 transition-all duration-300 relative group"
                whileHover={{ y: -6 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="relative">
                  <Link to={`/products/${item._id}`}>
                    <div className="h-48 sm:h-56 md:h-64 bg-gray-100 flex items-center justify-center">
                      <img
                        src={getImageUrl(item)}
                        alt={item.title || 'Product'}
                        className="w-full h-full object-contain p-4 sm:p-6 transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.target.src = '/placeholder.jpg';
                        }}
                      />
                    </div>
                  </Link>
                  <button
                    onClick={() => removeFromWishlist(item._id)}
                    className="absolute top-3 right-3 p-1 sm:p-2 rounded-full bg-white text-red-500 hover:text-red-600 transition-all duration-300 shadow-md"
                  >
                    <Heart size={20} fill="currentColor" />
                  </button>
                </div>
                <div className="p-4 sm:p-6">
                  <Link to={`/products/${item._id}`}>
                    <h2 className="text-base sm:text-lg font-semibold text-blue-900 mb-1 sm:mb-2 line-clamp-1 hover:text-orange-500 transition-colors duration-300">
                      {item.title || 'Product'}
                    </h2>
                  </Link>
                  <p className="text-lg sm:text-xl font-bold text-blue-900 mb-2 sm:mb-3">
                    Rs {(item.price || 0).toLocaleString()}
                  </p>
                  <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 capitalize">
                    {item.brand || 'N/A'} • {item.color || 'N/A'}
                  </p>
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3">
                    <button
                      onClick={() => handleAddToCart(item._id)}
                      disabled={
                        cartItems.some((cartItem) => cartItem.product?._id === item._id) ||
                        (item.quantity ?? 0) <= 0
                      }
                      className={`flex items-center px-3 sm:px-4 py-2 rounded-full transition-all duration-300 shadow-md text-xs sm:text-sm font-medium w-full sm:w-auto ${
                        cartItems.some((cartItem) => cartItem.product?._id === item._id)
                          ? 'bg-green-100 text-green-700'
                          : (item.quantity ?? 0) <= 0
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-900 text-white hover:bg-blue-500'
                      }`}
                    >
                      <ShoppingCart size={18} className="mr-1 sm:mr-2" />
                      {cartItems.some((cartItem) => cartItem.product?._id === item._id)
                        ? 'Added'
                        : (item.quantity ?? 0) <= 0
                        ? 'Out of Stock'
                        : 'Add to Cart'}
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item._id)}
                      className="text-red-500 hover:text-red-700 p-1 sm:p-2 flex items-center transition-colors duration-300 w-full sm:w-auto justify-center sm:justify-start"
                    >
                      <Trash2 size={20} className="mr-1 sm:mr-2" />
                      <span className="text-xs sm:text-sm font-medium hidden sm:inline">Remove</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;