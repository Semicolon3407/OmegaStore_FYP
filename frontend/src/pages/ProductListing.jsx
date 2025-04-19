import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, ShoppingCart, Filter, X, ChevronDown, ChevronUp, Heart, Star, GitCompare } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useCart } from '../Context/cartContext';
import { useWishlist } from '../Context/wishlistContext';
import { useCompare } from '../Context/compareContext';

const ProductListing = () => {
  const { cartItems, addToCart, isInCart } = useCart();
  const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCompare } = useCompare();
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlistLoading, setWishlistLoading] = useState({});

  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';
  const initialCategory = queryParams.get('category') || 'All';
  const initialBrand = queryParams.get('brand') || 'All';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [colorFilter, setColorFilter] = useState('All');
  const [brandFilter, setBrandFilter] = useState(initialBrand);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [limit] = useState(12);
  const [page, setPage] = useState(1);

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    brands: true,
    colors: true,
    price: true,
    sort: true,
  });

  const BASE_URL = 'http://localhost:5001';
  const API_URL = `${BASE_URL}/api/products`;

  const fetchAllProducts = useCallback(async () => {
    try {
      const response = await axios.get(API_URL);
      const mappedProducts = response.data.products.map((product) => ({
        ...product,
        images: product.images.map((img) => ({
          ...img,
          url: img.url.startsWith('http') ? img.url : `${BASE_URL}${img.url}`,
        })),
      }));
      setAllProducts(mappedProducts || []);
    } catch (err) {
      setError('Failed to load products. Please try again later.');
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter !== 'All') params.append('category', categoryFilter);
      if (brandFilter !== 'All') params.append('brand', brandFilter);
      if (colorFilter !== 'All') params.append('color', colorFilter);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('sortOrder', sortOrder);
      if (searchTerm) params.append('search', searchTerm);
      params.append('limit', limit);
      params.append('page', page);

      const response = await axios.get(`${API_URL}?${params.toString()}`);
      const mappedProducts = response.data.products.map((product) => ({
        ...product,
        images: product.images.map((img) => ({
          ...img,
          url: img.url.startsWith('http') ? img.url : `${BASE_URL}${img.url}`,
        })),
      }));
      setProducts(mappedProducts || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products. Please try again later.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, brandFilter, colorFilter, minPrice, maxPrice, sortBy, sortOrder, searchTerm, limit, page]);

  useEffect(() => {
    fetchAllProducts();
    fetchProducts();
  }, [fetchAllProducts, fetchProducts]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newSearch = params.get('search') || '';
    const newCategory = params.get('category') || 'All';
    const newBrand = params.get('brand') || 'All';
    setSearchTerm(newSearch);
    setCategoryFilter(newCategory);
    setBrandFilter(newBrand);
    setPage(1); // Reset page when filters change
  }, [location.search]);

  const handleSearch = useCallback(() => {
    fetchProducts(); // Rely on backend search for consistency
  }, [fetchProducts]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const isInWishlist = (productId) => wishlistItems.some((item) => item._id === productId);

  const toggleWishlist = async (productId) => {
    if (!localStorage.getItem('token')) {
      toast.info('Please login to manage your wishlist');
      navigate('/sign-in');
      return;
    }

    setWishlistLoading((prev) => ({ ...prev, [productId]: true }));
    try {
      if (isInWishlist(productId)) {
        await removeFromWishlist(productId);
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist(productId);
        toast.success('Added to wishlist');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update wishlist');
    } finally {
      setWishlistLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleAddToCompare = (product) => {
    if (!localStorage.getItem('token')) {
      toast.info('Please login to add products to compare');
      navigate('/sign-in');
      return;
    }
    addToCompare(product);
    toast.success(`${product.title} added to compare`);
  };

  const handleAddToCart = async (productId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.info('Please sign in to add products to cart');
      navigate('/sign-in');
      return;
    }

    if (isInCart(productId)) {
      toast.info('This product is already in your cart');
      return;
    }

    const success = await addToCart(productId);
    if (success) {
      toast.success('Product added to cart!');
    } else {
      toast.error('Failed to add to cart');
    }
  };

  const { categories, brands, colors, priceRange } = useMemo(() => {
    const source = allProducts.length > 0 ? allProducts : products;
    const prices = source.map((p) => p.price);

    return {
      categories: ['All', ...new Set(source.map((p) => p.category).filter(Boolean))],
      brands: ['All', ...new Set(source.map((p) => p.brand).filter(Boolean))],
      colors: ['All', ...new Set(source.map((p) => p.color).filter(Boolean))],
      priceRange: {
        min: prices.length ? Math.floor(Math.min(...prices)) : 0,
        max: prices.length ? Math.ceil(Math.max(...prices)) : 1000,
      },
    };
  }, [allProducts, products]);

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('All');
    setColorFilter('All');
    setBrandFilter('All');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('');
    setSortOrder('asc');
    setPage(1);
    navigate('/products');
  };

  const toggleSection = (section) =>
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));

  const FilterSection = ({ title, section, children }) => (
    <div className="mb-4 sm:mb-6 border-b border-gray-200 pb-4 sm:pb-6">
      <div
        className="flex justify-between items-center mb-3 sm:mb-4 cursor-pointer"
        onClick={() => toggleSection(section)}
      >
        <h3 className="font-semibold text-blue-900 text-base sm:text-lg">{title}</h3>
        {expandedSections[section] ? (
          <ChevronUp size={18} className="text-blue-900" />
        ) : (
          <ChevronDown size={18} className="text-blue-900" />
        )}
      </div>
      {expandedSections[section] && children}
    </div>
  );

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 pt-24 sm:pt-32 lg:pt-40">
        <div className="text-center max-w-md p-6 sm:p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold text-blue-900 mb-3 sm:mb-4">Something went wrong</h2>
          <p className="text-blue-900/80 mb-4 sm:mb-6 text-sm sm:text-base">{error}</p>
          <button
            onClick={fetchProducts}
            className="bg-blue-900 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-blue-800 transition-all duration-300 shadow-md text-sm sm:text-base"
          >
            Try Again
          </button>
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
          className="mb-8 sm:mb-10 lg:mb-12 text-center"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-900 mb-3 sm:mb-4 tracking-tight">
            Discover Our Products
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-blue-900/80 max-w-xl sm:max-w-2xl mx-auto leading-relaxed">
            {categoryFilter !== 'All' && brandFilter !== 'All'
              ? `Showing ${brandFilter} in ${categoryFilter}`
              : 'Find the perfect products that match your style and needs'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-3xl mx-auto mb-6 sm:mb-8 lg:mb-10"
        >
          <div className="relative shadow-md rounded-full overflow-hidden bg-gray-200">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-blue-900" size={18} />
            <input
              type="text"
              placeholder="Search for products..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                const params = new URLSearchParams();
                if (e.target.value) params.append('search', e.target.value);
                if (categoryFilter !== 'All') params.append('category', categoryFilter);
                if (brandFilter !== 'All') params.append('brand', brandFilter);
                navigate(`/products?${params.toString()}`);
              }}
              className="w-full pl-10 sm:pl-12 pr-4 sm:pr-6 py-3 sm:py-4 border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none text-blue-900 placeholder-blue-900 text-sm sm:text-base"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:hidden mb-6 sm:mb-8"
        >
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full flex items-center justify-between bg-white px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-md border border-gray-200 hover:bg-gray-200 transition-all duration-300"
          >
            <div className="flex items-center">
              <Filter size={18} className="mr-2 sm:mr-3 text-blue-900" />
              <span className="font-medium text-blue-900 text-sm sm:text-base">{showMobileFilters ? 'Hide Filters' : 'Show Filters'}</span>
            </div>
            {showMobileFilters ? (
              <X size={18} className="text-blue-900" />
            ) : (
              <ChevronDown size={18} className="text-blue-900" />
            )}
          </button>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          <motion.aside
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className={`w-full lg:w-72 xl:w-80 bg-white p-4 sm:p-6 rounded-xl shadow-lg ${showMobileFilters ? 'block' : 'hidden lg:block'}`}
          >
            <div className="flex justify-between items-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-blue-900">Filters</h2>
              <button
                onClick={resetFilters}
                className="text-sm text-blue-900 hover:text-blue-500 font-medium transition-colors duration-300"
              >
                Reset All
              </button>
            </div>

            <FilterSection title="Categories" section="categories">
              <div className="space-y-3 sm:space-y-4">
                {categories.map((category) => (
                  <div key={category} className="flex items-center">
                    <input
                      type="radio"
                      id={`cat-${category}`}
                      name="category"
                      checked={categoryFilter === category}
                      onChange={() => {
                        setCategoryFilter(category);
                        const params = new URLSearchParams();
                        if (searchTerm) params.append('search', searchTerm);
                        if (category !== 'All') params.append('category', category);
                        if (brandFilter !== 'All') params.append('brand', brandFilter);
                        navigate(`/products?${params.toString()}`);
                      }}
                      className="h-4 w-4 text-blue-900 border-gray-200 focus:ring-blue-500"
                    />
                    <label
                      htmlFor={`cat-${category}`}
                      className="ml-2 sm:ml-3 text-sm text-blue-900 capitalize hover:text-blue-500 transition-colors"
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Brands" section="brands">
              <div className="space-y-3 sm:space-y-4">
                {brands.map((brand) => (
                  <div key={brand} className="flex items-center">
                    <input
                      type="radio"
                      id={`brand-${brand}`}
                      name="brand"
                      checked={brandFilter === brand}
                      onChange={() => {
                        setBrandFilter(brand);
                        const params = new URLSearchParams();
                        if (searchTerm) params.append('search', searchTerm);
                        if (categoryFilter !== 'All') params.append('category', categoryFilter);
                        if (brand !== 'All') params.append('brand', brand);
                        navigate(`/products?${params.toString()}`);
                      }}
                      className="h-4 w-4 text-blue-900 border-gray-200 focus:ring-blue-500"
                    />
                    <label
                      htmlFor={`brand-${brand}`}
                      className="ml-2 sm:ml-3 text-sm text-blue-900 capitalize hover:text-blue-500 transition-colors"
                    >
                      {brand}
                    </label>
                  </div>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Colors" section="colors">
              <div className="space-y-3 sm:space-y-4">
                {colors.map((color) => (
                  <div key={color} className="flex items-center">
                    <input
                      type="radio"
                      id={`color-${color}`}
                      name="color"
                      checked={colorFilter === color}
                      onChange={() => setColorFilter(color)}
                      className="h-4 w-4 text-blue-900 border-gray-200 focus:ring-blue-500"
                    />
                    <label
                      htmlFor={`color-${color}`}
                      className="ml-2 sm:ml-3 text-sm text-blue-900 capitalize hover:text-blue-500 transition-colors"
                    >
                      {color}
                    </label>
                  </div>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Price Range" section="price">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-1 sm:mb-2">Min Price (Rs)</label>
                  <input
                    type="number"
                    placeholder={`${priceRange.min}`}
                    value={minPrice}
                    onChange={(e) => {
                      const value = e.target.value;
                      setMinPrice(value);
                      // Debounce the search to avoid too many API calls
                      const timeoutId = setTimeout(() => {
                        if (value && !isNaN(value)) {
                          fetchProducts();
                        }
                      }, 500);
                      return () => clearTimeout(timeoutId);
                    }}
                    onBlur={() => {
                      if (minPrice && !isNaN(minPrice)) {
                        fetchProducts();
                      }
                    }}
                    min={priceRange.min}
                    max={priceRange.max}
                    className="w-full p-2 sm:p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100 text-blue-900 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-1 sm:mb-2">Max Price (Rs)</label>
                  <input
                    type="number"
                    placeholder={`${priceRange.max}`}
                    value={maxPrice}
                    onChange={(e) => {
                      const value = e.target.value;
                      setMaxPrice(value);
                      // Debounce the search to avoid too many API calls
                      const timeoutId = setTimeout(() => {
                        if (value && !isNaN(value)) {
                          fetchProducts();
                        }
                      }, 500);
                      return () => clearTimeout(timeoutId);
                    }}
                    onBlur={() => {
                      if (maxPrice && !isNaN(maxPrice)) {
                        fetchProducts();
                      }
                    }}
                    min={priceRange.min}
                    max={priceRange.max}
                    className="w-full p-2 sm:p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100 text-blue-900 text-sm"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      if ((minPrice && !isNaN(minPrice)) || (maxPrice && !isNaN(maxPrice))) {
                        fetchProducts();
                      }
                    }}
                    className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800 transition-colors"
                  >
                    Apply Price Filter
                  </button>
                </div>
              </div>
            </FilterSection>

            <FilterSection title="Sort By" section="sort">
              <div className="space-y-3 sm:space-y-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 sm:p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100 text-blue-900 text-sm"
                >
                  <option value="">Default</option>
                  <option value="price">Price</option>
                  <option value="title">Name</option>
                </select>
                {sortBy && (
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full p-2 sm:p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100 text-blue-900 text-sm"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                )}
              </div>
            </FilterSection>
          </motion.aside>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex-1"
          >
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl shadow-md p-4 sm:p-6 h-80 sm:h-96 animate-pulse"
                  >
                    <div className="bg-gray-200 h-48 sm:h-56 rounded-lg mb-3 sm:mb-4"></div>
                    <div className="bg-gray-200 h-3 sm:h-4 rounded w-3/4 mb-1 sm:mb-2"></div>
                    <div className="bg-gray-200 h-3 sm:h-4 rounded w-1/2 mb-2 sm:mb-3"></div>
                    <div className="bg-gray-200 h-8 sm:h-10 rounded-full"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="text-4xl sm:text-5xl mb-4 sm:mb-6 text-blue-900/50">🔍</div>
                  <h3 className="text-xl sm:text-2xl font-bold text-blue-900 mb-3 sm:mb-4">No products found</h3>
                  <p className="text-blue-900/80 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
                    We couldn't find any products matching your criteria. Try adjusting your filters.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="bg-blue-900 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-blue-800 transition-all duration-300 shadow-md text-sm sm:text-base"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {products.map((product) => {
                    const discountedPrice = product.isOnSale && product.discountPercentage > 0
                      ? product.price * (1 - product.discountPercentage / 100)
                      : null;

                    return (
                      <motion.div
                        key={product._id}
                        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 relative group border border-gray-200"
                        whileHover={{ y: -5 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                      >
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleWishlist(product._id);
                          }}
                          disabled={wishlistLoading[product._id]}
                          className={`absolute top-3 sm:top-4 right-3 sm:right-4 z-10 p-1 sm:p-2 rounded-full shadow-md ${
                            isInWishlist(product._id)
                              ? 'text-red-500 bg-red-50'
                              : 'text-blue-900 bg-white hover:text-red-500'
                          } transition-all duration-300`}
                        >
                          <Heart
                            size={16}
                            fill={isInWishlist(product._id) ? 'currentColor' : 'none'}
                          />
                        </button>

                        <Link to={`/products/${product._id}`} className="block">
                          <div className="relative h-56 sm:h-64 overflow-hidden bg-gray-100 flex items-center justify-center">
                            <img
                              src={product.images?.[0]?.url || '/placeholder.jpg'}
                              alt={product.title}
                              className="w-full h-full object-contain p-4 sm:p-6 transition-transform duration-300 group-hover:scale-105"
                            />
                            {product.quantity <= 0 && (
                              <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-red-500 text-white text-xs font-semibold px-2 sm:px-3 py-1 rounded-full shadow">
                                Sold Out
                              </div>
                            )}
                            {product.isOnSale && product.discountPercentage > 0 && (
                              <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-orange-500 text-white text-xs font-semibold px-2 sm:px-3 py-1 rounded-full shadow">
                                Sale - {product.discountPercentage}%
                              </div>
                            )}
                          </div>

                          <div className="p-4 sm:p-6">
                            <div className="flex items-center mb-1 sm:mb-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  className={`${
                                    i < (product.rating || 0)
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <h3 className="font-semibold text-base sm:text-lg text-blue-900 mb-1 sm:mb-2 line-clamp-1 group-hover:text-blue-500 transition-colors">
                              {product.title}
                            </h3>
                            <p className="text-blue-900/80 text-xs sm:text-sm mb-2 sm:mb-3 capitalize">
                              {product.brand || 'N/A'} • {product.category || 'N/A'}
                            </p>
                            <div className="flex items-center">
                              {product.isOnSale && discountedPrice !== null ? (
                                <>
                                  <p className="text-lg sm:text-xl font-bold text-blue-900">
                                    Rs {Math.round(discountedPrice).toLocaleString()}
                                  </p>
                                  <p className="text-xs sm:text-sm text-blue-900/60 line-through ml-1 sm:ml-2">
                                    Rs {Math.round(product.price).toLocaleString()}
                                  </p>
                                </>
                              ) : (
                                <p className="text-lg sm:text-xl font-bold text-blue-900">
                                  Rs {Math.round(product.price).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </Link>

                        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                          <div className="flex justify-between items-center mb-3 sm:mb-4">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleAddToCompare(product);
                              }}
                              className="flex items-center text-blue-900 hover:text-blue-500 transition-colors text-xs sm:text-sm"
                            >
                              <GitCompare size={14} className="mr-1 sm:mr-2" />
                              Add to Compare
                            </button>
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleAddToCart(product._id);
                            }}
                            disabled={product.quantity <= 0}
                            className={`w-full flex items-center justify-center space-x-2 py-2 sm:py-3 px-4 sm:px-6 rounded-full text-sm sm:text-base font-medium transition-all duration-300 ${
                              product.quantity <= 0
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : isInCart(product._id)
                                ? 'bg-green-500 text-white hover:bg-green-600'
                                : 'bg-blue-900 text-white hover:bg-blue-800'
                            }`}
                          >
                            <ShoppingCart size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span>
                              {product.quantity <= 0
                                ? 'Out of Stock'
                                : isInCart(product._id)
                                ? 'In Cart'
                                : 'Add to Cart'}
                            </span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {products.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="flex justify-center mt-8 sm:mt-10 lg:mt-12"
                  >
                    <nav className="flex items-center space-x-3 sm:space-x-4 bg-white p-3 sm:p-4 rounded-full shadow-md">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 sm:px-4 py-1 sm:py-2 text-blue-900 hover:bg-gray-200 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                      >
                        Previous
                      </button>
                      <span className="px-3 sm:px-4 py-1 sm:py-2 text-blue-900 font-medium bg-gray-100 rounded-full text-sm sm:text-base">
                        Page {page}
                      </span>
                      <button
                        onClick={() => setPage((p) => p + 1)}
                        disabled={products.length < limit}
                        className="px-3 sm:px-4 py-1 sm:py-2 text-blue-900 hover:bg-gray-200 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                      >
                        Next
                      </button>
                    </nav>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductListing;