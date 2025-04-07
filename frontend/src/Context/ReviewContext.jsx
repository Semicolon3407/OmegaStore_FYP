// src/Context/ReviewContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ReviewContext = createContext();

export const ReviewProvider = ({ children }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = 'http://localhost:5001/api';

  const fetchReviews = useCallback(async (productId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/products/${productId}`);
      setReviews(response.data.product.ratings || []);
    } catch (error) {
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  }, []);

  const addReview = async (productId, star, comment) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.info('Please sign in to submit a review');
      return false;
    }

    setLoading(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/products/rating`,
        { prodId: productId, star, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedProduct = response.data.product;
      setReviews(updatedProduct.ratings || []);
      toast.success(response.data.message || 'Review submitted successfully!');
      return true;
    } catch (error) {
      console.error('Review submission error:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        headers: error.response?.headers,
      });
      toast.error(error.response?.data?.message || 'Failed to submit review');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReviewContext.Provider value={{ reviews, loading, fetchReviews, addReview }}>
      {children}
    </ReviewContext.Provider>
  );
};

export const useReview = () => {
  const context = useContext(ReviewContext);
  if (!context) {
    throw new Error('useReview must be used within a ReviewProvider');
  }
  return context;
};

export default ReviewProvider;