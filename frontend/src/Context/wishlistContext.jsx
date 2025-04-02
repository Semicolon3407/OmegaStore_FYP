import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setWishlistItems([]);
        return;
      }

      const { data } = await axios.get('http://localhost:5001/api/user/wishlist', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setWishlistItems(data.wishlist || []);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch wishlist');
      if (error.response?.status === 401) {
        toast.info('Session expired, please login');
        navigate('/sign-in');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const addToWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.info('Please login to add items to wishlist');
        navigate('/sign-in');
        return false;
      }

      const { data } = await axios.put(
        'http://localhost:5001/api/user/wishlist',
        { prodId: productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setWishlistItems(data.wishlist || []);
      toast.success('Added to wishlist!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to wishlist');
      if (error.response?.status === 401) navigate('/sign-in');
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.info('Please login to modify wishlist');
        navigate('/sign-in');
        return false;
      }

      const { data } = await axios.delete(`http://localhost:5001/api/user/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setWishlistItems(data.wishlist || []);
      toast.success('Removed from wishlist');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove from wishlist');
      if (error.response?.status === 401) navigate('/sign-in');
      return false;
    }
  };

  useEffect(() => {
    fetchWishlist();
    
    const handleAuthChange = () => {
      if (!localStorage.getItem('token')) {
        setWishlistItems([]);
      } else {
        fetchWishlist();
      }
    };
    
    window.addEventListener('storage', handleAuthChange);
    return () => window.removeEventListener('storage', handleAuthChange);
  }, [fetchWishlist]);

  const value = {
    wishlistItems,
    loading,
    error,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};