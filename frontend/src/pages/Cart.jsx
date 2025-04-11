import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, ShoppingBag, Plus, Minus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../Context/cartContext';
import { useCoupon } from '../Context/couponContext';
import axios from 'axios';

const Cart = () => {
  const {
    cartItems,
    fetchCart,
    updateCartItem,
    removeFromCart,
    emptyCart,
    cartLoading,
    cartError,
    cartTotal,
    totalAfterDiscount,
  } = useCart();
  const { coupons, couponLoading } = useCoupon();
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
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

      if (item.count <= 1 && change < 0) {
        return;
      }

      const success = await updateCartItem(productId, newCount);
      if (!success) {
        toast.error('Failed to update quantity');
      } else {
        setAppliedCoupon(null); // Reset coupon on cart change
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
        setAppliedCoupon(null); // Reset coupon on cart change
      }
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) {
      toast.error('Please enter a coupon code');
      return;
    }

    try {
      setIsUpdating(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5001/api/user/cart/applycoupon',
        { coupon: couponCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAppliedCoupon({
        code: couponCode,
        discount: response.data.discountApplied,
      });
      toast.success(`Coupon "${couponCode}" applied successfully!`);
      setCouponCode('');
    } catch (error) {
      console.error('Error applying coupon:', error);
      toast.error(error.response?.data?.message || 'Failed to apply coupon');
    } finally {
      setIsUpdating(false);
    }
  };

  const total = totalAfterDiscount || cartTotal;

  if (loading || cartLoading || couponLoading) {
    return (
      <div className="bg-gray-100 min-h-screen pt-40 lg:pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (cartError) {
    return (
      <div className="bg-gray-100 min-h-screen pt-40 lg:pt-32 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Cart Error</h2>
          <p className="text-red-600 mb-6">{cartError}</p>
          <Link
            to="/products"
            className="bg-blue-900 text-white px-6 py-3 rounded-full hover:bg-blue-800 transition-all duration-300 shadow-md inline-block"
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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
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
            className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-200"
          >
            <ShoppingBag size={80} className="mx-auto mb-6 text-gray-300" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 tracking-tight">
              Your Cart is Empty
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
              Add some products to your cart to get started!
            </p>
            <Link
              to="/products"
              className="bg-blue-900 text-white px-6 py-3 rounded-full hover:bg-blue-800 transition-all duration-300 shadow-md inline-block"
            >
              Continue Shopping
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-8 border border-gray-200"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
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
                className="flex items-center justify-between border-b border-gray-200 py-6 last:border-b-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center">
                  <Link to={`/products/${getProductId(item)}`}>
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mr-6">
                      <img
                        src={item.product?.images?.[0] || '/placeholder.jpg'}
                        alt={item.product?.title || 'Product'}
                        className="w-full h-full object-contain p-2"
                      />
                    </div>
                  </Link>
                  <div>
                    <Link to={`/products/${getProductId(item)}`}>
                      <h2 className="text-lg font-semibold text-gray-900 hover:text-blue-500 transition-colors duration-300">
                        {item.product?.title || 'Unknown Product'}
                      </h2>
                    </Link>
                    <p className="text-blue-900 text-sm font-bold">
                      Rs {(item.price || 0).toLocaleString()}
                    </p>
                    <p className="text-gray-600 text-sm">Color: {item.color || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex border border-gray-200 rounded-full bg-gray-100">
                    <button
                      onClick={() => handleUpdateQuantity(item, -1)}
                      className={`w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors duration-300 ${
                        item.count <= 1 || isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={item.count <= 1 || isUpdating}
                    >
                      <Minus size={18} />
                    </button>
                    <span className="w-10 h-10 flex items-center justify-center text-gray-900 font-medium">
                      {item.count || 0}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item, 1)}
                      className={`w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors duration-300 ${
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

            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Apply Coupon</h3>
                <Link to="/coupons" className="text-blue-500 hover:underline">
                  View Available Coupons
                </Link>
              </div>
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="w-full p-2 border rounded-md"
                  disabled={isUpdating}
                />
                <button
                  onClick={handleApplyCoupon}
                  className={`bg-blue-900 text-white px-4 py-2 rounded-md hover:bg-blue-800 transition-colors ${
                    isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={isUpdating}
                >
                  Apply
                </button>
              </div>
              {appliedCoupon && (
                <p className="text-green-600 mb-4">
                  Coupon "{appliedCoupon.code}" applied! {appliedCoupon.discount}% off
                </p>
              )}
              <div className="flex justify-between items-center mb-4">
                <p className="text-lg font-semibold text-gray-900">Subtotal:</p>
                <p className="text-lg font-semibold text-gray-900">Rs {cartTotal.toLocaleString()}</p>
              </div>
              {totalAfterDiscount && totalAfterDiscount != cartTotal && (
                <div className="flex justify-between items-center mb-4">
                  <p className="text-lg font-semibold text-gray-900">Total After Discount:</p>
                  <p className="text-lg font-semibold text-green-600">Rs {totalAfterDiscount.toLocaleString()}</p>
                </div>
              )}
              <div className="flex justify-end">
                <Link
                  to="/checkout"
                  state={{ couponCode: appliedCoupon?.code }}
                  className={`bg-blue-900 text-white px-6 py-3 rounded-full flex items-center hover:bg-blue-800 transition-all duration-300 shadow-md ${
                    isUpdating ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  <ShoppingBag size={20} className="mr-2" />
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Cart;