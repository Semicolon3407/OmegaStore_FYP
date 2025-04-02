import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState(null);
  const navigate = useNavigate();

  const fetchCart = useCallback(async () => {
    try {
      setCartLoading(true);
      setCartError(null);
      const token = localStorage.getItem('token');
  
      if (!token) {
        console.log("No token found, setting empty cart");
        setCartItems([]);
        return;
      }
  
      const { data } = await axios.get('http://localhost:5001/api/user/user-cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      console.log("Cart API response:", data);
  
      // Handle if the cart response doesn't have products
      if (data && data.products) {
        setCartItems(data.products);
      } else {
        console.error('Unexpected cart data:', data);
        setCartItems([]);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      console.error("Cart fetch error:", {
        status: error.response?.status,
        message: errorMsg,
        fullError: error.response || error,
      });
      setCartError(errorMsg);
      if (error.response?.status === 401) {
        toast.info('Session expired, please login');
        navigate('/sign-in');
      }
    } finally {
      setCartLoading(false);
    }
  }, [navigate]);
  

  
  

  const addToCart = async (productId, quantity = 1, color = '') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.info('Please login to add items to cart');
        navigate('/sign-in');
        return false;
      }

      const { data } = await axios.post(
        'http://localhost:5001/api/user/cart',
        { productId, quantity, color },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCartItems(data.products || []);
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

      const { data } = await axios.delete(`http://localhost:5001/api/user/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCartItems(data.products || []);
      toast.success('Item removed from cart');
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
        'http://localhost:5001/api/user/cart',
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCartItems(data.products || []);
      toast.success('Cart updated');
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

      await axios.delete('http://localhost:5001/api/user/empty-cart', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCartItems([]);
      toast.success('Cart emptied successfully');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to empty cart');
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
    fetchCart,
    addToCart,
    removeFromCart,
    updateCartItem,
    emptyCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};