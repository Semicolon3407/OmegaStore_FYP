"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Clock } from "lucide-react";

const locations = [
  {
    id: 1,
    name: "Peoples Plaza",
    address: "Newroad, Kathmandu, Nepal",
    phone: "9844708222",
    hours: "Mon-Fri: 9AM-8PM, Sat-Sun: 10AM-6PM",
  },
  {
    id: 2,
    name: "Tamrakar Complex",
    address: "Newroad, Kathmandu, Nepal",
    phone: "9844708222",
    hours: "Mon-Fri: 9AM-8PM, Sat-Sun: 10AM-6PM",
  },
  {
    id: 3,
    name: "Your Plaza",
    address: "Newroad, Kathmandu, Nepal",
    phone: "9844708222",
    hours: "Mon-Fri: 9AM-8PM, Sat-Sun: 10AM-6PM",
  },
];

const Locations = () => {
  return (
    <div className="bg-gray-100 min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12 md:py-16">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 sm:mb-12 text-center border-b border-gray-200 pb-4"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-900 mb-2 sm:mb-3 tracking-tight">
            Our Locations
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-xl sm:max-w-2xl mx-auto leading-relaxed">
            Visit one of our stores in Kathmandu to explore our wide range of tech products.
          </p>
        </motion.div>

        {/* Locations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {locations.map((location, index) => (
            <motion.div
              key={location.id}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <h2 className="text-lg sm:text-xl font-semibold text-blue-900 mb-4 sm:mb-6 tracking-tight">
                {location.name}
              </h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-900 mr-2 sm:mr-3 mt-1" />
                  <p className="text-gray-600 text-sm sm:text-base">{location.address}</p>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-blue-900 mr-2 sm:mr-3" />
                  <p className="text-gray-600 text-sm sm:text-base">{location.phone}</p>
                </div>
                <div className="flex items-start">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-900 mr-2 sm:mr-3 mt-1" />
                  <p className="text-gray-600 text-sm sm:text-base">{location.hours}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Locations;