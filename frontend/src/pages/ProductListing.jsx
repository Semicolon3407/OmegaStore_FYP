import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import Image from "../components/Image";
import { products } from "../data/products";

const ProductListing = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const categories = useMemo(() => {
    const allCategories = products.map((product) => product.category);
    return ["All", ...new Set(allCategories)];
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (categoryFilter === "All" || product.category === categoryFilter)
    );
  }, [searchTerm, categoryFilter]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
          Our Products
        </h1>
        <div className="mb-8 flex flex-col md:flex-row justify-between items-center">
          <div className="relative max-w-md w-full mb-4 md:mb-0">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full p-4 pl-12 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>
          <select
            className="p-2 border rounded-md"
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
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image
                src={product.image}
                alt={product.name}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2 text-gray-800">
                  {product.name}
                </h2>
                <p className="text-gray-600 mb-4">
                  Rs {product.price.toLocaleString()}
                </p>
                <div className="flex justify-between items-center">
                  <Link
                    to={`/product/${product.id}`}
                    className="text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    View Details
                  </Link>
                  <button className="bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 transition duration-300">
                    <ShoppingCart size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default ProductListing;
