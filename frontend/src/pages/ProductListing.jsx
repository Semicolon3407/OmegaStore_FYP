import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, ShoppingCart, Filter, X } from "lucide-react";
import { Link } from "react-router-dom";
import Image from "../components/Image";
import { products } from "../data/products";

const ProductListing = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [colorFilter, setColorFilter] = useState("All");
  const [brandFilter, setBrandFilter] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Get price range from products
  const { minProductPrice, maxProductPrice, categories, colors, brands } = useMemo(() => {
    const allCategories = products.map((product) => product.category);
    const allColors = products.map((product) => product.color);
    const allBrands = products.map((product) => product.brand);
    const prices = products.map((product) => product.price);
    
    return {
      minProductPrice: Math.floor(Math.min(...prices)),
      maxProductPrice: Math.ceil(Math.max(...prices)),
      categories: ["All", ...new Set(allCategories)],
      colors: ["All", ...new Set(allColors)],
      brands: ["All", ...new Set(allBrands)]
    };
  }, []);

  // Filter products based on all criteria
  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (categoryFilter === "All" || product.category === categoryFilter) &&
        (colorFilter === "All" || product.color === colorFilter) &&
        (brandFilter === "All" || product.brand === brandFilter) &&
        (minPrice === "" || product.price >= parseFloat(minPrice)) &&
        (maxPrice === "" || product.price <= parseFloat(maxPrice))
    );
  }, [searchTerm, categoryFilter, colorFilter, brandFilter, minPrice, maxPrice]);

  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("All");
    setColorFilter("All");
    setBrandFilter("All");
    setMinPrice("");
    setMaxPrice("");
  };

  // Filter sidebar content
  const FilterSidebar = () => (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-6 md:hidden">
        <h2 className="text-xl font-semibold">Filters</h2>
        <button 
          onClick={toggleMobileFilters}
          className="text-gray-500"
        >
          <X size={24} />
        </button>
      </div>
      
      <div className="space-y-6">
        {/* Search filter - only show on mobile */}
        <div className="md:hidden">
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full p-2 pl-10 pr-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
          </div>
        </div>
        
        {/* Category filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        
        {/* Brand filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
          <select
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
          >
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>
        
        {/* Color filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
          <select
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            value={colorFilter}
            onChange={(e) => setColorFilter(e.target.value)}
          >
            {colors.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>
        
        {/* Price Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (Rs)</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Min"
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              min={0}
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              placeholder="Max"
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              min={0}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Price range: Rs {minProductPrice} - Rs {maxProductPrice}
          </div>
        </div>
        
        {/* Reset Button */}
        <div className="pt-2">
          <button
            onClick={resetFilters}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Our Products
        </h1>
        
        {/* Search bar - visible only on desktop */}
        <div className="mb-8 hidden md:block">
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full p-4 pl-12 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>
        </div>
        
        {/* Mobile filter toggle */}
        <div className="mb-4 md:hidden flex justify-between items-center">
          <p className="text-gray-600">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
          </p>
          <button 
            onClick={toggleMobileFilters}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            <Filter size={20} className="mr-2" />
            Filter
          </button>
        </div>
        
        {/* Mobile filter sidebar */}
        {showMobileFilters && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
            <div className="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-gray-50 overflow-y-auto transition-all duration-300">
              <div className="p-4">
                <FilterSidebar />
              </div>
            </div>
          </div>
        )}
        
        {/* Main content layout */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar - hidden on mobile */}
          <div className="hidden md:block md:w-1/4 lg:w-1/5">
            <FilterSidebar />
          </div>
          
          {/* Product grid */}
          <div className="md:w-3/4 lg:w-4/5">
            {/* Results count - desktop only */}
            <div className="mb-6 hidden md:block">
              <p className="text-gray-600">
                Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
              </p>
            </div>
            
            {filteredProducts.length > 0 ? (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    className="bg-white rounded-2xl shadow-md overflow-hidden"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h2 className="text-lg font-semibold mb-2 text-gray-800">
                        {product.name}
                      </h2>
                      <p className="text-gray-600 mb-3">
                        Rs {product.price.toLocaleString()}
                      </p>
                      <p className="text-gray-500 text-sm mb-1">
                        <strong>Brand:</strong> {product.brand}
                      </p>
                      <p className="text-gray-500 text-sm mb-3">
                        <strong>Color:</strong> {product.color}
                      </p>
                      <div className="flex justify-between items-center">
                        <Link
                          to={`/product/${product.id}`}
                          className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                        >
                          View Details
                        </Link>
                        <button className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition duration-300">
                          <ShoppingCart size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <p className="text-xl text-gray-500 mb-4">No products match your filters.</p>
                <button
                  onClick={resetFilters}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  Show All Products
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListing;