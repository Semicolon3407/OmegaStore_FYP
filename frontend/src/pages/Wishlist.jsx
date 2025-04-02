import React from 'react';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
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
      toast.success('Added to cart');
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          {!localStorage.getItem('token') && (
            <Link
              to="/sign-in"
              className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors inline-block"
            >
              Login to View Wishlist
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Your Wishlist</h1>
        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <Heart size={64} className="mx-auto mb-4 text-gray-400" />
            <p className="text-xl text-gray-600 mb-8">Your wishlist is empty</p>
            <Link
              to="/products"
              className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors inline-block"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {wishlistItems.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl shadow-md overflow-hidden transition-transform hover:shadow-lg"
              >
                <div className="relative">
                  <Link to={`/products/${item._id}`}>
                    <img
                      src={item.images?.[0] || '/assets/images/placeholder.png'}
                      alt={item.title || 'Product'}
                      className="w-full h-64 object-cover"
                    />
                  </Link>
                  <button
                    onClick={() => removeFromWishlist(item._id)}
                    className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-red-50 text-red-500"
                  >
                    <Heart size={20} fill="currentColor" />
                  </button>
                </div>
                <div className="p-6">
                  <Link to={`/products/${item._id}`}>
                    <h2 className="text-xl font-semibold mb-2 text-gray-800 hover:text-blue-600 transition-colors">
                      {item.title || 'Product'}
                    </h2>
                  </Link>
                  <p className="text-gray-600 mb-1">Rs {(item.price || 0).toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mb-4">
                    {item.brand || 'N/A'} • {item.color || 'N/A'}
                  </p>
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => handleAddToCart(item._id)}
                      disabled={
                        cartItems.some((cartItem) => cartItem.product?._id === item._id) ||
                        (item.quantity ?? 0) <= 0
                      }
                      className={`flex items-center px-4 py-2 rounded-full transition-colors ${
                        cartItems.some((cartItem) => cartItem.product?._id === item._id)
                          ? 'bg-green-100 text-green-700'
                          : (item.quantity ?? 0) <= 0
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      <ShoppingCart size={20} className="mr-2" />
                      {cartItems.some((cartItem) => cartItem.product?._id === item._id)
                        ? 'Added'
                        : (item.quantity ?? 0) <= 0
                        ? 'Out of Stock'
                        : 'Add to Cart'}
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item._id)}
                      className="text-red-500 hover:text-red-700 p-2 flex items-center"
                    >
                      <Trash2 size={20} className="mr-1" />
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;