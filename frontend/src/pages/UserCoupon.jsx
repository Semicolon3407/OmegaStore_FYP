import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tag } from 'lucide-react';
import { useCoupon } from '../Context/couponContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

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
      <div className="bg-gray-100 min-h-screen pt-40 lg:pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading coupons...</p>
        </div>
      </div>
    );
  }

  if (couponError) {
    return (
      <div className="bg-gray-100 min-h-screen pt-40 lg:pt-32 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Error</h2>
          <p className="text-red-600 mb-6">{couponError}</p>
          <button
            onClick={fetchCoupons}
            className="bg-blue-900 text-white px-6 py-3 rounded-full hover:bg-blue-800 transition-all duration-300 shadow-md inline-block"
          >
            Try Again
          </button>
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
            Your Available Coupons
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Discover discounts tailored for you! Apply these at checkout to save on your next purchase.
          </p>
        </motion.div>

        {coupons.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-200"
          >
            <Tag size={80} className="mx-auto mb-6 text-gray-300" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 tracking-tight">
              No Coupons Available
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
              It looks like there are no active coupons for you right now. Keep shopping—new offers may appear soon!
            </p>
            <a
              href="/products"
              className="bg-blue-900 text-white px-6 py-3 rounded-full hover:bg-blue-800 transition-all duration-300 shadow-md inline-block"
            >
              Continue Shopping
            </a>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon) => (
              <motion.div
                key={coupon._id}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center mb-4">
                  <Tag size={24} className="text-blue-900 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">{coupon.name}</h2>
                </div>
                <p className="text-green-600 text-lg font-bold mb-2">
                  {coupon.discount}% OFF
                </p>
                <p className="text-gray-600 mb-2">
                  Expires: {new Date(coupon.expiry).toLocaleDateString()}
                </p>
                <p className="text-gray-600 mb-4">
                  {coupon.user ? 'Exclusive to you!' : 'Available for all users'}
                </p>
                <p className="text-gray-600 mb-4">
                  Use code <span className="font-bold">{coupon.name}</span> at checkout
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(coupon.name);
                    toast.success(`Coupon code "${coupon.name}" copied to clipboard!`);
                  }}
                  className="bg-blue-900 text-white px-4 py-2 rounded-md hover:bg-blue-800 transition-all duration-300 w-full"
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