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
    <div className="bg-gray-100 min-h-screen pt-40 lg:pt-32">
      <div className="container mx-auto px-6 py-16">
        <motion.h1
          className="text-3xl md:text-4xl font-bold mb-12 text-center text-gray-900 tracking-tight"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Our Locations
        </motion.h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {locations.map((location, index) => (
            <motion.div
              key={location.id}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <h2 className="text-xl font-semibold mb-4 text-gray-900">{location.name}</h2>
              <div className="flex items-start mb-3">
                <MapPin className="w-5 h-5 text-blue-900 mr-2 mt-1" />
                <p className="text-gray-600">{location.address}</p>
              </div>
              <div className="flex items-center mb-3">
                <Phone className="w-5 h-5 text-blue-900 mr-2" />
                <p className="text-gray-600">{location.phone}</p>
              </div>
              <div className="flex items-start">
                <Clock className="w-5 h-5 text-blue-900 mr-2 mt-1" />
                <p className="text-gray-600">{location.hours}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Locations;