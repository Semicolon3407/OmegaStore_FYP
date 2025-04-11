import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const CouponContext = createContext();

export const CouponProvider = ({ children }) => {
  const [coupons, setCoupons] = useState([]);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState(null);
  const navigate = useNavigate();

  const fetchCoupons = useCallback(async () => {
    try {
      setCouponLoading(true);
      setCouponError(null);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
        setCoupons([]);
        toast.info('Please login to view your coupons');
        navigate('/sign-in');
        return;
      }

      const { data } = await axios.get('http://localhost:5001/api/coupon', {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filter coupons: either user-specific (coupon.user._id matches userId) or general (coupon.user is null), and not expired
      const validCoupons = data.filter(
        (coupon) =>
          (coupon.user?._id === userId || coupon.user === null) &&
          new Date(coupon.expiry) >= new Date()
      );
      setCoupons(validCoupons);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch coupons';
      setCouponError(errorMsg);
      if (error.response?.status === 401) {
        toast.info('Session expired, please login');
        navigate('/sign-in');
      }
    } finally {
      setCouponLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const value = {
    coupons,
    couponLoading,
    couponError,
    fetchCoupons,
  };

  return <CouponContext.Provider value={value}>{children}</CouponContext.Provider>;
};

export const useCoupon = () => {
  const context = useContext(CouponContext);
  if (!context) throw new Error('useCoupon must be used within a CouponProvider');
  return context;
};