"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import axios from "axios";

const Hero = () => {
  const [banners, setBanners] = useState([]);
  const API_URL = "http://localhost:5001/api/hero-banners";

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await axios.get(API_URL);
        setBanners(response.data);
      } catch (error) {
        console.error("Failed to fetch hero banners:", error);
      }
    };
    fetchBanners();
  }, []);

  return (
    <section className="relative text-white h-[calc(100vh-80px)] sm:h-[calc(100vh-96px)] lg:h-[calc(100vh-112px)] flex items-center overflow-hidden w-full">
      {/* Background - Unchanged */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_70%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('/assets/images/noise.png')] opacity-5 pointer-events-none"></div>
      </div>

      {banners.length > 0 ? (
        <div className="w-full h-full">
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={0}
            slidesPerView={1}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            className="w-full h-full"
          >
            {banners.map((banner) => (
              <SwiperSlide key={banner._id} className={`${banner.backgroundColor} h-full`}>
                <div className="w-full h-full flex items-center">
                  <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-16 xl:px-20 py-8 sm:py-12 md:py-16 lg:py-20 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 xl:gap-12 items-center">
                      {/* Left Content */}
                      <motion.div
                        initial={{ opacity: 0, x: -60 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8"
                      >
                        {/* Badge */}
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.6, delay: 0.2 }}
                          className="inline-flex items-center px-3 sm:px-4 md:px-6 py-1 sm:py-1.5 md:py-2 rounded-full bg-orange-500/20 border border-white/10 shadow-md"
                        >
                          <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5 mr-1 sm:mr-2">
                            <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-orange-500"></span>
                          </span>
                          <span className="text-xs sm:text-sm font-medium uppercase tracking-wider text-white">Now Available</span>
                        </motion.div>

                        {/* Title */}
                        <motion.h1
                          initial={{ y: 30, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.8, delay: 0.4 }}
                          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight tracking-tight"
                        >
                          {banner.title.split(banner.highlightedTitle)[0]}
                          <br />
                          <span className="text-orange-500">{banner.highlightedTitle}</span>
                        </motion.h1>

                        {/* Description */}
                        <motion.p
                          initial={{ y: 30, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.8, delay: 0.6 }}
                          className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-200 max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl leading-relaxed"
                        >
                          {banner.highlightedDescription ? (
                            <>
                              {banner.description.split(banner.highlightedDescription)[0]}
                              <span className="font-semibold text-orange-500">
                                {banner.highlightedDescription}
                              </span>
                              {banner.description.split(banner.highlightedDescription)[1]}
                            </>
                          ) : (
                            banner.description
                          )}
                        </motion.p>

                        {/* Offer Section */}
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8, delay: 0.8 }}
                          className="bg-white/10 backdrop-blur-lg rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 border border-white/10 shadow-xl relative overflow-hidden"
                        >
                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
                              <h3 className="text-base sm:text-lg md:text-xl font-semibold">
                                <span className="text-orange-500">
                                  {banner.offerTitle.split(" ")[0]}
                                </span>{" "}
                                {banner.offerTitle.split(" ").slice(1).join(" ")}
                              </h3>
                              <span className="text-xs sm:text-sm text-gray-400">{banner.offerWorth}</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                              {banner.offerItems.map((item, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ scale: 0.95 }}
                                  whileHover={{ scale: 1.03 }}
                                  className="bg-white/5 p-2 sm:p-3 md:p-4 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300"
                                >
                                  <div className="text-xs sm:text-sm font-medium text-white">{item.title}</div>
                                  <div className="text-xs text-gray-400 mt-1">{item.description}</div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </motion.div>

                        {/* CTA Buttons */}
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8, delay: 1 }}
                          className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4"
                        >
                          <Link
                            to="/products"
                            className="relative inline-flex items-center justify-center px-5 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-full bg-blue-900 text-white font-medium text-sm sm:text-base md:text-lg shadow-lg hover:bg-blue-800 transition-all duration-300"
                          >
                            <span className="relative z-10">Shop Now</span>
                          </Link>
                          <Link
                            to="/features"
                            className="relative inline-flex items-center justify-center px-5 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-full border border-white/20 text-white font-medium text-sm sm:text-base md:text-lg bg-white/5 hover:bg-white/10 transition-all duration-300 shadow-lg"
                          >
                            <span className="relative z-10">Explore Features</span>
                          </Link>
                        </motion.div>
                      </motion.div>

                      {/* Right Image Section */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                        className="relative"
                      >
                        <div className="relative w-full max-w-[200px] sm:max-w-[250px] md:max-w-[300px] lg:max-w-[350px] xl:max-w-[400px] mx-auto lg:ml-auto">
                          <motion.img
                            src={`http://localhost:5001${banner.image}`}
                            alt={banner.title}
                            className="w-full h-auto drop-shadow-2xl"
                            initial={{ y: 60 }}
                            animate={{ y: 0 }}
                            transition={{
                              duration: 1.5,
                              delay: 0.8,
                              type: "spring",
                              stiffness: 80,
                              damping: 15,
                            }}
                          />
                          {[
                            { icon: "🚀", class: "top-6 sm:top-8 md:top-12 left-6 sm:left-8 md:left-12", size: "text-lg sm:text-xl md:text-2xl" },
                            { icon: "📸", class: "bottom-8 sm:bottom-12 md:bottom-16 right-6 sm:right-8 md:right-12", size: "text-xl sm:text-2xl md:text-3xl" },
                            { icon: "⚡", class: "top-1/4 right-8 sm:right-12 md:right-16", size: "text-lg sm:text-xl md:text-2xl" },
                          ].map((item, index) => (
                            <motion.div
                              key={index}
                              className={`absolute ${item.size} ${item.class} drop-shadow-md`}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{
                                duration: 0.6,
                                delay: 1 + index * 0.3,
                                type: "spring",
                                stiffness: 100,
                              }}
                              whileHover={{ scale: 1.15, rotate: 10 }}
                            >
                              {item.icon}
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : (
        <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-16 xl:px-20 py-12 sm:py-16 md:py-20 lg:py-24 text-center text-gray-200">
          No hero banners available.
        </div>
      )}
    </section>
  );
};

export default Hero;