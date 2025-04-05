import React from 'react';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useCart } from '../Context/cartContext';
import { useWishlist } from '../Context/wishlistContext';

const Wishlist = () => {
  const { wishlistItems, loading, error, removeFromWishlist } = useWishlist();
  const { addToCart, cartItems } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = async (productId) => {
    const success = await addToCart(productId);
    if (success) {
      toast.success('Added to cart!');
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen pt-40 lg:pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-100 min-h-screen pt-40 lg:pt-32 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Wishlist Error</h2>
          <p className="text-red-600 mb-6">{error}</p>
          {!localStorage.getItem('token') && (
            <Link
              to="/sign-in"
              className="bg-blue-900 text-white px-6 py-3 rounded-full hover:bg-blue-800 transition-all duration-300 shadow-md inline-block"
            >
              Login to View Wishlist
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
          className="mb-12 text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Your Wishlist
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Items you’ve saved for later
          </p>
        </motion.div>

        {wishlistItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-200"
          >
            <Heart size={80} className="mx-auto mb-6 text-gray-300" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 tracking-tight">
              Your Wishlist is Empty
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
              Add some products you love to keep track of them here!
            </p>
            <Link
              to="/products"
              className="bg-blue-900 text-white px-6 py-3 rounded-full hover:bg-blue-800 transition-all duration-300 shadow-md inline-block"
            >
              Explore Products
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {wishlistItems.map((item) => (
              <motion.div
                key={item._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 relative group"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="relative">
                  <Link to={`/products/${item._id}`}>
                    <div className="h-64 bg-gray-100 flex items-center justify-center">
                      <img
                        src={item.images?.[0] || '/assets/images/placeholder.png'}
                        alt={item.title || 'Product'}
                        className="w-full h-full object-contain p-6 transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  </Link>
                  <button
                    onClick={() => removeFromWishlist(item._id)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 text-red-500 hover:text-red-600 transition-all duration-300 shadow-md"
                  >
                    <Heart size={20} fill="currentColor" />
                  </button>
                </div>
                <div className="p-6">
                  <Link to={`/products/${item._id}`}>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1 hover:text-blue-500 transition-colors duration-300">
                      {item.title || 'Product'}
                    </h2>
                  </Link>
                  <p className="text-lg font-bold text-blue-900 mb-3">
                    Rs {(item.price || 0).toLocaleString()}
                  </p>
                  <p className="text-gray-600 text-sm mb-4 capitalize">
                    {item.brand || 'N/A'} • {item.color || 'N/A'}
                  </p>
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => handleAddToCart(item._id)}
                      disabled={
                        cartItems.some((cartItem) => cartItem.product?._id === item._id) ||
                        (item.quantity ?? 0) <= 0
                      }
                      className={`flex items-center px-4 py-2 rounded-full transition-all duration-300 shadow-md text-sm font-medium ${
                        cartItems.some((cartItem) => cartItem.product?._id === item._id)
                          ? 'bg-green-100 text-green-700'
                          : (item.quantity ?? 0) <= 0
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-900 text-white hover:bg-blue-800'
                      }`}
                    >
                      <ShoppingCart size={18} className="mr-2" />
                      {cartItems.some((cartItem) => cartItem.product?._id === item._id)
                        ? 'Added'
                        : (item.quantity ?? 0) <= 0
                        ? 'Out of Stock'
                        : 'Add to Cart'}
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item._id)}
                      className="text-red-500 hover:text-red-700 p-2 flex items-center transition-colors duration-300"
                    >
                      <Trash2 size={20} className="mr-1" />
                      <span className="text-sm font-medium hidden sm:inline">Remove</span>
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