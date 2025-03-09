"use client";

import React, { useState, useRef, useEffect } from "react";
import Hero from "../components/Hero";
import Image from "../components/Image";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ShoppingBag, ChevronRight, ChevronLeft } from "lucide-react";

const featuredProducts = [
  {
    id: 1,
    name: "Samsung Galaxy Z Fold5",
    price: 249999.0,
    image:
      "https://images.samsung.com/in/smartphones/galaxy-z-fold5/images/galaxy-z-fold5_highlights_kv.jpg",
  },
  {
    id: 2,
    name: "Samsung Galaxy Z Fold5",
    price: 249999.0,
    image:
      "https://images.samsung.com/in/smartphones/galaxy-z-fold5/images/galaxy-z-fold5_highlights_kv.jpg",
  },
  {
    id: 3,
    name: "Samsung Galaxy Z Fold5",
    price: 249999.0,
    image:
      "https://images.samsung.com/in/smartphones/galaxy-z-fold5/images/galaxy-z-fold5_highlights_kv.jpg",
  },
  {
    id: 4,
    name: "Samsung Galaxy Z Fold5",
    price: 249999.0,
    image:
      "https://images.samsung.com/in/smartphones/galaxy-z-fold5/images/galaxy-z-fold5_highlights_kv.jpg",
  },

  
];

const newArrivals = [
  {
    id: 1,
    name: "JCPAL Coi Pro Wireless Optical Mouse",
    price: 4800.0,
    image:
      "https://jcpal.com/cdn/shop/products/CoiProWirelessOpticalMouse_800x.jpg",
  },
  {
    id: 2,
    name: "Apple MacBook Air M3 13.6-inch",
    price: 231900.0,
    image:
      "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/macbook-air-midnight-config-20220606?wid=820&hei=498&fmt=jpeg&qlt=90&.v=1654122880566",
  },
  {
    id: 3,
    name: "DJI NEO Mission Fly More Combo",
    price: 85500.0,
    image:
      "https://dji-official-fe.djicdn.com/cms/uploads/6d1d37654d5666e8f4a3c0d2e812d8c4.png",
  },
  {
    id: 4,
    name: "DJI Mini 4K Drone Fly More Combo",
    price: 75500.0,
    image:
      "https://dji-official-fe.djicdn.com/cms/uploads/5d052c3c23a3f0d24925cc5c0f012c5f.png",
  },
    {
    id: 4,
    name: "DJI Mini 4K Drone Fly More Combo",
    price: 75500.0,
    image:
      "https://dji-official-fe.djicdn.com/cms/uploads/5d052c3c23a3f0d24925cc5c0f012c5f.png",
  },

];

const brands = [
  {
    name: "Apple",
    logo: "https://www.apple.com/ac/structured-data/images/knowledge_graph_logo.png",
  },
  {
    name: "Apple",
    logo: "https://www.apple.com/ac/structured-data/images/knowledge_graph_logo.png",
  },
  {
    name: "Apple",
    logo: "https://www.apple.com/ac/structured-data/images/knowledge_graph_logo.png",
  },
  {
    name: "Apple",
    logo: "https://www.apple.com/ac/structured-data/images/knowledge_graph_logo.png",
  },
  {
    name: "Apple",
    logo: "https://www.apple.com/ac/structured-data/images/knowledge_graph_logo.png",
  },
  {
    name: "Apple",
    logo: "https://www.apple.com/ac/structured-data/images/knowledge_graph_logo.png",
  }, 
];

const Home = () => {
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const scrollContainer = useRef(null);

  const checkScrollPosition = () => {
    if (scrollContainer.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    window.addEventListener("resize", checkScrollPosition);
    return () => window.removeEventListener("resize", checkScrollPosition);
  }, []);

  const scroll = (direction) => {
    const container = scrollContainer.current;
    if (container) {
      const scrollAmount =
        direction === "left" ? -container.clientWidth : container.clientWidth;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setTimeout(checkScrollPosition, 500); // Check after animation
    }
  };

  return (
    <div className="bg-gray-50">
      <Hero />

      {/* Featured Products */}
      <div className="container mx-auto px-4 py-12">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold mb-8 text-center">
            FEATURED PRODUCTS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <motion.div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48"
                />
                <div className="p-4">
                  <h3 className="text-sm font-semibold mb-2 h-12 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-bold">
                      Rs{product.price.toLocaleString()}
                    </p>
                    <button className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm">
                      ADD TO CART
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* New Arrivals */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold mb-8 text-center">NEW ARRIVALS</h2>
          <div className="relative">
            {showLeftArrow && (
              <button
                onClick={() => scroll("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-2 rounded-full shadow-md"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            <div
              ref={scrollContainer}
              className="flex overflow-x-auto gap-6 scroll-smooth hide-scrollbar"
              style={{ scrollSnapType: "x mandatory" }}
              onScroll={checkScrollPosition}
            >
              {newArrivals.map((product) => (
                <motion.div
                  key={product.id}
                  className="flex-none w-[250px] bg-white rounded-lg shadow-md overflow-hidden"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                  style={{ scrollSnapAlign: "start" }}
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48"
                  />
                  <div className="p-4">
                    <h3 className="text-sm font-semibold mb-2 h-12 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex justify-between items-center">
                      <p className="text-lg font-bold">
                        Rs{product.price.toLocaleString()}
                      </p>
                      <button className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm">
                        ADD TO CART
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            {showRightArrow && (
              <button
                onClick={() => scroll("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-2 rounded-full shadow-md"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>
        </motion.section>

        {/* Featured Brands */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold mb-8 text-center">
            FEATURED BRANDS
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-8">
            {brands.map((brand) => (
              <motion.div
                key={brand.name}
                className="flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  className="max-w-[120px] h-auto grayscale hover:grayscale-0 transition-all duration-300"
                />
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Home;