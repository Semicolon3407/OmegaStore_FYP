import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';

const WishlistContext = createContext();
const BASE_URL = 'http://localhost:5001';

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const unauthenticatedRoutes = ["/sign-in", "/forgot-password", "/account/create", "/reset-password"];

  const mapImageUrls = (item) => {
    if (!item?.images) return item;
    return {
      ...item,
      images: item.images.map((img) => ({
        ...img,
        url: img.url.startsWith('http') ? img.url : `${BASE_URL}${img.url}`,
      })),
    };
  };

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      if (!token) {
        setWishlistItems([]);
        if (!unauthenticatedRoutes.includes(location.pathname)) {
          console.log("No token found, setting empty wishlist");
        }
        return;
      }

      const { data } = await axios.get(`${BASE_URL}/api/user/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Wishlist API response:", data);
      const mappedItems = (data.wishlist || []).map(mapImageUrls);
      setWishlistItems(mappedItems);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch wishlist';
      console.error("Wishlist fetch error:", {
        status: error.response?.status,
        message: errorMsg,
        fullError: error.response || error,
      });
      setError(errorMsg);
      if (error.response?.status === 401) {
        toast.info('Session expired, please login');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/sign-in');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, location.pathname]);

  const addToWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.info('Please login to add items to wishlist');
        navigate('/sign-in');
        return false;
      }

      const actualProductId = typeof productId === 'object' ? productId._id : productId;
      if (!actualProductId) {
        console.error("Invalid product ID:", productId);
        toast.error('Invalid product format');
        return false;
      }

      const { data } = await axios.put(
        `${BASE_URL}/api/user/wishlist`,
        { productId: actualProductId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Add to wishlist response:", data);
      const mappedItems = (data.wishlist || []).map(mapImageUrls);
      setWishlistItems(mappedItems);
      toast.success('Added to wishlist!');
      return true;
    } catch (error) {
      console.error("Add to wishlist error:", error.response || error);
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

      const actualProductId = typeof productId === 'object' ? productId._id : productId;
      if (!actualProductId) {
        console.error("Invalid product ID:", productId);
        toast.error('Invalid product format');
        return false;
      }

      const { data } = await axios.delete(`${BASE_URL}/api/user/wishlist/${actualProductId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const mappedItems = (data.wishlist || []).map(mapImageUrls);
      setWishlistItems(mappedItems);
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