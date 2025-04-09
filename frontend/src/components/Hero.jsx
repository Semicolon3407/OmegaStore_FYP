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
    <section className="relative text-white min-h-screen flex items-center overflow-hidden w-full">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_70%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('/assets/images/noise.png')] opacity-5 pointer-events-none"></div>
      </div>

      {banners.length > 0 ? (
        <div className="w-full">
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={0}
            slidesPerView={1}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            className="w-full"
          >
            {banners.map((banner) => (
              <SwiperSlide key={banner._id} className={`${banner.backgroundColor}`}>
                <div className="w-full">
                  <div className="container mx-auto px-6 md:px-12 lg:px-20 py-24 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                      {/* Left Content */}
                      <motion.div
                        initial={{ opacity: 0, x: -60 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="space-y-10"
                      >
                        {/* Badge */}
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.6, delay: 0.2 }}
                          className="inline-flex items-center px-6 py-2 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/10 backdrop-blur-md shadow-md"
                        >
                          <span className="relative flex h-2.5 w-2.5 mr-2">
                            <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                          </span>
                          <span className="text-sm font-medium uppercase tracking-wider text-white/90">Now Available</span>
                        </motion.div>

                        {/* Title */}
                        <motion.h1
                          initial={{ y: 30, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.8, delay: 0.4 }}
                          className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tight"
                        >
                          {banner.title.split(banner.highlightedTitle)[0]}
                          <br />
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                            {banner.highlightedTitle}
                          </span>
                        </motion.h1>

                        {/* Description */}
                        <motion.p
                          initial={{ y: 30, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.8, delay: 0.6 }}
                          className="text-lg md:text-xl text-gray-200 max-w-2xl leading-relaxed"
                        >
                          {banner.highlightedDescription ? (
                            <>
                              {banner.description.split(banner.highlightedDescription)[0]}
                              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
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
                          className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10 shadow-xl relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 opacity-50"></div>
                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                              <h3 className="text-xl font-semibold">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                  {banner.offerTitle.split(" ")[0]}
                                </span>{" "}
                                {banner.offerTitle.split(" ").slice(1).join(" ")}
                              </h3>
                              <span className="text-sm text-gray-400">{banner.offerWorth}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              {banner.offerItems.map((item, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ scale: 0.95 }}
                                  whileHover={{ scale: 1.03 }}
                                  className="bg-white/5 p-4 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300"
                                >
                                  <div className="text-sm font-medium text-white">{item.title}</div>
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
                          className="flex flex-col sm:flex-row gap-4"
                        >
                          <Link
                            to="/products"
                            className="relative inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium text-lg shadow-lg hover:shadow-xl overflow-hidden group transition-all duration-300"
                          >
                            <span className="relative z-10">Shop Now</span>
                            <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                          </Link>
                          <Link
                            to="/features"
                            className="relative inline-flex items-center justify-center px-8 py-3.5 rounded-full border border-white/20 text-white font-medium text-lg bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all duration-300 shadow-lg hover:shadow-xl"
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
                        <div className="relative max-w-lg mx-auto lg:ml-auto">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full filter blur-3xl -z-10 scale-125"></div>
                          <motion.img
                            src={`http://localhost:5001${banner.image}`}
                            alt={banner.title}
                            className="w-full drop-shadow-2xl"
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
                            { icon: "🚀", class: "top-12 left-12", size: "text-2xl" },
                            { icon: "📸", class: "bottom-16 right-12", size: "text-3xl" },
                            { icon: "⚡", class: "top-1/4 right-16", size: "text-2xl" },
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
        <div className="container mx-auto px-6 md:px-12 lg:px-20 py-24 text-center text-gray-200">
          No hero banners available.
        </div>
      )}
    </section>
  );
};

export default Hero;