import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, ShoppingCart, Filter, X, ChevronDown, ChevronUp, Heart, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useCart } from '../Context/cartContext';
import { useWishlist } from '../Context/wishlistContext';

const ProductListing = () => {
  const { cartItems, addToCart } = useCart();
  const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlistLoading, setWishlistLoading] = useState({});

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [colorFilter, setColorFilter] = useState('All');
  const [brandFilter, setBrandFilter] = useState('All');
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

  const fetchAllProducts = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/products');
      setAllProducts(response.data.products || []);
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
      params.append('limit', limit);
      params.append('page', page);

      const response = await axios.get(`http://localhost:5001/api/products?${params.toString()}`);
      setProducts(response.data.products || []);
      setError(null);
    } catch (err) {
      setError('Failed to load products. Please try again later.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, brandFilter, colorFilter, minPrice, maxPrice, sortBy, sortOrder, limit, page]);

  useEffect(() => {
    fetchAllProducts();
    fetchProducts();
  }, [fetchAllProducts, fetchProducts]);

  const handleSearch = useCallback(() => {
    if (!searchTerm.trim()) {
      fetchProducts();
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const filtered = allProducts.filter(
      (product) =>
        product.title.toLowerCase().includes(searchTermLower) &&
        (categoryFilter === 'All' || product.category === categoryFilter) &&
        (brandFilter === 'All' || product.brand === brandFilter) &&
        (colorFilter === 'All' || product.color === colorFilter) &&
        (!minPrice || product.price >= parseFloat(minPrice)) &&
        (!maxPrice || product.price <= parseFloat(maxPrice))
    );

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'price') {
        return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
      } else if (sortBy === 'title') {
        return sortOrder === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
      return 0;
    });

    setProducts(sorted);
  }, [searchTerm, allProducts, categoryFilter, brandFilter, colorFilter, minPrice, maxPrice, sortBy, sortOrder, fetchProducts]);

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
      } else {
        await addToWishlist(productId);
      }
    } finally {
      setWishlistLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const { categories, brands, colors, priceRange } = useMemo(() => {
    const source = allProducts.length > 0 ? allProducts : products;
    const prices = source.map((p) => p.price);

    return {
      categories: ['All', ...new Set(source.map((p) => p.category))].filter(Boolean),
      brands: ['All', ...new Set(source.map((p) => p.brand))].filter(Boolean),
      colors: ['All', ...new Set(source.map((p) => p.color))].filter(Boolean),
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
  };

  const toggleSection = (section) =>
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));

  const handleAddToCart = async (productId) => {
    const success = await addToCart(productId);
    if (success) {
      toast.success('Added to cart!');
    }
  };

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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchProducts}
            className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-6 py-3 rounded-lg hover:opacity-90 transition duration-300"
          >
            Try Again
          </button>
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
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Discover Our Products</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find the perfect products that match your style and needs
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-3xl mx-auto mb-8"
        >
          <div className="relative shadow-sm rounded-lg overflow-hidden">
            <input
              type="text"
              placeholder="Search for products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-5 py-3 border-0 focus:ring-2 focus:ring-primary-500 rounded-lg pr-12"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <Search size={20} />
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="md:hidden mb-6"
        >
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <Filter size={18} className="mr-2 text-primary-600" />
              <span>{showMobileFilters ? 'Hide Filters' : 'Show Filters'}</span>
            </div>
            {showMobileFilters ? (
              <X size={18} className="text-gray-500" />
            ) : (
              <ChevronDown size={18} className="text-gray-500" />
            )}
          </button>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-8">
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`w-full md:w-72 bg-white p-6 rounded-xl shadow-sm ${
              showMobileFilters ? 'block' : 'hidden md:block'
            }`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Filters</h2>
              <button
                onClick={resetFilters}
                className="text-sm text-primary-600 hover:text-primary-800 font-medium"
              >
                Reset All
              </button>
            </div>

            <FilterSection title="Categories" section="categories">
              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category} className="flex items-center">
                    <input
                      type="radio"
                      id={`cat-${category}`}
                      name="category"
                      checked={categoryFilter === category}
                      onChange={() => setCategoryFilter(category)}
                      className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                    />
                    <label
                      htmlFor={`cat-${category}`}
                      className="ml-3 text-sm text-gray-700 capitalize"
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Brands" section="brands">
              <div className="space-y-3">
                {brands.map((brand) => (
                  <div key={brand} className="flex items-center">
                    <input
                      type="radio"
                      id={`brand-${brand}`}
                      name="brand"
                      checked={brandFilter === brand}
                      onChange={() => setBrandFilter(brand)}
                      className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                    />
                    <label
                      htmlFor={`brand-${brand}`}
                      className="ml-3 text-sm text-gray-700 capitalize"
                    >
                      {brand}
                    </label>
                  </div>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Colors" section="colors">
              <div className="space-y-3">
                {colors.map((color) => (
                  <div key={color} className="flex items-center">
                    <input
                      type="radio"
                      id={`color-${color}`}
                      name="color"
                      checked={colorFilter === color}
                      onChange={() => setColorFilter(color)}
                      className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                    />
                    <label
                      htmlFor={`color-${color}`}
                      className="ml-3 text-sm text-gray-700 capitalize"
                    >
                      {color}
                    </label>
                  </div>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Price Range" section="price">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (Rs)</label>
                  <input
                    type="number"
                    placeholder={`${priceRange.min}`}
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    min={priceRange.min}
                    max={priceRange.max}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (Rs)</label>
                  <input
                    type="number"
                    placeholder={`${priceRange.max}`}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    min={priceRange.min}
                    max={priceRange.max}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </FilterSection>

            <FilterSection title="Sort By" section="sort">
              <div className="space-y-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Default</option>
                  <option value="price">Price</option>
                  <option value="title">Name</option>
                </select>
                {sortBy && (
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
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
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex-1"
          >
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl shadow-sm p-4 h-96 animate-pulse"
                  >
                    <div className="bg-gray-200 h-56 rounded-lg mb-4"></div>
                    <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
                    <div className="bg-gray-200 h-4 rounded w-1/2 mb-3"></div>
                    <div className="bg-gray-200 h-10 rounded"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">No products found</h3>
                  <p className="text-gray-600 mb-6">
                    We couldn't find any products matching your criteria. Try adjusting your filters.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-6 py-3 rounded-lg hover:opacity-90 transition duration-300"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <motion.div
                      key={product._id}
                      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 relative"
                      whileHover={{ y: -5 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleWishlist(product._id);
                        }}
                        disabled={wishlistLoading[product._id]}
                        className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-sm ${
                          isInWishlist(product._id)
                            ? 'text-red-500 bg-red-50/80'
                            : 'text-gray-400 bg-white/80 hover:text-red-500'
                        } transition-colors duration-300`}
                      >
                        <Heart
                          size={20}
                          fill={isInWishlist(product._id) ? 'currentColor' : 'none'}
                        />
                      </button>

                      <Link to={`/products/${product._id}`} className="block">
                        <div className="relative h-64 overflow-hidden bg-gray-50 flex items-center justify-center">
                          <img
                            src={product.images?.[0] || '/placeholder.jpg'}
                            alt={product.title}
                            className="w-full h-full object-contain p-6 transition-transform duration-500 hover:scale-105"
                          />
                          {product.quantity <= 0 && (
                            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                              Sold Out
                            </div>
                          )}
                        </div>

                        <div className="p-5">
                          <div className="flex items-center mb-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={`${
                                  i < (product.totalrating || 0)
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1">
                            {product.title}
                          </h3>
                          <p className="text-gray-500 text-sm mb-3 capitalize">
                            {product.brand} • {product.category}
                          </p>
                          <p className="text-xl font-bold text-gray-900 mb-4">
                            Rs {product.price.toLocaleString()}
                          </p>
                        </div>
                      </Link>

                      <div className="px-5 pb-5">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddToCart(product._id);
                          }}
                          disabled={
                            cartItems.some((item) => item.product?._id === product._id) ||
                            product.quantity <= 0
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
                    </motion.div>
                  ))}
                </div>

                {products.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="flex justify-center mt-12"
                  >
                    <nav className="flex items-center space-x-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="px-4 py-2 text-gray-700">Page {page}</span>
                      <button
                        onClick={() => setPage((p) => p + 1)}
                        disabled={products.length < limit}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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