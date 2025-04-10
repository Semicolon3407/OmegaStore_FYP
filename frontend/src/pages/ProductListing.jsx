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
  const { cartItems, addToCart } = useCart();
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
      if (searchTerm) params.append('search', searchTerm);
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
  }, [location.search]);

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
        toast.success("Removed from wishlist");
      } else {
        await addToWishlist(productId);
        toast.success("Added to wishlist");
      }
    } catch (err) {
      toast.error("Failed to update wishlist");
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
    const success = await addToCart(productId);
    if (success) {
      toast.success('Added to cart!');
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
    navigate('/products');
  };

  const toggleSection = (section) =>
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));

  const FilterSection = ({ title, section, children }) => (
    <div className="mb-6 border-b border-gray-200 pb-6">
      <div
        className="flex justify-between items-center mb-4 cursor-pointer"
        onClick={() => toggleSection(section)}
      >
        <h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
        {expandedSections[section] ? (
          <ChevronUp size={20} className="text-gray-600" />
        ) : (
          <ChevronDown size={20} className="text-gray-600" />
        )}
      </div>
      {expandedSections[section] && children}
    </div>
  );

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 pt-40">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchProducts}
            className="bg-blue-900 text-white px-6 py-3 rounded-full hover:bg-blue-800 transition-all duration-300 shadow-md"
          >
            Try Again
          </button>
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
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Discover Our Products
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {categoryFilter !== 'All' && brandFilter !== 'All'
              ? `Showing ${brandFilter} in ${categoryFilter}`
              : 'Find the perfect products that match your style and needs'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-3xl mx-auto mb-10"
        >
          <div className="relative shadow-md rounded-full overflow-hidden bg-gray-200">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600" size={20} />
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
              className="w-full pl-12 pr-6 py-4 border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-700"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:hidden mb-8"
        >
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full flex items-center justify-between bg-white px-6 py-3 rounded-full shadow-md border border-gray-200 hover:bg-gray-200 transition-all duration-300"
          >
            <div className="flex items-center">
              <Filter size={20} className="mr-3 text-blue-900" />
              <span className="font-medium text-gray-900">{showMobileFilters ? 'Hide Filters' : 'Show Filters'}</span>
            </div>
            {showMobileFilters ? (
              <X size={20} className="text-gray-600" />
            ) : (
              <ChevronDown size={20} className="text-gray-600" />
            )}
          </button>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          <motion.aside
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className={`w-full lg:w-80 bg-white p-6 rounded-xl shadow-lg ${showMobileFilters ? 'block' : 'hidden lg:block'}`}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Filters</h2>
              <button
                onClick={resetFilters}
                className="text-sm text-blue-900 hover:text-blue-500 font-medium transition-colors duration-300"
              >
                Reset All
              </button>
            </div>

            <FilterSection title="Categories" section="categories">
              <div className="space-y-4">
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
                      className="h-4 w-4 text-blue-900 border-gray-300 focus:ring-blue-500"
                    />
                    <label
                      htmlFor={`cat-${category}`}
                      className="ml-3 text-sm text-gray-700 capitalize hover:text-gray-900 transition-colors"
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Brands" section="brands">
              <div className="space-y-4">
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
                      className="h-4 w-4 text-blue-900 border-gray-300 focus:ring-blue-500"
                    />
                    <label
                      htmlFor={`brand-${brand}`}
                      className="ml-3 text-sm text-gray-700 capitalize hover:text-gray-900 transition-colors"
                    >
                      {brand}
                    </label>
                  </div>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Colors" section="colors">
              <div className="space-y-4">
                {colors.map((color) => (
                  <div key={color} className="flex items-center">
                    <input
                      type="radio"
                      id={`color-${color}`}
                      name="color"
                      checked={colorFilter === color}
                      onChange={() => setColorFilter(color)}
                      className="h-4 w-4 text-blue-900 border-gray-300 focus:ring-blue-500"
                    />
                    <label
                      htmlFor={`color-${color}`}
                      className="ml-3 text-sm text-gray-700 capitalize hover:text-gray-900 transition-colors"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Price (Rs)</label>
                  <input
                    type="number"
                    placeholder={`${priceRange.min}`}
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    min={priceRange.min}
                    max={priceRange.max}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Price (Rs)</label>
                  <input
                    type="number"
                    placeholder={`${priceRange.max}`}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    min={priceRange.min}
                    max={priceRange.max}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
                  />
                </div>
              </div>
            </FilterSection>

            <FilterSection title="Sort By" section="sort">
              <div className="space-y-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
                >
                  <option value="">Default</option>
                  <option value="price">Price</option>
                  <option value="title">Name</option>
                </select>
                {sortBy && (
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl shadow-md p-6 h-96 animate-pulse"
                  >
                    <div className="bg-gray-200 h-56 rounded-lg mb-4"></div>
                    <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
                    <div className="bg-gray-200 h-4 rounded w-1/2 mb-3"></div>
                    <div className="bg-gray-200 h-10 rounded-full"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="text-5xl mb-6 text-gray-400">🔍</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">No products found</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    We couldn't find any products matching your criteria. Try adjusting your filters.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="bg-blue-900 text-white px-6 py-3 rounded-full hover:bg-blue-800 transition-all duration-300 shadow-md"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {products.map((product) => (
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
                        className={`absolute top-4 right-4 z-10 p-2 rounded-full shadow-md ${
                          isInWishlist(product._id)
                            ? 'text-red-500 bg-red-50'
                            : 'text-gray-600 bg-white hover:text-red-500'
                        } transition-all duration-300`}
                      >
                        <Heart
                          size={20}
                          fill={isInWishlist(product._id) ? 'currentColor' : 'none'}
                        />
                      </button>

                      <Link to={`/products/${product._id}`} className="block">
                        <div className="relative h-64 overflow-hidden bg-gray-100 flex items-center justify-center">
                          <img
                            src={product.images?.[0] || '/placeholder.jpg'}
                            alt={product.title}
                            className="w-full h-full object-contain p-6 transition-transform duration-300 group-hover:scale-105"
                          />
                          {product.quantity <= 0 && (
                            <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                              Sold Out
                            </div>
                          )}
                          {product.isOnSale && (
                            <div className="absolute top-4 left-4 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                              Sale - {product.discountPercentage}%
                            </div>
                          )}
                        </div>

                        <div className="p-6">
                          <div className="flex items-center mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                className={`${
                                  i < (product.totalrating || 0)
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-500 transition-colors">
                            {product.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3 capitalize">
                            {product.brand} • {product.category}
                          </p>
                          <div className="flex items-center">
                            {product.isOnSale && product.discountedPrice !== null ? (
                              <>
                                <p className="text-xl font-bold text-gray-900">
                                  Rs {product.discountedPrice.toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-500 line-through ml-2">
                                  Rs {product.price.toLocaleString()}
                                </p>
                              </>
                            ) : (
                              <p className="text-xl font-bold text-gray-900">
                                Rs {product.price.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>

                      <div className="px-6 pb-6">
                        <div className="flex justify-between items-center mb-4">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleAddToCompare(product);
                            }}
                            className="flex items-center text-blue-900 hover:text-blue-500 transition-colors"
                          >
                            <GitCompare size={16} className="mr-2" />
                            Add to Compare
                          </button>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddToCart(product._id);
                          }}
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
                      </div>
                    </motion.div>
                  ))}
                </div>

                {products.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="flex justify-center mt-12"
                  >
                    <nav className="flex items-center space-x-4 bg-white p-4 rounded-full shadow-md">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="px-4 py-2 text-gray-900 font-medium bg-gray-100 rounded-full">
                        Page {page}
                      </span>
                      <button
                        onClick={() => setPage((p) => p + 1)}
                        disabled={products.length < limit}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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