import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ShoppingCart, Filter, X } from "lucide-react";
import { Link } from "react-router-dom";
import Image from "../components/Image";
import axios from "axios";

const ProductListing = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [colorFilter, setColorFilter] = useState("All");
  const [brandFilter, setBrandFilter] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/products");
      if (Array.isArray(response.data.products)) {
        setProducts(response.data.products);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  };

  const { minProductPrice, maxProductPrice, categories, colors, brands } = useMemo(() => {
    const allCategories = products.map((product) => product.category);
    const allColors = products.map((product) => product.color);
    const allBrands = products.map((product) => product.brand);
    const prices = products.map((product) => product.price);
    
    return {
      minProductPrice: prices.length ? Math.floor(Math.min(...prices)) : 0,
      maxProductPrice: prices.length ? Math.ceil(Math.max(...prices)) : 0,
      categories: ["All", ...new Set(allCategories)],
      colors: ["All", ...new Set(allColors)],
      brands: ["All", ...new Set(allBrands)]
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (categoryFilter === "All" || product.category === categoryFilter) &&
        (colorFilter === "All" || product.color === colorFilter) &&
        (brandFilter === "All" || product.brand === brandFilter) &&
        (minPrice === "" || product.price >= parseFloat(minPrice)) &&
        (maxPrice === "" || product.price <= parseFloat(maxPrice))
    );
  }, [searchTerm, categoryFilter, colorFilter, brandFilter, minPrice, maxPrice, products]);

  const resetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("All");
    setColorFilter("All");
    setBrandFilter("All");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Our Products</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <motion.div key={product._id} className="bg-white rounded-2xl shadow-md overflow-hidden">
                <Image src={product.images.length ? product.images[0] : "/placeholder.jpg"} alt={product.title} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h2 className="text-lg font-semibold mb-2 text-gray-800">{product.title}</h2>
                  <p className="text-gray-600 mb-3">Rs {product.price.toLocaleString()}</p>
                  <p className="text-gray-500 text-sm mb-1"><strong>Brand:</strong> {product.brand}</p>
                  <p className="text-gray-500 text-sm mb-3"><strong>Color:</strong> {product.color}</p>
                  <div className="flex justify-between items-center">
                    <Link to={`/product/${product._id}`} className="text-blue-600 hover:text-blue-700 font-semibold text-sm">View Details</Link>
                    <button className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition duration-300">
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <p className="text-xl text-gray-500 mb-4">No products match your filters.</p>
              <button onClick={resetFilters} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">
                Show All Products
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListing;
