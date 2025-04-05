"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, Check, AlertCircle } from "lucide-react";

const warrantyFeatures = [
  "Extended coverage for up to 3 years",
  "Accidental damage protection",
  "Free repairs or replacements",
  "24/7 customer support",
  "Transferable warranty",
  "No deductibles or hidden fees",
];

const Warranty = () => {
  return (
    <div className="bg-gray-100 min-h-screen pt-40 lg:pt-32">
      <div className="container mx-auto px-6 py-16">
        <motion.h1
          className="text-3xl md:text-4xl font-bold mb-12 text-center text-gray-900 tracking-tight"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Extended Warranty
        </motion.h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-semibold mb-4 flex items-center text-gray-900">
              <Shield className="w-6 h-6 text-blue-900 mr-2" />
              Warranty Features
            </h2>
            <ul className="space-y-3">
              {warrantyFeatures.map((feature, index) => (
                <motion.li
                  key={index}
                  className="flex items-center text-gray-700"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Check className="w-5 h-5 text-green-600 mr-2" />
                  {feature}
                </motion.li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Why Choose Our Warranty?</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Our extended warranty program provides peace of mind and protection
              for your valuable purchases. With comprehensive coverage and
              exceptional customer service, you can enjoy your products
              worry-free.
            </p>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">How It Works</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Purchase the extended warranty with your product</li>
              <li>Register your warranty online or in-store</li>
              <li>If an issue arises, contact our support team</li>
              <li>We'll repair or replace your product at no additional cost</li>
            </ol>
            <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Remember to activate your warranty within 30 days of purchase
                    for immediate coverage!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Warranty;