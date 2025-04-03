import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const CompareContext = createContext();

export const CompareProvider = ({ children }) => {
  const [compareItems, setCompareItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchCompare = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      if (!token) {
        console.log("No token found, setting empty compare list");
        setCompareItems([]);
        return;
      }

      const { data } = await axios.get('http://localhost:5001/api/user/compare', {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Compare API response:", data);
      setCompareItems(data.compare || []);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      console.error("Compare fetch error:", {
        status: error.response?.status,
        message: errorMsg,
        fullError: error.response || error,
      });
      setError(errorMsg);
      if (error.response?.status === 401) {
        toast.info('Session expired, please login');
        navigate('/sign-in');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const addToCompare = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.info('Please login to add items to compare');
        navigate('/sign-in');
        return false;
      }

      // Extract the ID if a product object was passed instead of an ID string
      const actualProductId = typeof productId === 'object' ? productId._id : productId;
      
      if (!actualProductId) {
        console.error("Invalid product ID:", productId);
        toast.error('Invalid product format');
        return false;
      }

      const { data } = await axios.put(
        'http://localhost:5001/api/user/compare',
        { productId: actualProductId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Add to compare response:", data);
      setCompareItems(data.compare || []);
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

      // Extract the ID if a product object was passed instead of an ID string
      const actualProductId = typeof productId === 'object' ? productId._id : productId;
      
      if (!actualProductId) {
        console.error("Invalid product ID:", productId);
        toast.error('Invalid product format');
        return false;
      }

      const { data } = await axios.delete(`http://localhost:5001/api/user/compare/${actualProductId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCompareItems(data.compare || []);
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

      const { data } = await axios.delete('http://localhost:5001/api/user/compare/clear', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCompareItems(data.compare || []);
      toast.success('Compare list cleared');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to clear compare list');
      if (error.response?.status === 401) navigate('/sign-in');
      return false;
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