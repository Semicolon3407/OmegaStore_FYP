import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, ShoppingBag, Plus, Minus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../Context/cartContext';
import { useCoupon } from '../Context/couponContext';

const BASE_URL = 'http://localhost:5001';

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

  const getImageUrl = (item) => {
    const imageUrl = item.product?.images?.[0]?.url || item.image;
    if (!imageUrl) return '/placeholder.jpg';
    return imageUrl.startsWith('http') ? imageUrl : `${BASE_URL}${imageUrl}`;
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

      // Don't allow decrease below 1
      if (newCount < 1) {
        return;
      }

      // Check stock availability
      if (item.product && item.product.quantity < newCount) {
        toast.error('Cannot exceed available stock');
        return;
      }

      const success = await updateCartItem(productId, newCount);
      if (success) {
        await fetchCart(); // Refresh cart after successful update
        toast.success('Quantity updated successfully');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error(error.response?.data?.message || 'Failed to update quantity');
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
        await fetchCart(); // Refresh cart after successful removal
        toast.success('Product removed from cart');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error(error.response?.data?.message || 'Failed to remove item');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEmptyCart = async () => {
    if (isUpdating) return;

    if (!window.confirm('Are you sure you want to empty your cart?')) {
      return;
    }

    try {
      setIsUpdating(true);
      const success = await emptyCart();
      if (success) {
        await fetchCart(); // Refresh cart after emptying
        toast.success('Cart emptied successfully');
      }
    } catch (error) {
      console.error('Error emptying cart:', error);
      toast.error(error.response?.data?.message || 'Failed to empty cart');
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
        `${BASE_URL}/api/user/cart/applycoupon`,
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
      <div className="bg-gray-100 min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-blue-900"></div>
          <p className="mt-3 sm:mt-4 text-gray-600 text-base sm:text-lg">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (cartError) {
    return (
      <div className="bg-gray-100 min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 flex items-center justify-center">
        <div className="text-center max-w-md p-6 sm:p-8 bg-white rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-900 mb-3 sm:mb-4 tracking-tight">Cart Error</h2>
          <p className="text-red-600 mb-4 sm:mb-6 text-sm sm:text-base">{cartError}</p>
          <Link
            to="/products"
            className="bg-blue-900 text-white px-5 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-blue-500 transition-all duration-300 shadow-md inline-block text-sm sm:text-base"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-between items-center mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-semibold text-blue-900 tracking-tight">
            Shopping Cart
          </h1>
          {cartItems.length > 0 && (
            <button
              onClick={handleEmptyCart}
              className="text-red-500 hover:text-red-700 font-medium transition-colors duration-300 px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-red-500 hover:bg-red-50 text-sm sm:text-base"
              disabled={isUpdating}
            >
              Empty Cart
            </button>
          )}
        </motion.div>

        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center py-12 sm:py-16 bg-white rounded-xl shadow-lg border border-gray-200 max-w-md sm:max-w-lg mx-auto"
          >
            <ShoppingBag size={60} className="mx-auto mb-4 sm:mb-6 text-gray-300" />
            <h2 className="text-xl sm:text-2xl font-semibold text-blue-900 mb-3 sm:mb-4 tracking-tight">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base max-w-sm sm:max-w-md mx-auto leading-relaxed">
              Add some products to your cart to get started!
            </p>
            <Link
              to="/products"
              className="bg-blue-900 text-white px-5 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-blue-500 transition-all duration-300 shadow-md inline-block text-sm sm:text-base"
            >
              Continue Shopping
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-2"
            >
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-blue-900 mb-4 sm:mb-6 tracking-tight">
                  {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'} in Cart
                </h2>
                {cartItems.map((item) => (
                  <motion.div
                    key={getProductId(item)}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between border border-gray-200 rounded-lg p-4 sm:p-6 mb-4 last:mb-0"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center w-full sm:w-auto">
                      <Link to={`/products/${getProductId(item)}`}>
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mr-4 sm:mr-6 overflow-hidden">
                          <img
                            src={getImageUrl(item)}
                            alt={item.product?.title || 'Product'}
                            className="w-full h-full object-contain p-2"
                            onError={(e) => {
                              e.target.src = '/placeholder.jpg';
                            }}
                          />
                        </div>
                      </Link>
                      <div className="flex-1">
                        <Link to={`/products/${getProductId(item)}`}>
                          <h3 className="text-sm sm:text-lg font-semibold text-blue-900 hover:text-orange-500 transition-colors duration-300">
                            {item.product?.title || item.title || 'Unknown Product'}
                          </h3>
                        </Link>
                        <p className="text-blue-900 text-sm sm:text-base font-bold mt-1">
                          Rs {(item.price || 0).toLocaleString()}
                        </p>
                        <p className="text-gray-600 text-xs sm:text-sm mt-1">Color: {item.color || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4 mt-4 sm:mt-0 w-full sm:w-auto justify-between sm:justify-start">
                      <div className="flex border border-gray-200 rounded-full bg-gray-100">
                        <button
                          onClick={() => handleUpdateQuantity(item, -1)}
                          className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors duration-300 ${
                            item.count <= 1 || isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          disabled={item.count <= 1 || isUpdating}
                        >
                          <Minus size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <span className="w-10 h-8 sm:w-12 sm:h-10 flex items-center justify-center text-gray-900 font-medium text-sm sm:text-base">
                          {item.count || 0}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item, 1)}
                          className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors duration-300 ${
                            isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          disabled={isUpdating}
                        >
                          <Plus size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemoveFromCart(item)}
                        className={`text-red-500 hover:text-red-700 p-2 transition-colors duration-300 ${
                          isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={isUpdating}
                      >
                        <Trash2 size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 sticky top-24">
                <h2 className="text-lg sm:text-xl font-semibold text-blue-900 mb-4 sm:mb-6 tracking-tight">
                  Order Summary
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm sm:text-base font-semibold text-gray-900">Subtotal:</p>
                    <p className="text-sm sm:text-base font-semibold text-gray-900">Rs {cartTotal.toLocaleString()}</p>
                  </div>
                  {totalAfterDiscount && totalAfterDiscount !== cartTotal && (
                    <div className="flex justify-between items-center">
                      <p className="text-sm sm:text-base font-semibold text-gray-900">Total After Discount:</p>
                      <p className="text-sm sm:text-base font-semibold text-green-600">Rs {totalAfterDiscount.toLocaleString()}</p>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900">Apply Coupon</h3>
                      <Link to="/coupons" className="text-blue-900 hover:text-orange-500 text-xs sm:text-sm transition-colors duration-300">
                        View Available Coupons
                      </Link>
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                        className="w-full p-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isUpdating}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className={`bg-blue-900 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-blue-500 transition-colors duration-300 text-sm ${
                          isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={isUpdating}
                      >
                        Apply
                      </button>
                    </div>
                    {appliedCoupon && (
                      <p className="text-green-600 text-xs sm:text-sm mt-2">
                        Coupon "{appliedCoupon.code}" applied! {appliedCoupon.discount}% off
                      </p>
                    )}
                  </div>
                  <Link
                    to="/checkout"
                    state={{ couponCode: appliedCoupon?.code }}
                    className={`bg-blue-900 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full flex items-center justify-center hover:bg-blue-500 transition-all duration-300 shadow-md w-full text-sm sm:text-base ${
                      isUpdating ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    <ShoppingBag size={16} className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Proceed to Checkout
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;