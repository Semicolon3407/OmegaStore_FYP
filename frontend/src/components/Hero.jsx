"use client";

import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
const iphoneImage = "/assets/images/iphone16pro.png";

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-b from-black to-gray-900 text-white min-h-screen flex items-center">
  <div className="container mx-auto px-6 md:px-12 lg:px-16 py-20">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
      
      {/* Left Content */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="space-y-8"
      >
        <div className="inline-block px-6 py-2 border border-white/50 rounded-full text-lg tracking-widest uppercase bg-white/10">
          Now Available!
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
          The Future. <br />
          <span className="text-primary-500">Reimagined.</span>
        </h1>

        <p className="text-lg text-white/80 max-w-xl leading-relaxed">
          Experience the power of the <span className="text-primary-500 font-semibold">iPhone 16 Pro</span>. 
          Cutting-edge technology, sleek design, and unmatched performance.
        </p>

        {/* Offer Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-white/20"
        >
          <div className="flex items-center justify-between text-white">
            <div className="text-xl font-semibold">SHIELD+ Protection</div>
            <div className="text-sm text-white/60">Worth - NPR 13,000</div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/5 p-4 rounded-lg">
              <div className="font-medium text-sm">Extended Warranty</div>
              <div className="text-xs text-white/60">(1 Year)</div>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <div className="font-medium text-sm">Front Screen Replacement</div>
              <div className="text-xs text-white/60">(1 Time)</div>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <div className="font-medium text-sm">Back Glass Replacement</div>
              <div className="text-xs text-white/60">(1 Time)</div>
            </div>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Link
            to="/products"
            className="inline-block px-8 py-4 text-lg font-medium bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all duration-300 transform hover:scale-105"
          >
            Shop Now
          </Link>
        </motion.div>
      </motion.div>

      {/* Right Image Section */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="relative"
      >
        <img
          src={iphoneImage}
          alt="iPhone 16 Pro"
          className="w-full max-w-[450px] mx-auto drop-shadow-2xl"
        />
      </motion.div>
    </div>
  </div>

  {/* Background gradient */}
  <div className="absolute inset-0 bg-gradient-to-r from-primary-900/30 to-transparent pointer-events-none" />
</section>

  );
};

export default Hero;
