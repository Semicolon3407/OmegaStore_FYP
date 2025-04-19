import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';

const CompareContext = createContext();
const BASE_URL = 'http://localhost:5001';

export const CompareProvider = ({ children }) => {
  const [compareItems, setCompareItems] = useState([]);
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

  const fetchCompare = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      if (!token) {
        setCompareItems([]);
        if (!unauthenticatedRoutes.includes(location.pathname)) {
          console.log("No token found, setting empty compare list");
        }
        return;
      }

      const compareListCleared = localStorage.getItem('compareListCleared') === 'true';
      if (compareListCleared) {
        setCompareItems([]);
        return;
      }

      const { data } = await axios.get(`${BASE_URL}/api/user/compare`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Compare API response:", data);
      const mappedItems = (data.compare || []).map(mapImageUrls);
      setCompareItems(mappedItems);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch compare list';
      console.error("Compare fetch error:", {
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

  const addToCompare = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.info('Please login to add items to compare');
        navigate('/sign-in');
        return false;
      }

      localStorage.removeItem('compareListCleared');

      const actualProductId = typeof productId === 'object' ? productId._id : productId;
      if (!actualProductId) {
        console.error("Invalid product ID:", productId);
        toast.error('Invalid product format');
        return false;
      }

      const { data } = await axios.put(
        `${BASE_URL}/api/user/compare`,
        { productId: actualProductId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Add to compare response:", data);
      const mappedItems = (data.compare || []).map(mapImageUrls);
      setCompareItems(mappedItems);
      toast.success('Added to compare!');
      return true;
    } catch (error) {
      console.error("Add to compare error:", error.response || error);
      toast.error(error.response?.data?.message || 'Failed to add to compare');
      if (error.response?.status === 401) navigate('/sign-in');
      return false;
    }
  };

  const removeFromCompare = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.info('Please login to modify compare list');
        navigate('/sign-in');
        return false;
      }

      const actualProductId = typeof productId === 'object' ? productId._id : productId;
      if (!actualProductId) {
        console.error("Invalid product ID:", productId);
        toast.error('Invalid product format');
        return false;
      }

      const { data } = await axios.delete(`${BASE_URL}/api/user/compare/${actualProductId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const mappedItems = (data.compare || []).map(mapImageUrls);
      setCompareItems(mappedItems);
      toast.success('Removed from compare');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove from compare');
      if (error.response?.status === 401) navigate('/sign-in');
      return false;
    }
  };

  const clearCompare = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.info('Please login to clear compare list');
        navigate('/sign-in');
        return false;
      }

      setLoading(true);
      
      try {
        await axios.delete(`${BASE_URL}/api/user/compare/clear`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (apiError) {
        console.error('API error when clearing compare list:', apiError);
      }
      
      setCompareItems([]);
      
      localStorage.setItem('compareListCleared', 'true');
      
      toast.success('Compare list cleared successfully');
      return true;
    } catch (error) {
      console.error('Clear compare error:', error);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/sign-in');
      } else {
        toast.error('Failed to clear compare list');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompare();

    const handleAuthChange = () => {
      if (!localStorage.getItem('token')) {
        setCompareItems([]);
      } else {
        fetchCompare();
      }
    };

    window.addEventListener('storage', handleAuthChange);
    return () => window.removeEventListener('storage', handleAuthChange);
  }, [fetchCompare]);

  const value = {
    compareItems,
    loading,
    error,
    fetchCompare,
    addToCompare,
    removeFromCompare,
    clearCompare,
  };

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) throw new Error('useCompare must be used within a CompareProvider');
  return context;
};