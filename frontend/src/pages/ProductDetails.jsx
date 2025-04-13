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
    <div className="mb-6 sm:mb-8 border-b border-gray-200 pb-4 sm:pb-6">
      <div
        className="flex justify-between items-center mb-3 sm:mb-4 cursor-pointer"
        onClick={() => toggleSection(section)}
      >
        <h3 className="font-semibold text-blue-900 text-lg sm:text-xl">{title}</h3>
        {expandedSections[section] ? (
          <ChevronUp size={18} className="text-blue-900" />
        ) : (
          <ChevronDown size={18} className="text-blue-900" />
        )}
      </div>
      {expandedSections[section] && children}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 pt-24 sm:pt-32 lg:pt-40">
        <div className="grid grid-cols-1 gap-6 sm:gap-8">
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 h-80 sm:h-96 animate-pulse">
            <div className="bg-gray-200 h-48 sm:h-56 rounded-lg mb-3 sm:mb-4"></div>
            <div className="bg-gray-200 h-3 sm:h-4 rounded w-3/4 mb-1 sm:mb-2"></div>
            <div className="bg-gray-200 h-3 sm:h-4 rounded w-1/2 mb-2 sm:mb-3"></div>
            <div className="bg-gray-200 h-8 sm:h-10 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 pt-24 sm:pt-32 lg:pt-40">
        <div className="text-center max-w-md p-6 sm:p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold text-blue-900 mb-3 sm:mb-4">{error || 'Product not found'}</h2>
          <Link
            to="/products"
            className="bg-blue-900 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-blue-800 transition-all duration-300 shadow-md inline-block text-sm sm:text-base"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen pt-24 sm:pt-32 lg:pt-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-6 py-10 sm:py-12 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 sm:mb-10 lg:mb-12"
        >
          <Link
            to="/products"
            className="flex items-center text-blue-900 hover:text-blue-500 font-medium transition-colors duration-300 text-sm sm:text-base"
          >
            <ChevronLeft size={18} className="mr-1 sm:mr-2" />
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
            <div className="lg:w-1/2 p-4 sm:p-6 lg:p-8 relative">
              <button
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className={`absolute top-6 sm:top-8 right-6 sm:right-8 z-10 p-1 sm:p-2 rounded-full shadow-md ${
                  isInWishlist ? 'text-red-500 bg-red-50' : 'text-blue-900 bg-white hover:text-red-500'
                } transition-all duration-300`}
              >
                <Heart size={16} fill={isInWishlist ? 'currentColor' : 'none'} />
              </button>

              <div className="relative h-64 sm:h-80 lg:h-[28rem] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center shadow-inner">
                <img
                  src={product.images?.[currentImageIndex] || '/placeholder.jpg'}
                  alt={product.title}
                  className="w-full h-full object-contain p-6 sm:p-8 transition-transform duration-300 hover:scale-105"
                />
                {product.quantity <= 0 && (
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-red-500 text-white text-xs font-semibold px-2 sm:px-3 py-1 rounded-full shadow">
                    Sold Out
                  </div>
                )}
                {product.isOnSale && (
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-orange-500 text-white text-xs font-semibold px-2 sm:px-3 py-1 rounded-full shadow">
                    Sale - {product.discountPercentage}%
                  </div>
                )}
              </div>
              <div className="flex gap-3 sm:gap-4 mt-4 sm:mt-6 overflow-x-auto pb-2">
                {product.images?.slice(0, 3).map((img, idx) => (
                  <motion.img
                    key={idx}
                    src={img}
                    alt={`${product.title} thumbnail ${idx}`}
                    className={`w-16 sm:w-20 h-16 sm:h-20 object-cover rounded-lg cursor-pointer border-2 ${
                      currentImageIndex === idx ? 'border-blue-900' : 'border-gray-200'
                    }`}
                    onClick={() => setCurrentImageIndex(idx)}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  />
                ))}
              </div>
            </div>

            <div className="lg:w-1/2 p-4 sm:p-6 lg:p-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-900 mb-2 sm:mb-3 tracking-tight">{product.title}</h1>
              <div className="flex items-center mb-1 sm:mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={`${
                      i < Math.round(product.totalrating || 0)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-blue-900/80 text-xs sm:text-sm">({reviews.length} reviews)</span>
              </div>
              <p className="text-blue-900/80 text-xs sm:text-sm mb-3 sm:mb-4 capitalize">
                {product.brand} • {product.category}
              </p>
              <div className="flex items-center mb-4 sm:mb-6">
                {product.isOnSale && product.discountedPrice !== null ? (
                  <>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-900">
                      Rs {product.discountedPrice.toLocaleString()}
                    </p>
                    <p className="text-sm sm:text-lg text-blue-900/60 line-through ml-2 sm:ml-4">
                      Rs {product.price.toLocaleString()}
                    </p>
                  </>
                ) : (
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-900">
                    Rs {product.price.toLocaleString()}
                  </p>
                )}
              </div>

              {product.quantity > 0 && (
                <div className="flex items-center mb-4 sm:mb-6">
                  <span className="mr-3 sm:mr-4 font-medium text-blue-900 text-sm sm:text-base">Quantity:</span>
                  <div className="flex border border-gray-200 rounded-full overflow-hidden bg-gray-100">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 sm:w-12 h-10 sm:h-12 flex items-center justify-center text-blue-900 hover:bg-gray-200 transition-colors duration-300"
                    >
                      -
                    </button>
                    <span className="w-10 sm:w-12 h-10 sm:h-12 flex items-center justify-center text-blue-900 font-medium text-sm sm:text-base">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.quantity, q + 1))}
                      className="w-10 sm:w-12 h-10 sm:h-12 flex items-center justify-center text-blue-900 hover:bg-gray-200 transition-colors duration-300"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={handleAddToCart}
                disabled={product.quantity <= 0}
                className={`w-full py-2 sm:py-3 rounded-full flex items-center justify-center transition-all duration-300 shadow-md text-sm sm:text-base ${
                  product.quantity <= 0
                    ? 'bg-gray-200 text-blue-900/50 cursor-not-allowed'
                    : 'bg-blue-900 text-white hover:bg-blue-800'
                }`}
              >
                <ShoppingCart size={16} className="mr-1 sm:mr-2" />
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
                className="w-full mt-3 sm:mt-4 py-2 sm:py-3 rounded-full flex items-center justify-center text-blue-900 border border-blue-900 hover:bg-blue-50 transition-all duration-300 shadow-md text-sm sm:text-base"
              >
                <GitCompare size={16} className="mr-1 sm:mr-2" />
                Add to Compare
              </button>

              <p className="text-xs sm:text-sm text-blue-900/80 mt-4 sm:mt-6">
                <span className="font-medium">Availability:</span>{' '}
                {product.quantity > 0 ? (
                  <span className="text-green-600">{product.quantity} in stock</span>
                ) : (
                  <span className="text-red-500">Out of stock</span>
                )}
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            <FilterSection title="Product Details" section="details">
              <p className="text-blue-900/80 leading-relaxed text-sm sm:text-base">{product.description || 'No description available.'}</p>
              <ul className="mt-3 sm:mt-4 space-y-2 text-blue-900/80 text-sm sm:text-base">
                <li><strong>Brand:</strong> {product.brand || 'N/A'}</li>
                <li><strong>Category:</strong> {product.category || 'N/A'}</li>
                <li><strong>Color:</strong> {product.color || 'N/A'}</li>
                <li><strong>On Sale:</strong> {product.isOnSale ? 'Yes' : 'No'}</li>
                {product.isOnSale && (
                  <li><strong>Discount:</strong> {product.discountPercentage}%</li>
                )}
              </ul>
            </FilterSection>

            <FilterSection title="Reviews" section="reviews">
              {reviewLoading ? (
                <p className="text-blue-900/80 text-sm sm:text-base">Loading reviews...</p>
              ) : reviews.length > 0 ? (
                <div className="space-y-4 sm:space-y-6">
                  {reviews.map((review, idx) => (
                    <div key={idx} className="border-b border-gray-200 pb-3 sm:pb-4">
                      <div className="flex items-center mb-1 sm:mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={`${
                              i < review.star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-xs sm:text-sm text-blue-900/80">
                          by {review.postedby ? `${review.postedby.firstname} ${review.postedby.lastname}` : 'Anonymous'} •{' '}
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-blue-900/80 text-sm sm:text-base">{review.comment || 'No comment provided'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-blue-900/80 text-sm sm:text-base">No reviews yet. Be the first to review this product!</p>
              )}
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="mt-4 sm:mt-6 text-blue-900 hover:text-blue-500 font-medium transition-colors duration-300 text-sm sm:text-base"
              >
                {showReviewForm ? 'Cancel' : 'Write a Review'}
              </button>
              {showReviewForm && (
                <form onSubmit={handleReviewSubmit} className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-1 sm:mb-2">Rating</label>
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={20}
                          className={`cursor-pointer ${
                            i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                          }`}
                          onClick={() => setRating(i + 1)}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-1 sm:mb-2">Comment</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full p-2 sm:p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100 text-blue-900 text-sm"
                      rows="4"
                      placeholder="Share your thoughts..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={rating === 0 || reviewLoading}
                    className="bg-blue-900 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-blue-800 transition-all duration-300 shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {reviewLoading ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </FilterSection>

            <FilterSection title="Related Products" section="related">
              {relatedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {relatedProducts.map((related) => (
                    <motion.div
                      key={related._id}
                      className="bg-white rounded-xl shadow-md p-3 sm:p-4 hover:shadow-lg transition-all duration-300 border border-gray-200"
                      whileHover={{ y: -5 }}
                    >
                      <Link to={`/products/${related._id}`}>
                        <img
                          src={related.images?.[0] || '/placeholder.jpg'}
                          alt={related.title}
                          className="w-full h-32 sm:h-40 object-contain rounded-lg mb-2 sm:mb-4"
                        />
                        <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-1 sm:mb-2 line-clamp-1 hover:text-blue-500 transition-colors">
                          {related.title}
                        </h3>
                        {related.isOnSale && related.discountedPrice !== null ? (
                          <div className="flex items-center">
                            <p className="text-base sm:text-xl font-bold text-blue-900">
                              Rs {related.discountedPrice.toLocaleString()}
                            </p>
                            <p className="text-xs sm:text-sm text-blue-900/60 line-through ml-1 sm:ml-2">
                              Rs {related.price.toLocaleString()}
                            </p>
                          </div>
                        ) : (
                          <p className="text-base sm:text-xl font-bold text-blue-900">
                            Rs {related.price.toLocaleString()}
                          </p>
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-blue-900/80 text-sm sm:text-base">No related products found.</p>
              )}
            </FilterSection>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetails;