import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart, ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useCart } from '../Context/cartContext';
import { useWishlist } from '../Context/wishlistContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cartItems, addToCart } = useCart();
  const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
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
      setReviews(productData.ratings || []);

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
  }, [id]);

  useEffect(() => {
    fetchProductDetails();
  }, [fetchProductDetails]);

  const handleAddToCart = async () => {
    const success = await addToCart(product._id, quantity);
    if (success) {
      toast.success('Added to cart!');
    }
  };

  const isInWishlist = wishlistItems.some((item) => item._id === id);

  const handleWishlistToggle = async () => {
    if (!localStorage.getItem('token')) {
      toast.info('Please login to manage your wishlist');
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
    if (!localStorage.getItem('token')) {
      toast.info('Please login to submit a review');
      navigate('/sign-in');
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/products/rating`,
        { productId: id, star: rating, comment },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setReviews([...reviews, response.data.rating]);
      setRating(0);
      setComment('');
      setShowReviewForm(false);
      toast.success('Review submitted successfully!');
      fetchProductDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const toggleSection = (section) =>
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));

  const FilterSection = ({ title, section, children }) => (
    <div className="mb-6 border-b border-gray-100 pb-4">
      <div
        className="flex justify-between items-center mb-3 cursor-pointer"
        onClick={() => toggleSection(section)}
      >
        <h3 className="font-semibold text-gray-800">{title}</h3>
        {expandedSections[section] ? (
          <ChevronUp size={18} className="text-gray-500" />
        ) : (
          <ChevronDown size={18} className="text-gray-500" />
        )}
      </div>
      {expandedSections[section] && children}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-4 h-96 animate-pulse">
            <div className="bg-gray-200 h-56 rounded-lg mb-4"></div>
            <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
            <div className="bg-gray-200 h-4 rounded w-1/2 mb-3"></div>
            <div className="bg-gray-200 h-10 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{error || 'Product not found'}</h2>
          <Link
            to="/products"
            className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-6 py-3 rounded-lg hover:opacity-90 transition duration-300 inline-block"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <Link
            to="/products"
            className="flex items-center text-primary-600 hover:text-primary-800 font-medium"
          >
            <ChevronLeft size={20} className="mr-1" />
            Back to Products
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <div className="md:flex">
            <div className="md:w-1/2 p-6 relative">
              <button
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className={`absolute top-9 right-9 z-10 p-2 rounded-full backdrop-blur-sm ${
                  isInWishlist
                    ? 'text-red-500 bg-red-50/80'
                    : 'text-gray-400 bg-white/80 hover:text-red-500'
                } transition-colors duration-300`}
              >
                <Heart size={20} fill={isInWishlist ? 'currentColor' : 'none'} />
              </button>

              <div className="relative h-64 md:h-96 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                <img
                  src={product.images?.[currentImageIndex] || '/placeholder.jpg'}
                  alt={product.title}
                  className="w-full h-full object-contain p-6 transition-transform duration-500 hover:scale-105"
                />
                {product.quantity <= 0 && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    Sold Out
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {product.images?.map((img, idx) => (
                  <motion.img
                    key={idx}
                    src={img}
                    alt={`${product.title} thumbnail ${idx}`}
                    className={`w-16 h-16 object-cover rounded-md cursor-pointer border-2 ${
                      currentImageIndex === idx ? 'border-primary-600' : 'border-gray-200'
                    }`}
                    onClick={() => setCurrentImageIndex(idx)}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  />
                ))}
              </div>
            </div>

            <div className="md:w-1/2 p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
              <div className="flex items-center mb-1">
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
                <span className="ml-2 text-gray-600 text-sm">
                  ({product.ratings?.length || 0} reviews)
                </span>
              </div>
              <p className="text-gray-500 text-sm mb-3 capitalize">
                {product.brand} • {product.category}
              </p>
              <p className="text-xl font-bold text-gray-900 mb-6">
                Rs {product.price.toLocaleString()}
              </p>

              {product.quantity > 0 && (
                <div className="flex items-center mb-6">
                  <span className="mr-4 font-medium text-gray-700">Quantity:</span>
                  <div className="flex border rounded-md overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      -
                    </button>
                    <span className="w-12 h-10 flex items-center justify-center border-l border-r text-gray-800">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.quantity, q + 1))}
                      className="w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={handleAddToCart}
                disabled={
                  cartItems.some((item) => item.product?._id === product._id) || product.quantity <= 0
                }
                className={`w-full py-3 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  cartItems.some((item) => item.product?._id === product._id)
                    ? 'bg-green-100 text-green-700'
                    : product.quantity <= 0
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:opacity-90'
                }`}
              >
                <ShoppingCart size={18} className="mr-2" />
                {cartItems.some((item) => item.product?._id === product._id)
                  ? 'Added to Cart'
                  : product.quantity <= 0
                  ? 'Out of Stock'
                  : 'Add to Cart'}
              </button>
            </div>
          </div>

          <div className="p-6 border-t border-gray-100">
            <FilterSection title="Product Details" section="details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-600">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Description</h4>
                  <p>{product.description || 'No description available'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Details</h4>
                  <div className="space-y-2">
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-32">Brand:</span>
                      <span>{product.brand || 'N/A'}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-32">Category:</span>
                      <span>{product.category || 'N/A'}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-32">Color:</span>
                      <span>{product.color || 'N/A'}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-32">Stock:</span>
                      <span
                        className={`${product.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {product.quantity > 0 ? `${product.quantity} available` : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </FilterSection>

            <FilterSection title="Customer Reviews" section="reviews">
              {reviews.length === 0 ? (
                <p className="text-gray-600">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review, idx) => (
                    <div key={idx} className="border-b border-gray-100 pb-6 last:border-b-0">
                      <div className="flex items-center mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={`${
                              i < (review.star || 0)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="font-medium text-gray-800">
                        {review.postedby?.firstname || 'Anonymous'}
                      </p>
                      <p className="text-sm text-gray-500 mb-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="mt-6 bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-6 py-3 rounded-lg hover:opacity-90 transition duration-300"
              >
                {showReviewForm ? 'Cancel Review' : 'Write a Review'}
              </button>

              {showReviewForm && (
                <motion.form
                  onSubmit={handleReviewSubmit}
                  className="mt-6"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">Rating</label>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={24}
                          className={`cursor-pointer mr-1 ${
                            i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                          }`}
                          onClick={() => setRating(i + 1)}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">Comment</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      rows="4"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-6 py-3 rounded-lg hover:opacity-90 transition duration-300"
                  >
                    Submit Review
                  </button>
                </motion.form>
              )}
            </FilterSection>

            <FilterSection title="Related Products" section="related">
              {relatedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedProducts.map((related) => (
                    <motion.div
                      key={related._id}
                      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 relative"
                      whileHover={{ y: -5 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Link to={`/products/${related._id}`} className="block">
                        <div className="relative h-64 overflow-hidden bg-gray-50 flex items-center justify-center">
                          <img
                            src={related.images?.[0] || '/placeholder.jpg'}
                            alt={related.title}
                            className="w-full h-full object-contain p-6 transition-transform duration-500 hover:scale-105"
                          />
                          {related.quantity <= 0 && (
                            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                              Sold Out
                            </div>
                          )}
                        </div>
                        <div className="p-5">
                          <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1">
                            {related.title}
                          </h3>
                          <p className="text-gray-500 text-sm mb-3 capitalize">
                            {related.brand} • {related.category}
                          </p>
                          <p className="text-xl font-bold text-gray-900 mb-4">
                            Rs {related.price.toLocaleString()}
                          </p>
                        </div>
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