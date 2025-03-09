"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import Image from "../components/Image";

const saleProducts = [
  {
    id: 1,
    name: "Wireless Earbuds",
    price: 79.99,
    salePrice: 59.99,
    image: "https://example.com/wireless-earbuds.jpg",
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 199.99,
    salePrice: 149.99,
    image: "https://example.com/smart-watch.jpg",
  },
  {
    id: 3,
    name: "Bluetooth Speaker",
    price: 89.99,
    salePrice: 69.99,
    image: "https://example.com/bluetooth-speaker.jpg",
  },
  {
    id: 4,
    name: "Noise-Canceling Headphones",
    price: 249.99,
    salePrice: 199.99,
    image: "https://example.com/headphones.jpg",
  },
  {
    id: 5,
    name: "Portable Charger",
    price: 49.99,
    salePrice: 39.99,
    image: "https://example.com/portable-charger.jpg",
  },
  {
    id: 6,
    name: "Fitness Tracker",
    price: 99.99,
    salePrice: 79.99,
    image: "https://example.com/fitness-tracker.jpg",
  },
];

const SaleProducts = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1
        className="text-3xl font-bold mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Sale Products
      </motion.h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {saleProducts.map((product, index) => (
          <motion.div
            key={product.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="relative">
              <Image
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-0 right-0 bg-red-500 text-white px-2 py-1 m-2 rounded-md flex items-center">
                <Tag size={14} className="mr-1" />
                <span className="text-sm font-bold">
                  {Math.round((1 - product.salePrice / product.price) * 100)}%
                  OFF
                </span>
              </div>
            </div>
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-2">{product.name}</h2>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-gray-500 line-through">
                    Rs {product.price.toFixed(2)}
                  </span>
                  <span className="text-primary-600 font-bold ml-2">
                    Rs {product.salePrice.toFixed(2)}
                  </span>
                </div>
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  SALE
                </span>
              </div>
              <Link
                to={`/product/${product.id}`}
                className="bg-primary-600 text-white w-full py-2 rounded flex items-center justify-center hover:bg-primary-700 transition-colors"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SaleProducts;