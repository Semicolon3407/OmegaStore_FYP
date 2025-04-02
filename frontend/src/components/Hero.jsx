"use client";

import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
const iphoneImage = "/assets/images/iphone16pro.png";

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-b from-gray-900 to-black text-white min-h-screen flex items-center overflow-hidden shadow-lg">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary-900/20 via-transparent to-secondary-900/20 pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/assets/images/dot-pattern.png')] opacity-10 pointer-events-none"></div>
      </div>

      <div className="container mx-auto px-6 md:px-12 lg:px-16 py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="inline-flex items-center px-6 py-2.5 border border-white/30 rounded-full text-lg tracking-wider uppercase bg-gradient-to-r from-primary-600/30 to-secondary-600/30 backdrop-blur-sm shadow-lg"
            >
              <span className="relative flex h-3 w-3 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
              </span>
              Now Available!
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-5xl md:text-6xl xl:text-7xl font-bold leading-tight"
            >
              The Future. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">
                Reimagined.
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl text-white/90 max-w-xl leading-relaxed"
            >
              Experience the power of the{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400 font-semibold">
                iPhone 16 Pro
              </span>
              . Cutting-edge technology, sleek design, and unmatched performance.
            </motion.p>

            {/* Offer Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-2xl border border-white/20 overflow-hidden relative"
            >
              {/* Glow effect */}
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary-500 rounded-full filter blur-3xl opacity-30"></div>
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-secondary-500 rounded-full filter blur-3xl opacity-30"></div>

              <div className="flex items-center justify-between text-white relative z-10">
                <div className="text-xl font-semibold flex items-center">
                  <span className="bg-gradient-to-r from-primary-400 to-secondary-400 text-transparent bg-clip-text">
                    SHIELD+
                  </span>{" "}
                  Protection
                </div>
                <div className="text-sm text-white/70">Worth - NPR 13,000</div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 text-center relative z-10">
                {[
                  { title: "Extended Warranty", desc: "(1 Year)" },
                  { title: "Front Screen", desc: "(1 Replacement)" },
                  { title: "Back Glass", desc: "(1 Replacement)" },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/10 p-3 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300"
                  >
                    <div className="font-medium text-sm">{item.title}</div>
                    <div className="text-xs text-white/70 mt-1">{item.desc}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <Link
                to="/products"
                className="relative inline-flex items-center justify-center px-8 py-4 overflow-hidden text-lg font-medium text-white rounded-full group bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span className="relative z-10">Shop Now</span>
                <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary-700 to-secondary-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></span>
              </Link>
              <Link
                to="/features"
                className="relative inline-flex items-center justify-center px-8 py-4 overflow-hidden text-lg font-medium text-white rounded-full group border border-white/30 hover:border-white/50 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span className="relative z-10">Explore Features</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Image Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-xl">
              {/* Phone Glow */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary-500/30 rounded-full filter blur-3xl -z-10"></div>
              
              {/* Phone Image */}
              <motion.img
                src={iphoneImage}
                alt="iPhone 16 Pro"
                className="w-full max-w-[500px] mx-auto drop-shadow-2xl"
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                transition={{ 
                  duration: 1.5,
                  delay: 0.8,
                  type: "spring",
                  damping: 10,
                  stiffness: 100
                }}
              />
              
              {/* Floating Icons */}
              {[
                { icon: "🚀", class: "top-10 left-10" },
                { icon: "📱", class: "bottom-20 right-10" },
                { icon: "⚡", class: "top-1/3 right-20" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className={`absolute text-3xl ${item.class}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: 1 + index * 0.2,
                    type: "spring"
                  }}
                  whileHover={{ scale: 1.2 }}
                >
                  {item.icon}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;