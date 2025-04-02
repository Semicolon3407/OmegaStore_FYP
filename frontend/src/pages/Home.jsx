"use client";

import React, { useState, useEffect } from "react";
import Hero from "../components/Hero";
import Image from "../components/Image";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft, ShoppingCart, Star } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import axios from "axios";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  const brands = [
    { name: "Apple", logo: "https://www.apple.com/ac/structured-data/images/knowledge_graph_logo.png" },
    { name: "Apple", logo: "https://www.apple.com/ac/structured-data/images/knowledge_graph_logo.png" },
    { name: "Samsung", logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg" },
    { name: "Google", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
    { name: "Microsoft", logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" },
    { name: "Sony", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Sony_logo.png" },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:5001/api/products");
        setProducts(response.data.products);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      const shuffled = [...products].sort(() => 0.5 - Math.random());
      setFeaturedProducts(shuffled.slice(0, 6));
      const sortedByDate = [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNewArrivals(sortedByDate.slice(0, 6));
    }
  }, [products]);

  const swiperBreakpoints = {
    320: { slidesPerView: 1, spaceBetween: 16 },
    640: { slidesPerView: 2, spaceBetween: 20 },
    768: { slidesPerView: 3, spaceBetween: 24 },
    1024: { slidesPerView: 4, spaceBetween: 28 },
    1280: { slidesPerView: 5, spaceBetween: 32 },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <Hero />

      {/* Featured Products */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="text-center mb-10 md:mb-14">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Featured Products</h2>
              <p className="mt-2 text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
                Explore our handpicked selection of top-tier technology.
              </p>
            </div>

            <div className="relative">
              <Swiper
                modules={[Navigation, Autoplay]}
                spaceBetween={28}
                loop={true}
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                navigation={{ prevEl: ".featured-prev", nextEl: ".featured-next" }}
                breakpoints={swiperBreakpoints}
              >
                {featuredProducts.map((product) => (
                  <SwiperSlide key={product._id}>
                    <motion.div
                      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden"
                      whileHover={{ y: -8 }}
                    >
                      <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden group">
                        <Image
                          src={product.images[0] || "/placeholder.jpg"}
                          alt={product.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute top-4 right-4 bg-white/90 rounded-full px-2 py-1 flex items-center shadow-sm">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                          <span className="text-xs font-medium text-gray-700">{product.rating || 4.5}</span>
                        </div>
                      </div>
                      <div className="p-4 sm:p-5 flex flex-col">
                        <span className="text-xs text-gray-500 uppercase tracking-wide mb-2">{product.category || "Electronics"}</span>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 line-clamp-2 mb-3">{product.title}</h3>
                        <div className="mt-auto flex justify-between items-center">
                          <div>
                            <p className="text-lg sm:text-xl font-bold text-gray-900">Rs {product.price.toLocaleString()}</p>
                            {product.originalPrice && (
                              <p className="text-xs sm:text-sm text-gray-400 line-through">Rs {product.originalPrice.toLocaleString()}</p>
                            )}
                          </div>
                          <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-300">
                            <ShoppingCart className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <button className="featured-prev hidden sm:flex absolute top-1/2 -left-4 md:-left-6 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-all duration-300 z-10">
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              <button className="featured-next hidden sm:flex absolute top-1/2 -right-4 md:-right-6 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-all duration-300 z-10">
                <ChevronRight className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <div className="text-center mb-10 md:mb-14">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">New Arrivals</h2>
              <p className="mt-2 text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
                Check out the latest additions to our collection.
              </p>
            </div>

            <div className="relative">
              <Swiper
                modules={[Navigation, Autoplay]}
                spaceBetween={28}
                loop={true}
                autoplay={{ delay: 4500, disableOnInteraction: false }}
                navigation={{ prevEl: ".new-prev", nextEl: ".new-next" }}
                breakpoints={swiperBreakpoints}
              >
                {newArrivals.map((product) => (
                  <SwiperSlide key={product._id}>
                    <motion.div
                      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden"
                      whileHover={{ y: -8 }}
                    >
                      <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden group">
                        <Image
                          src={product.images[0] || "/placeholder.jpg"}
                          alt={product.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">NEW</span>
                      </div>
                      <div className="p-4 sm:p-5 flex flex-col">
                        <span className="text-xs text-gray-500 uppercase tracking-wide mb-2">{product.category || "Electronics"}</span>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 line-clamp-2 mb-3">{product.title}</h3>
                        <div className="mt-auto flex justify-between items-center">
                          <div>
                            <p className="text-lg sm:text-xl font-bold text-gray-900">Rs {product.price.toLocaleString()}</p>
                            {product.originalPrice && (
                              <p className="text-xs sm:text-sm text-gray-400 line-through">Rs {product.originalPrice.toLocaleString()}</p>
                            )}
                          </div>
                          <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-300">
                            <ShoppingCart className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <button className="new-prev hidden sm:flex absolute top-1/2 -left-4 md:-left-6 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-all duration-300 z-10">
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              <button className="new-next hidden sm:flex absolute top-1/2 -right-4 md:-right-6 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-all duration-300 z-10">
                <ChevronRight className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Brands */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
            <div className="text-center mb-10 md:mb-14">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Our Trusted Brands</h2>
              <p className="mt-2 text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
                Premium quality from industry-leading partners
              </p>
            </div>

            <div className="relative">
              <Swiper
                modules={[Navigation, Autoplay]}
                spaceBetween={32}
                loop={true}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                navigation={{ prevEl: ".brands-prev", nextEl: ".brands-next" }}
                breakpoints={{
                  320: { slidesPerView: 2, spaceBetween: 16 },
                  640: { slidesPerView: 3, spaceBetween: 20 },
                  768: { slidesPerView: 4, spaceBetween: 24 },
                  1024: { slidesPerView: 5, spaceBetween: 32 },
                }}
              >
                {brands.map((brand) => (
                  <SwiperSlide key={brand.name}>
                    <motion.div
                      className="bg-white rounded-xl shadow-md p-6 flex items-center justify-center h-32 border border-gray-100 hover:shadow-lg transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Image
                        src={brand.logo}
                        alt={brand.name}
                        className="max-h-14 w-auto object-contain opacity-75 hover:opacity-100 transition-opacity duration-300"
                      />
                    </motion.div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <button className="brands-prev hidden sm:flex absolute top-1/2 -left-4 md:-left-6 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-all duration-300 z-10">
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              <button className="brands-next hidden sm:flex absolute top-1/2 -right-4 md:-right-6 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-all duration-300 z-10">
                <ChevronRight className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-gray-900 to-blue-900 py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight mb-4 md:mb-6">
              Elevate Your Tech Experience
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-6 md:mb-8 max-w-3xl mx-auto">
              Unlock exclusive deals and cutting-edge gadgets designed to enhance your life.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
              <button className="bg-blue-600 text-white font-semibold px-6 sm:px-8 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                Shop Now
              </button>
              <button className="bg-transparent text-white font-semibold px-6 sm:px-8 py-3 rounded-lg border-2 border-white hover:bg-white hover:text-gray-900 transition-all duration-300">
                Explore More
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;