import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, ShoppingBag, Plus, Minus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../Context/cartContext';

const Cart = () => {
  const { cartItems, fetchCart, updateCartItem, removeFromCart, emptyCart, cartLoading, cartError } = useCart();
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCart = async () => {
      try {
        await fetchCart();
      } catch (error) {
        console.error('Error loading cart:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCart();
  }, [fetchCart]);

  const getProductId = (item) => {
    return item.product?._id || item._id;
  };

  const handleUpdateQuantity = async (item, change) => {
    if (isUpdating) return;
    
    const productId = getProductId(item);
    if (!productId) {
      toast.error('Invalid product');
      return;
    }

    try {
      setIsUpdating(true);
      const newCount = Math.max(1, item.count + change);
      
      // Don't update if trying to reduce below 1
      if (item.count <= 1 && change < 0) {
        return;
      }
      
      const success = await updateCartItem(productId, newCount);
      if (!success) {
        toast.error('Failed to update quantity');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Something went wrong');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveFromCart = async (item) => {
    if (isUpdating) return;
    
    const productId = getProductId(item);
    if (!productId) {
      toast.error('Invalid product');
      return;
    }

    try {
      setIsUpdating(true);
      const success = await removeFromCart(productId);
      if (success) {
        toast.success('Item removed from cart');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    } finally {
      setIsUpdating(false);
    }
  };

  const total = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.count || 0), 0);

  if (loading || cartLoading) {
    return (
      <div className="bg-gray-100 min-h-screen pt-40 lg:pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (cartError) {
    return (
      <div className="bg-gray-100 min-h-screen pt-40 lg:pt-32 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cart Error</h2>
          <p className="text-red-600 mb-6">{cartError}</p>
          <Link
            to="/products"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md inline-block"
          >
            Continue Shopping
          </Link>
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
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Your Cart
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Review your selected items before checkout
          </p>
        </motion.div>

        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center py-16 bg-white rounded-2xl shadow-lg"
          >
            <ShoppingBag size={80} className="mx-auto mb-6 text-gray-300" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
              Add some products to your cart to get started!
            </p>
            <Link
              to="/products"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md inline-block"
            >
              Continue Shopping
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'} in Cart
              </h2>
              <button
                onClick={emptyCart}
                className="text-red-500 hover:text-red-700 flex items-center transition-colors duration-300"
                disabled={isUpdating}
              >
                <Trash2 size={20} className="mr-2" />
                Empty Cart
              </button>
            </div>

            {cartItems.map((item) => (
              <motion.div
                key={getProductId(item)}
                className="flex items-center justify-between border-b border-gray-200/50 py-6 last:border-b-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center">
                  <Link to={`/products/${getProductId(item)}`}>
                    <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center mr-6">
                      <img
                        src={item.product?.images?.[0] || '/placeholder.jpg'}
                        alt={item.product?.title || 'Product'}
                        className="w-full h-full object-contain p-2"
                      />
                    </div>
                  </Link>
                  <div>
                    <Link to={`/products/${getProductId(item)}`}>
                      <h2 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-300">
                        {item.product?.title || 'Unknown Product'}
                      </h2>
                    </Link>
                    <p className="text-gray-600 text-sm">Rs {(item.price || 0).toLocaleString()}</p>
                    <p className="text-gray-500 text-sm">Color: {item.color || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex border border-gray-200 rounded-full bg-gray-50">
                    <button
                      onClick={() => handleUpdateQuantity(item, -1)}
                      className={`w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors duration-300 ${
                        item.count <= 1 || isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={item.count <= 1 || isUpdating}
                    >
                      <Minus size={18} />
                    </button>
                    <span className="w-10 h-10 flex items-center justify-center text-gray-800 font-medium">
                      {item.count || 0}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item, 1)}
                      className={`w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors duration-300 ${
                        isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={isUpdating}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemoveFromCart(item)}
                    className={`text-red-500 hover:text-red-700 p-2 transition-colors duration-300 ${
                      isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={isUpdating}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </motion.div>
            ))}

            <div className="mt-8 flex justify-between items-center">
              <p className="text-2xl font-bold text-gray-900">Total: Rs {total.toLocaleString()}</p>
              <Link
                to="/checkout"
                className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full flex items-center hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md ${
                  isUpdating ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <ShoppingBag size={20} className="mr-2" />
                Proceed to Checkout
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Cart;