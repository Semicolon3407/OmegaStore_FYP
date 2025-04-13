"use client";

import React, { useState, useEffect } from "react";
import Hero from "../components/Hero";
import Image from "../components/Image";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft, ShoppingCart, Star, GitCompare, Heart } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useCompare } from "../Context/compareContext";
import { useWishlist } from "../Context/wishlistContext";
import { toast } from "react-toastify";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistLoading, setWishlistLoading] = useState({});

  const { addToCompare } = useCompare();
  const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();

  const brands = [
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
    320: { slidesPerView: 1, spaceBetween: 12 },
    640: { slidesPerView: 2, spaceBetween: 16 },
    768: { slidesPerView: 3, spaceBetween: 20 },
    1024: { slidesPerView: 4, spaceBetween: 24 },
    1280: { slidesPerView: 5, spaceBetween: 28 },
  };

  const brandBreakpoints = {
    320: { slidesPerView: 2, spaceBetween: 12 },
    640: { slidesPerView: 3, spaceBetween: 16 },
    768: { slidesPerView: 4, spaceBetween: 20 },
    1024: { slidesPerView: 5, spaceBetween: 24 },
  };

  const isInWishlist = (productId) => wishlistItems.some((item) => item._id === productId);

  const handleWishlistToggle = async (productId) => {
    if (!localStorage.getItem("token")) {
      toast.info("Please login to manage your wishlist");
      navigate("/sign-in");
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

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-blue-900"></div>
          <p className="mt-3 sm:mt-4 text-gray-600 text-base sm:text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36">
      <Hero />

      {/* Featured Products Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-900 tracking-tight">Featured Products</h2>
              <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-600 max-w-xl sm:max-w-2xl mx-auto leading-relaxed">
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
                    <Link to={`/products/${product._id}`}>
                      <motion.div
                        className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group relative border border-gray-200"
                        whileHover={{ y: -6 }}
                      >
                        <div className="absolute top-3 right-3 z-10 flex space-x-1 sm:space-x-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleWishlistToggle(product._id);
                            }}
                            disabled={wishlistLoading[product._id]}
                            className={`p-1 sm:p-2 rounded-full shadow-md ${
                              isInWishlist(product._id)
                                ? "text-red-500 bg-red-50"
                                : "text-gray-600 bg-white hover:text-red-500"
                            } transition-all duration-300`}
                          >
                            <Heart size={16} sm:size={18} fill={isInWishlist(product._id) ? "currentColor" : "none"} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              if (!localStorage.getItem("token")) {
                                toast.info("Please login to add products to compare");
                                navigate("/sign-in");
                                return;
                              }
                              addToCompare(product);
                              toast.success(`${product.title} added to compare`);
                            }}
                            className="p-1 sm:p-2 bg-white rounded-full shadow-md text-blue-900 hover:text-blue-500 transition-all duration-300"
                          >
                            <GitCompare size={16} sm:size={18} />
                          </button>
                        </div>
                        <div className="relative h-48 sm:h-56 md:h-64 bg-gray-100 flex items-center justify-center">
                          <Image
                            src={product.images[0] || "/placeholder.jpg"}
                            alt={product.title}
                            className="w-full h-full object-contain p-4 sm:p-6 transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-4 sm:p-6 flex flex-col">
                          <span className="text-xs sm:text-sm text-gray-600 capitalize mb-1 sm:mb-2">{product.category || "Electronics"}</span>
                          <h3 className="text-base sm:text-lg font-semibold text-blue-900 line-clamp-2 mb-2 sm:mb-3 group-hover:text-orange-500 transition-colors">
                            {product.title}
                          </h3>
                          {/* Rating Display */}
                          <div className="flex items-center mb-2 sm:mb-3">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                  i < Math.round(product.totalrating || 0)
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="ml-1 sm:ml-2 text-gray-600 text-xs sm:text-sm">
                              ({product.ratings?.length || 0})
                            </span>
                          </div>
                          <div className="mt-auto flex justify-between items-center">
                            <div>
                              <p className="text-lg sm:text-xl font-bold text-blue-900">Rs {product.price.toLocaleString()}</p>
                              {product.originalPrice && (
                                <p className="text-xs sm:text-sm text-gray-500 line-through">Rs {product.originalPrice.toLocaleString()}</p>
                              )}
                            </div>
                            <button className="p-1 sm:p-2 bg-blue-900 text-white rounded-full hover:bg-blue-500 transition-all duration-300 shadow-md">
                              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>
              <button className="featured-prev hidden sm:flex absolute top-1/2 -left-4 sm:-left-6 -translate-y-1/2 bg-white p-1 sm:p-2 rounded-full shadow-md hover:bg-gray-200 transition-all duration-300 z-10">
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              </button>
              <button className="featured-next hidden sm:flex absolute top-1/2 -right-4 sm:-right-6 -translate-y-1/2 bg-white p-1 sm:p-2 rounded-full shadow-md hover:bg-gray-200 transition-all duration-300 z-10">
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gray-100">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-900 tracking-tight">New Arrivals</h2>
              <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-600 max-w-xl sm:max-w-2xl mx-auto leading-relaxed">
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
                    <Link to={`/products/${product._id}`}>
                      <motion.div
                        className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group relative border border-gray-200"
                        whileHover={{ y: -6 }}
                      >
                        <div className="absolute top-3 right-3 z-10 flex space-x-1 sm:space-x-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleWishlistToggle(product._id);
                            }}
                            disabled={wishlistLoading[product._id]}
                            className={`p-1 sm:p-2 rounded-full shadow-md ${
                              isInWishlist(product._id)
                                ? "text-red-500 bg-red-50"
                                : "text-gray-600 bg-white hover:text-red-500"
                            } transition-all duration-300`}
                          >
                            <Heart size={16} sm:size={18} fill={isInWishlist(product._id) ? "currentColor" : "none"} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              if (!localStorage.getItem("token")) {
                                toast.info("Please login to add products to compare");
                                navigate("/sign-in");
                                return;
                              }
                              addToCompare(product);
                              toast.success(`${product.title} added to compare`);
                            }}
                            className="p-1 sm:p-2 bg-white rounded-full shadow-md text-blue-900 hover:text-blue-500 transition-all duration-300"
                          >
                            <GitCompare size={16} sm:size={18} />
                          </button>
                        </div>
                        <div className="relative h-48 sm:h-56 md:h-64 bg-gray-100 flex items-center justify-center">
                          <Image
                            src={product.images[0] || "/placeholder.jpg"}
                            alt={product.title}
                            className="w-full h-full object-contain p-4 sm:p-6 transition-transform duration-300 group-hover:scale-105"
                          />
                          <span className="absolute top-3 left-3 bg-blue-900 text-white text-xs font-semibold px-2 sm:px-3 py-1 rounded-full shadow">NEW</span>
                        </div>
                        <div className="p-4 sm:p-6 flex flex-col">
                          <span className="text-xs sm:text-sm text-gray-600 capitalize mb-1 sm:mb-2">{product.category || "Electronics"}</span>
                          <h3 className="text-base sm:text-lg font-semibold text-blue-900 line-clamp-2 mb-2 sm:mb-3 group-hover:text-orange-500 transition-colors">
                            {product.title}
                          </h3>
                          {/* Rating Display */}
                          <div className="flex items-center mb-2 sm:mb-3">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                  i < Math.round(product.totalrating || 0)
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="ml-1 sm:ml-2 text-gray-600 text-xs sm:text-sm">
                              ({product.ratings?.length || 0})
                            </span>
                          </div>
                          <div className="mt-auto flex justify-between items-center">
                            <div>
                              <p className="text-lg sm:text-xl font-bold text-blue-900">Rs {product.price.toLocaleString()}</p>
                              {product.originalPrice && (
                                <p className="text-xs sm:text-sm text-gray-500 line-through">Rs {product.originalPrice.toLocaleString()}</p>
                              )}
                            </div>
                            <button className="p-1 sm:p-2 bg-blue-900 text-white rounded-full hover:bg-blue-500 transition-all duration-300 shadow-md">
                              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>
              <button className="new-prev hidden sm:flex absolute top-1/2 -left-4 sm:-left-6 -translate-y-1/2 bg-white p-1 sm:p-2 rounded-full shadow-md hover:bg-gray-200 transition-all duration-300 z-10">
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              </button>
              <button className="new-next hidden sm:flex absolute top-1/2 -right-4 sm:-right-6 -translate-y-1/2 bg-white p-1 sm:p-2 rounded-full shadow-md hover:bg-gray-200 transition-all duration-300 z-10">
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trusted Brands Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
            <div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-900 tracking-tight">Our Trusted Brands</h2>
              <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-600 max-w-xl sm:max-w-2xl mx-auto leading-relaxed">
                Premium quality from industry-leading partners.
              </p>
            </div>

            <div className="relative">
              <Swiper
                modules={[Navigation, Autoplay]}
                spaceBetween={24}
                loop={true}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                navigation={{ prevEl: ".brands-prev", nextEl: ".brands-next" }}
                breakpoints={brandBreakpoints}
              >
                {brands.map((brand) => (
                  <SwiperSlide key={brand.name}>
                    <motion.div
                      className="bg-white rounded-lg shadow-md p-4 sm:p-6 flex items-center justify-center h-24 sm:h-28 md:h-32 border border-gray-200 hover:shadow-xl transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Image
                        src={brand.logo}
                        alt={brand.name}
                        className="max-h-10 sm:max-h-12 md:max-h-14 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity duration-300"
                      />
                    </motion.div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <button className="brands-prev hidden sm:flex absolute top-1/2 -left-4 sm:-left-6 -translate-y-1/2 bg-white p-1 sm:p-2 rounded-full shadow-md hover:bg-gray-200 transition-all duration-300 z-10">
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              </button>
              <button className="brands-next hidden sm:flex absolute top-1/2 -right-4 sm:-right-6 -translate-y-1/2 bg-white p-1 sm:p-2 rounded-full shadow-md hover:bg-gray-200 transition-all duration-300 z-10">
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-blue-900 py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-4 sm:mb-6">
              Elevate Your Tech Experience
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-6 sm:mb-8 max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto leading-relaxed">
              Unlock exclusive deals and cutting-edge gadgets designed to enhance your life.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 md:gap-6">
              <Link
                to="/products"
                className="bg-blue-500 text-white font-semibold px-6 sm:px-8 py-2 sm:py-3 rounded-full hover:bg-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Shop Now
              </Link>
              <Link
                to="/products"
                className="bg-transparent text-white font-semibold px-6 sm:px-8 py-2 sm:py-3 rounded-full border-2 border-white hover:bg-white hover:text-blue-900 transition-all duration-300 shadow-md"
              >
                Explore More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;