import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, ShoppingBag, Plus, Minus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../Context/cartContext';

const Cart = () => {
  const { cartItems, fetchCart, updateCartItem, removeFromCart, emptyCart, cartLoading, cartError } =
    useCart();
  const [loading, setLoading] = useState(true);
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

  const handleUpdateQuantity = async (productId, change) => {
    const item = cartItems.find((item) => item.product?._id === productId);
    if (!item) return;

    const newCount = Math.max(1, item.count + change);
    const success = await updateCartItem(productId, newCount);
    if (!success) {
      toast.error('Failed to update quantity');
    }
  };

  const total = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.count || 0), 0);

  if (loading || cartLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (cartError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{cartError}</p>
          <Link
            to="/products"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-8">
          <ShoppingBag size={64} className="mx-auto mb-4 text-gray-400" />
          <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
          <Link
            to="/products"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'} in Cart
            </h2>
            <button
              onClick={emptyCart}
              className="text-red-600 hover:text-red-800 flex items-center"
            >
              <Trash2 size={18} className="mr-1" />
              Empty Cart
            </button>
          </div>

          {cartItems.map((item) => (
            <motion.div
              key={item.product?._id || item._id}
              className="flex items-center justify-between border-b py-4 last:border-b-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center">
                <img
                  src={item.product?.images?.[0] || '/placeholder.jpg'}
                  alt={item.product?.title || 'Product'}
                  className="w-16 h-16 object-cover rounded-md mr-4"
                />
                <div>
                  <h2 className="text-lg font-semibold">{item.product?.title || 'Product'}</h2>
                  <p className="text-gray-600">Rs {(item.price || 0).toFixed(2)}</p>
                  <p className="text-gray-500">Color: {item.color || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => handleUpdateQuantity(item.product?._id, -1)}
                  className="text-gray-500 hover:text-gray-700"
                  disabled={item.count <= 1}
                >
                  <Minus size={20} />
                </button>
                <span className="mx-2 w-8 text-center">{item.count || 0}</span>
                <button
                  onClick={() => handleUpdateQuantity(item.product?._id, 1)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Plus size={20} />
                </button>
                <button
                  onClick={() => removeFromCart(item.product?._id)}
                  className="ml-4 text-red-500 hover:text-red-700"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </motion.div>
          ))}

          <div className="mt-6 flex justify-between items-center">
            <p className="text-xl font-semibold">Total: Rs {total.toFixed(2)}</p>
            <Link
              to="/checkout"
              className="bg-blue-600 text-white px-6 py-3 rounded-md flex items-center hover:bg-blue-700"
            >
              <ShoppingBag className="mr-2" size={20} />
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;