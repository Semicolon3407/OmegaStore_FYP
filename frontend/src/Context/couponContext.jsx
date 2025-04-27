import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';

const CouponContext = createContext();

export const CouponProvider = ({ children }) => {
  const [coupons, setCoupons] = useState([]);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const unauthenticatedRoutes = ["/sign-in", "/forgot-password", "/account/create", "/reset-password"];
  const publicRoutes = [...unauthenticatedRoutes, "/coupons"]; // Add public routes here

  const fetchCoupons = useCallback(async () => {
    console.log('fetchCoupons called', { pathname: location.pathname, token: localStorage.getItem('token'), userId: localStorage.getItem('userId') });
    try {
      setCouponLoading(true);
      setCouponError(null);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
        setCoupons([]);
        if (!publicRoutes.includes(location.pathname)) {
          toast.info('Please login to view your coupons');
          navigate('/sign-in');
        }
        return;
      }

      const { data } = await axios.get('http://localhost:5001/api/coupon', {
        headers: { Authorization: `Bearer ${token}` },
      });

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
        if (!publicRoutes.includes(location.pathname)) {
          toast.info('Session expired, please login');
          navigate('/sign-in');
        }
      }
    } finally {
      setCouponLoading(false);
    }
  }, [navigate, location.pathname]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (token && userId) {
      fetchCoupons();
    } else {
      setCoupons([]);
    }

    const handleAuthChange = (event) => {
      if (event.key === 'token' || event.key === 'userId') {
        const newToken = localStorage.getItem('token');
        const newUserId = localStorage.getItem('userId');
        if (!newToken || !newUserId) {
          setCoupons([]);
        } else {
          fetchCoupons();
        }
      }
    };

    window.addEventListener('storage', handleAuthChange);
    return () => window.removeEventListener('storage', handleAuthChange);
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