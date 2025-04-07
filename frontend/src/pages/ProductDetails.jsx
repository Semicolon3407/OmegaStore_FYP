// src/pages/ProductDetails.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart, ChevronLeft, ChevronDown, ChevronUp, GitCompare } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useCart } from '../Context/cartContext';
import { useWishlist } from '../Context/wishlistContext';
import { useCompare } from '../Context/compareContext';
import { useReview } from '../Context/ReviewContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCompare } = useCompare();
  const { reviews, loading: reviewLoading, fetchReviews, addReview } = useReview();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    details: true,
    reviews: true,
    related: true,
  });

  const API_BASE_URL = 'http://localhost:5001/api';

  const fetchProductDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const productRes = await axios.get(`${API_BASE_URL}/products/${id}`);
      const productData = productRes.data.product || productRes.data;
      setProduct(productData);

      await fetchReviews(id);

      const params = new URLSearchParams();
      params.append('category', productData.category);
      params.append('limit', 4);
      params.append('excludeId', id);

      const relatedRes = await axios.get(`${API_BASE_URL}/products?${params.toString()}`);
      setRelatedProducts(relatedRes.data.products || []);
    } catch (err) {
      console.error('Error fetching product details:', err);
      setError(err.response?.data?.message || 'Failed to load product details. Please try again.');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [id, fetchReviews]);

  useEffect(() => {
    fetchProductDetails();
  }, [fetchProductDetails]);

  const handleAddToCart = async () => {
    const success = await addToCart(product._id, quantity);
    if (success) {
      toast.success(`Added ${quantity} item${quantity > 1 ? 's' : ''} to cart!`);
    }
  };

  const isInWishlist = wishlistItems.some((item) => item._id === id);

  const handleWishlistToggle = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.info('Please sign in to manage your wishlist');
      navigate('/sign-in');
      return;
    }

    setWishlistLoading(true);
    try {
      if (isInWishlist) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product._id);
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const success = await addReview(id, rating, comment);
    if (success) {
      setRating(0);
      setComment('');
      setShowReviewForm(false);
      await fetchProductDetails(); // Refresh product details to update totalrating and reviews
    } else if (!localStorage.getItem('token')) {
      navigate('/sign-in');
    }
  };

  const toggleSection = (section) =>
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));

  const FilterSection = ({ title, section, children }) => (
    <div className="mb-8 border-b border-gray-200 pb-6">
      <div
        className="flex justify-between items-center mb-4 cursor-pointer"
        onClick={() => toggleSection(section)}
      >
        <h3 className="font-semibold text-gray-900 text-xl">{title}</h3>
        {expandedSections[section] ? (
          <ChevronUp size={20} className="text-gray-600" />
        ) : (
          <ChevronDown size={20} className="text-gray-600" />
        )}
      </div>
      {expandedSections[section] && children}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 pt-40">
        <div className="grid grid-cols-1 gap-8">
          <div className="bg-white rounded-xl shadow-md p-6 h-96 animate-pulse">
            <div className="bg-gray-200 h-56 rounded-lg mb-4"></div>
            <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
            <div className="bg-gray-200 h-4 rounded w-1/2 mb-3"></div>
            <div className="bg-gray-200 h-10 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 pt-40">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Product not found'}</h2>
          <Link
            to="/products"
            className="bg-blue-900 text-white px-6 py-3 rounded-full hover:bg-blue-800 transition-all duration-300 shadow-md inline-block"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen pt-40 lg:pt-32">
      <div className="container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <Link
            to="/products"
            className="flex items-center text-blue-900 hover:text-blue-500 font-medium transition-colors duration-300"
          >
            <ChevronLeft size={20} className="mr-2" />
            Back to Products
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
        >
          <div className="lg:flex">
            <div className="lg:w-1/2 p-8 relative">
              <button
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className={`absolute top-10 right-10 z-10 p-2 rounded-full shadow-md ${
                  isInWishlist ? 'text-red-500 bg-red-50' : 'text-gray-600 bg-white hover:text-red-500'
                } transition-all duration-300`}
              >
                <Heart size={20} fill={isInWishlist ? 'currentColor' : 'none'} />
              </button>

              <div className="relative h-80 lg:h-[28rem] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center shadow-inner">
                <img
                  src={product.images?.[currentImageIndex] || '/placeholder.jpg'}
                  alt={product.title}
                  className="w-full h-full object-contain p-8 transition-transform duration-300 hover:scale-105"
                />
                {product.quantity <= 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                    Sold Out
                  </div>
                )}
              </div>
              <div className="flex gap-4 mt-6 overflow-x-auto pb-2">
                {product.images?.slice(0, 3).map((img, idx) => (
                  <motion.img
                    key={idx}
                    src={img}
                    alt={`${product.title} thumbnail ${idx}`}
                    className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 ${
                      currentImageIndex === idx ? 'border-blue-900' : 'border-gray-200'
                    }`}
                    onClick={() => setCurrentImageIndex(idx)}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  />
                ))}
              </div>
            </div>

            <div className="lg:w-1/2 p-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3 tracking-tight">{product.title}</h1>
              <div className="flex items-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={`${
                      i < Math.round(product.totalrating || 0)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-gray-600 text-sm">({reviews.length} reviews)</span>
              </div>
              <p className="text-gray-600 text-sm mb-4 capitalize">
                {product.brand} • {product.category}
              </p>
              <p className="text-2xl font-bold text-gray-900 mb-6">Rs {product.price.toLocaleString()}</p>

              {product.quantity > 0 && (
                <div className="flex items-center mb-6">
                  <span className="mr-4 font-medium text-gray-700">Quantity:</span>
                  <div className="flex border border-gray-200 rounded-full overflow-hidden bg-gray-100">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors duration-300"
                    >
                      -
                    </button>
                    <span className="w-12 h-12 flex items-center justify-center text-gray-900 font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.quantity, q + 1))}
                      className="w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors duration-300"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={handleAddToCart}
                disabled={product.quantity <= 0}
                className={`w-full py-3 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
                  product.quantity <= 0
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-900 text-white hover:bg-blue-800'
                }`}
              >
                <ShoppingCart size={18} className="mr-2" />
                {product.quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button
                onClick={() => {
                  const token = localStorage.getItem('token');
                  if (!token) {
                    toast.info('Please sign in to add products to compare');
                    navigate('/sign-in');
                    return;
                  }
                  addToCompare(product);
                  toast.success(`${product.title} added to compare`);
                }}
                className="w-full mt-4 py-3 rounded-full flex items-center justify-center text-blue-900 border border-blue-900 hover:bg-blue-50 transition-all duration-300 shadow-md"
              >
                <GitCompare size={18} className="mr-2" />
                Add to Compare
              </button>

              <p className="text-sm text-gray-600 mt-6">
                <span className="font-medium">Availability:</span>{' '}
                {product.quantity > 0 ? (
                  <span className="text-green-600">{product.quantity} in stock</span>
                ) : (
                  <span className="text-red-500">Out of stock</span>
                )}
              </p>
            </div>
          </div>

          <div className="p-8">
            <FilterSection title="Product Details" section="details">
              <p className="text-gray-700 leading-relaxed">{product.description || 'No description available.'}</p>
              <ul className="mt-4 space-y-2 text-gray-700">
                <li><strong>Brand:</strong> {product.brand || 'N/A'}</li>
                <li><strong>Category:</strong> {product.category || 'N/A'}</li>
                <li><strong>Color:</strong> {product.color || 'N/A'}</li>
              </ul>
            </FilterSection>

            <FilterSection title="Reviews" section="reviews">
              {reviewLoading ? (
                <p className="text-gray-600">Loading reviews...</p>
              ) : reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review, idx) => (
                    <div key={idx} className="border-b border-gray-200 pb-4">
                      <div className="flex items-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={`${
                              i < review.star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">
                          by {review.postedby?.name || 'Anonymous'} •{' '}
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.comment || 'No comment provided'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
              )}
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="mt-6 text-blue-900 hover:text-blue-500 font-medium transition-colors duration-300"
              >
                {showReviewForm ? 'Cancel' : 'Write a Review'}
              </button>
              {showReviewForm && (
                <form onSubmit={handleReviewSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={24}
                          className={`cursor-pointer ${
                            i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                          }`}
                          onClick={() => setRating(i + 1)}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
                      rows="4"
                      placeholder="Share your thoughts..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={rating === 0 || reviewLoading}
                    className="bg-blue-900 text-white px-6 py-3 rounded-full hover:bg-blue-800 transition-all duration-300 shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {reviewLoading ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </FilterSection>

            <FilterSection title="Related Products" section="related">
              {relatedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {relatedProducts.map((related) => (
                    <motion.div
                      key={related._id}
                      className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all duration-300 border border-gray-200"
                      whileHover={{ y: -5 }}
                    >
                      <Link to={`/products/${related._id}`}>
                        <img
                          src={related.images?.[0] || '/placeholder.jpg'}
                          alt={related.title}
                          className="w-full h-40 object-contain rounded-lg mb-4"
                        />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1 hover:text-blue-500 transition-colors">
                          {related.title}
                        </h3>
                        <p className="text-xl font-bold text-gray-900">Rs {related.price.toLocaleString()}</p>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No related products found.</p>
              )}
            </FilterSection>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetails;