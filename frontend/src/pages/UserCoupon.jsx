import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tag } from 'lucide-react';
import { useCoupon } from '../Context/couponContext';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';

const Coupons = () => {
  const { coupons, couponLoading, couponError, fetchCoupons } = useCoupon();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.info('Please login to view your coupons');
      navigate('/sign-in');
      return;
    }
    fetchCoupons();
  }, [fetchCoupons, navigate]);

  if (couponLoading) {
    return (
      <div className="bg-gray-100 min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-blue-900"></div>
          <p className="mt-3 sm:mt-4 text-gray-600 text-base sm:text-lg">Loading coupons...</p>
        </div>
      </div>
    );
  }

  if (couponError) {
    return (
      <div className="bg-gray-100 min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 flex items-center justify-center">
        <div className="text-center max-w-md p-6 sm:p-8 bg-white rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-900 mb-3 sm:mb-4 tracking-tight">Error</h2>
          <p className="text-red-600 mb-4 sm:mb-6 text-sm sm:text-base">{couponError}</p>
          <button
            onClick={fetchCoupons}
            className="bg-blue-900 text-white px-5 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-blue-500 transition-all duration-300 shadow-md inline-block text-sm sm:text-base"
          >
            Try Again
          </button>
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
          className="mb-6 sm:mb-8 flex justify-between items-center border-b border-gray-200 pb-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-900 tracking-tight">
              Your Available Coupons
            </h1>
            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-600 max-w-xl sm:max-w-2xl leading-relaxed">
              Discover discounts tailored for you! Apply these at checkout to save on your next purchase.
            </p>
          </div>
          <Link
            to="/products"
            className="text-blue-900 hover:text-orange-500 font-medium transition-colors duration-300 text-sm sm:text-base"
          >
            Continue Shopping
          </Link>
        </motion.div>

        {coupons.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center py-12 sm:py-16 bg-white rounded-xl shadow-lg border border-gray-200 max-w-md sm:max-w-lg mx-auto"
          >
            <Tag size={60} className="mx-auto mb-4 sm:mb-6 text-gray-300" />
            <h2 className="text-xl sm:text-2xl font-semibold text-blue-900 mb-3 sm:mb-4 tracking-tight">
              No Coupons Available
            </h2>
            <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base max-w-sm sm:max-w-md mx-auto leading-relaxed">
              It looks like there are no active coupons for you right now. Keep shopping—new offers may appear soon!
            </p>
            <Link
              to="/products"
              className="bg-blue-900 text-white px-5 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-blue-500 transition-all duration-300 shadow-md inline-block text-sm sm:text-base"
            >
              Continue Shopping
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {coupons.map((coupon, index) => (
              <motion.div
                key={coupon._id}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex items-center mb-3 sm:mb-4">
                  <Tag className="w-5 h-5 sm:w-6 sm:h-6 text-blue-900 mr-2 sm:mr-3" />
                  <h2 className="text-lg sm:text-xl font-semibold text-blue-900">{coupon.name}</h2>
                </div>
                <p className="text-green-600 text-lg sm:text-xl font-bold mb-2 sm:mb-3">
                  {coupon.discount}% OFF
                </p>
                <p className="text-gray-600 text-sm sm:text-base mb-2 sm:mb-3">
                  Expires: {new Date(coupon.expiry).toLocaleDateString()}
                </p>
                <p className="text-gray-600 text-sm sm:text-base mb-2 sm:mb-3">
                  {coupon.user ? 'Exclusive to you!' : 'Available for all users'}
                </p>
                <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
                  Use code <span className="font-bold text-blue-900">{coupon.name}</span> at checkout
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(coupon.name);
                    toast.success(`Coupon code "${coupon.name}" copied to clipboard!`);
                  }}
                  className="bg-blue-900 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-blue-500 transition-all duration-300 shadow-md w-full text-sm sm:text-base"
                >
                  Copy Code
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Coupons;