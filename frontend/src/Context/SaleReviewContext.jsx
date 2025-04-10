// src/Context/SaleReviewContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const SaleReviewContext = createContext();

export const SaleReviewProvider = ({ children }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = 'http://localhost:5001/api';

  const fetchReviews = useCallback(async (saleProductId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/sale-products/${saleProductId}`);
      setReviews(response.data.saleProduct.ratings || []);
    } catch (error) {
      console.error('Error fetching sale product reviews:', error);
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  }, []);

  const addReview = async (saleProductId, star, comment) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.info('Please sign in to submit a review');
      return false;
    }

    setLoading(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/sale-products/slaeitem/rating`,
        { prodId: saleProductId, star, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedSaleProduct = response.data.saleProduct;
      setReviews(updatedSaleProduct.ratings || []);
      toast.success(response.data.message || 'Review submitted successfully!');
      return true;
    } catch (error) {
      console.error('Sale review submission error:', {
        status: error.response?.status,
        message: error.response?.data?.message,
      });
      toast.error(error.response?.data?.message || 'Failed to submit review');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <SaleReviewContext.Provider value={{ reviews, loading, fetchReviews, addReview }}>
      {children}
    </SaleReviewContext.Provider>
  );
};

export const useSaleReview = () => {
  const context = useContext(SaleReviewContext);
  if (!context) {
    throw new Error('useSaleReview must be used within a SaleReviewProvider');
  }
  return context;
};

export default SaleReviewProvider;