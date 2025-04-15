import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';

const CartContext = createContext();
const BASE_URL = 'http://localhost:5001';

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState(null);
  const [totalAfterDiscount, setTotalAfterDiscount] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const unauthenticatedRoutes = ["/sign-in", "/forgot-password", "/account/create", "/reset-password"];

  const mapImageUrls = (product) => {
    if (!product?.images) return product;
    return {
      ...product,
      images: product.images.map((img) => ({
        ...img,
        url: img.url.startsWith('http') ? img.url : `${BASE_URL}${img.url}`,
      })),
    };
  };

  const fetchCart = useCallback(async () => {
    try {
      setCartLoading(true);
      setCartError(null);
      const token = localStorage.getItem('token');

      if (!token) {
        setCartItems([]);
        setTotalAfterDiscount(null);
        if (!unauthenticatedRoutes.includes(location.pathname)) {
          console.log("No token found, setting empty cart");
        }
        return;
      }

      const { data } = await axios.get(`${BASE_URL}/api/user/user-cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Cart API response:", data);

      if (data && data.products) {
        const mappedItems = data.products.map((item) => ({
          ...item,
          product: item.product ? mapImageUrls(item.product) : item.product,
          image: item.image ? (item.image.startsWith('http') ? item.image : `${BASE_URL}${item.image}`) : null,
        }));
        setCartItems(mappedItems);
        setTotalAfterDiscount(data.totalAfterDiscount || null);
      } else {
        setCartItems([]);
        setTotalAfterDiscount(null);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch cart';
      setCartError(errorMsg);
      if (error.response?.status === 401) {
        toast.info('Session expired, please login');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/sign-in');
      }
    } finally {
      setCartLoading(false);
    }
  }, [navigate, location.pathname]);

  const addToCart = async (productId, quantity = 1, color = '') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.info('Please login to add items to cart');
        navigate('/sign-in');
        return false;
      }

      const { data } = await axios.post(
        `${BASE_URL}/api/user/cart`,
        { productId, quantity, color },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const mappedItems = data.products.map((item) => ({
        ...item,
        product: item.product ? mapImageUrls(item.product) : item.product,
        image: item.image ? (item.image.startsWith('http') ? item.image : `${BASE_URL}${item.image}`) : null,
      }));
      setCartItems(mappedItems);
      setTotalAfterDiscount(data.totalAfterDiscount || null);
      toast.success('Item added to cart!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add item to cart');
      if (error.response?.status === 401) navigate('/sign-in');
      return false;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.info('Please login to modify cart');
        navigate('/sign-in');
        return false;
      }

      const { data } = await axios.delete(`${BASE_URL}/api/user/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const mappedItems = data.products.map((item) => ({
        ...item,
        product: item.product ? mapImageUrls(item.product) : item.product,
        image: item.image ? (item.image.startsWith('http') ? item.image : `${BASE_URL}${item.image}`) : null,
      }));
      setCartItems(mappedItems);
      setTotalAfterDiscount(data.totalAfterDiscount || null);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove item');
      if (error.response?.status === 401) navigate('/sign-in');
      return false;
    }
  };

  const updateCartItem = async (productId, quantity) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.info('Please login to modify cart');
        navigate('/sign-in');
        return false;
      }

      const { data } = await axios.post(
        `${BASE_URL}/api/user/cart`,
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const mappedItems = data.products.map((item) => ({
        ...item,
        product: item.product ? mapImageUrls(item.product) : item.product,
        image: item.image ? (item.image.startsWith('http') ? item.image : `${BASE_URL}${item.image}`) : null,
      }));
      setCartItems(mappedItems);
      setTotalAfterDiscount(data.totalAfterDiscount || null);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update quantity');
      if (error.response?.status === 401) navigate('/sign-in');
      return false;
    }
  };

  const emptyCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.info('Please login to modify cart');
        navigate('/sign-in');
        return false;
      }

      await axios.delete(`${BASE_URL}/api/user/empty-cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCartItems([]);
      setTotalAfterDiscount(null);
      toast.success('Cart emptied successfully');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to empty cart');
      if (error.response?.status === 401) navigate('/sign-in');
      return false;
    }
  };

  const applyCoupon = async (coupon) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.info('Please login to apply coupon');
        navigate('/sign-in');
        return false;
      }

      const { data } = await axios.post(
        `${BASE_URL}/api/user/cart/applycoupon`,
        { coupon },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTotalAfterDiscount(data.totalAfterDiscount);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply coupon');
      if (error.response?.status === 401) navigate('/sign-in');
      return false;
    }
  };

  const cartTotal = cartItems.reduce(
    (total, item) => total + (item.price || 0) * (item.count || 0),
    0
  );

  const itemCount = cartItems.reduce((count, item) => count + (item.count || 0), 0);

  useEffect(() => {
    fetchCart();

    const handleAuthChange = () => {
      if (!localStorage.getItem('token')) {
        setCartItems([]);
        setTotalAfterDiscount(null);
      } else {
        fetchCart();
      }
    };

    window.addEventListener('storage', handleAuthChange);
    return () => window.removeEventListener('storage', handleAuthChange);
  }, [fetchCart]);

  const value = {
    cartItems,
    cartTotal,
    itemCount,
    cartLoading,
    cartError,
    totalAfterDiscount,
    fetchCart,
    addToCart,
    removeFromCart,
    updateCartItem,
    emptyCart,
    applyCoupon,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};