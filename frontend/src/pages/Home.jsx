"use client";

import React, { useState, useEffect } from "react";
import Hero from "../components/Hero";
import Image from "../components/Image";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const featuredProducts = [
  {
    id: 1,
    name: "Samsung Galaxy Z Fold5",
    price: 249999.0,
    image: "/assets/images/iphone16pro.png",
   
      
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
  {
    id: 5,
    name: "Samsung Galaxy Z Fold5",
    price: 249999.0,
    image:
      "https://images.samsung.com/in/smartphones/galaxy-z-fold5/images/galaxy-z-fold5_highlights_kv.jpg",
  },
  {
    id: 6,
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
  // Define navigation classes
  const navigationPrevClass = "custom-swiper-button-prev";
  const navigationNextClass = "custom-swiper-button-next";

  // Responsive breakpoints for Swiper
  const swiperBreakpoints = {
    320: {
      slidesPerView: 1,
      spaceBetween: 10,
    },
    640: {
      slidesPerView: 2,
      spaceBetween: 15,
    },
    768: {
      slidesPerView: 3,
      spaceBetween: 15,
    },
    1024: {
      slidesPerView: 4,
      spaceBetween: 20,
    },
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
          <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">
            FEATURED PRODUCTS
          </h2>
          <div className="relative featured-products-slider">
            <Swiper
              modules={[Navigation]}
              slidesPerView={4}
              spaceBetween={20}
              loop={true}
              navigation={{
                prevEl: `.featured-products-slider .${navigationPrevClass}`,
                nextEl: `.featured-products-slider .${navigationNextClass}`,
              }}
              breakpoints={swiperBreakpoints}
              className="flex space-x-6 overflow-x-auto scroll-smooth"
            >
              {featuredProducts.map((product) => (
                <SwiperSlide key={product.id}>
                  <motion.div
                    className="bg-white rounded-lg shadow-lg overflow-hidden w-full"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-sm font-semibold mb-2 h-12 line-clamp-2 text-gray-700">
                        {product.name}
                      </h3>
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-bold text-gray-900">
                          Rs{product.price.toLocaleString()}
                        </p>
                        <button className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm hover:bg-primary-700 transition">
                          ADD TO CART
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
            {/* Custom Navigation Arrows for Featured Products */}
            <div
              className={`${navigationPrevClass} text-gray-600 hover:text-gray-900 bg-gray-100 p-3 rounded-full absolute top-1/2 left-4 transform -translate-y-1/2 cursor-pointer z-10 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg`}
            >
              <ChevronLeft className="w-5 h-5" />
            </div>
            <div
              className={`${navigationNextClass} text-gray-600 hover:text-gray-900 bg-gray-100 p-3 rounded-full absolute top-1/2 right-4 transform -translate-y-1/2 cursor-pointer z-10 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg`}
            >
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        </motion.section>

        {/* New Arrivals */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">
            NEW ARRIVALS
          </h2>
          <div className="relative new-arrivals-slider">
            <Swiper
              modules={[Navigation]}
              slidesPerView={4}
              spaceBetween={20}
              loop={true}
              navigation={{
                prevEl: `.new-arrivals-slider .${navigationPrevClass}`,
                nextEl: `.new-arrivals-slider .${navigationNextClass}`,
              }}
              breakpoints={swiperBreakpoints}
              className="flex space-x-6 overflow-x-auto scroll-smooth"
            >
              {newArrivals.map((product) => (
                <SwiperSlide key={product.id}>
                  <motion.div
                    className="bg-white rounded-lg shadow-lg overflow-hidden w-full"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-sm font-semibold mb-2 h-12 line-clamp-2 text-gray-700">
                        {product.name}
                      </h3>
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-bold text-gray-900">
                          Rs{product.price.toLocaleString()}
                        </p>
                        <button className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm hover:bg-primary-700 transition">
                          ADD TO CART
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
            {/* Custom Navigation Arrows for New Arrivals */}
            <div
              className={`${navigationPrevClass} text-gray-600 hover:text-gray-900 bg-gray-100 p-3 rounded-full absolute top-1/2 left-4 transform -translate-y-1/2 cursor-pointer z-10 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg`}
            >
              <ChevronLeft className="w-5 h-5" />
            </div>
            <div
              className={`${navigationNextClass} text-gray-600 hover:text-gray-900 bg-gray-100 p-3 rounded-full absolute top-1/2 right-4 transform -translate-y-1/2 cursor-pointer z-10 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg`}
            >
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        </motion.section>

        {/* Featured Brands */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">
            FEATURED BRANDS
          </h2>
          <div className="relative brands-slider">
            <Swiper
              modules={[Navigation]}
              slidesPerView={5}
              spaceBetween={20}
              loop={true}
              navigation={{
                prevEl: `.brands-slider .${navigationPrevClass}`,
                nextEl: `.brands-slider .${navigationNextClass}`,
              }}
              breakpoints={{
                320: {
                  slidesPerView: 2,
                  spaceBetween: 10,
                },
                640: {
                  slidesPerView: 3,
                  spaceBetween: 15,
                },
                768: {
                  slidesPerView: 4,
                  spaceBetween: 15,
                },
                1024: {
                  slidesPerView: 5,
                  spaceBetween: 20,
                },
              }}
              className="flex space-x-6 overflow-x-auto scroll-smooth"
            >
              {brands.map((brand) => (
                <SwiperSlide key={brand.name}>
                  <motion.div
                    className="flex items-center justify-center w-full"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      className="max-w-[120px] h-auto grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
            {/* Custom Navigation Arrows for Brands */}
            <div
              className={`${navigationPrevClass} text-gray-600 hover:text-gray-900 bg-gray-100 p-3 rounded-full absolute top-1/2 left-4 transform -translate-y-1/2 cursor-pointer z-10 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg`}
            >
              <ChevronLeft className="w-5 h-5" />
            </div>
            <div
              className={`${navigationNextClass} text-gray-600 hover:text-gray-900 bg-gray-100 p-3 rounded-full absolute top-1/2 right-4 transform -translate-y-1/2 cursor-pointer z-10 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg`}
            >
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Home;


