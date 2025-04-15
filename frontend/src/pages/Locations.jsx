"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Clock, Navigation } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Component to update map center when activeLocation changes
function MapCenterUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15, { 
        duration: 1.5,
        animate: true
      });
    }
  }, [center, map]);
  return null;
}

const locations = [
  {
    id: 1,
    name: "Peoples Plaza",
    address: "Newroad, Kathmandu, Nepal",
    phone: "9844708222",
    hours: "Mon-Fri: 9AM-8PM, Sat-Sun: 10AM-6PM",
    coordinates: [27.7029, 85.3071] // [latitude, longitude] for Peoples Plaza
  },
  {
    id: 2,
    name: "Tamrakar Complex",
    address: "Newroad, Kathmandu, Nepal",
    phone: "9844708222",
    hours: "Mon-Fri: 9AM-8PM, Sat-Sun: 10AM-6PM",
    coordinates: [27.7052, 85.3082] // [latitude, longitude] for Tamrakar Complex
  },
  {
    id: 3,
    name: "Civil Mall",
    address: "Newroad, Kathmandu, Nepal",
    phone: "9844708222",
    hours: "Mon-Fri: 9AM-8PM, Sat-Sun: 10AM-6PM",
    coordinates: [27.7010, 85.3120] // [latitude, longitude] for Your Plaza
  },
];

const Locations = () => {
  const [activeLocation, setActiveLocation] = useState(null);
  const kathmandu = [27.7172, 85.3240]; // Center of Kathmandu

  const handleLocationClick = (location) => {
    setActiveLocation(location);
    // Scroll to map section on mobile
    if (window.innerWidth < 768) {
      document.getElementById('map-section').scrollIntoView({ behavior: 'smooth' });
    }
  };

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

        {/* Mobile Layout (Stacked) */}
        <div className="block md:hidden">
          {/* Locations Cards (Mobile) */}
          <div className="mb-6">
            <div className="grid grid-cols-1 gap-4">
              {locations.map((location, index) => (
                <motion.div
                  key={location.id}
                  className={`bg-white rounded-xl shadow-lg border border-gray-200 p-4 cursor-pointer transition-all duration-300 hover:shadow-xl ${
                    activeLocation?.id === location.id ? "ring-2 ring-blue-500" : ""
                  }`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => handleLocationClick(location)}
                >
                  <h2 className="text-lg font-semibold text-blue-900 mb-3 tracking-tight">
                    {location.name}
                  </h2>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 text-blue-900 mr-2 mt-1 flex-shrink-0" />
                      <p className="text-gray-600 text-sm">{location.address}</p>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-blue-900 mr-2 flex-shrink-0" />
                      <p className="text-gray-600 text-sm">{location.phone}</p>
                    </div>
                    <div className="flex items-start">
                      <Clock className="w-4 h-4 text-blue-900 mr-2 mt-1 flex-shrink-0" />
                      <p className="text-gray-600 text-sm">{location.hours}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Map (Mobile) */}
          <motion.div
            id="map-section"
            className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden h-[350px] w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <MapContainer
              center={activeLocation ? activeLocation.coordinates : kathmandu}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
              zoomControl={false} // Move zoom control to right side
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {locations.map((location) => (
                <Marker
                  key={location.id}
                  position={location.coordinates}
                >
                  <Popup>
                    <div className="p-1">
                      <h3 className="font-bold text-blue-900 text-sm">{location.name}</h3>
                      <p className="text-xs text-gray-600">{location.address}</p>
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${location.coordinates[0]},${location.coordinates[1]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center mt-1 text-xs text-blue-500 hover:text-blue-700"
                      >
                        <Navigation size={12} className="mr-1" />
                        Get Directions
                      </a>
                    </div>
                  </Popup>
                </Marker>
              ))}
              <MapCenterUpdater center={activeLocation?.coordinates} />
              <div className="leaflet-control-zoom leaflet-bar leaflet-control" style={{ position: 'absolute', right: '10px', top: '10px' }}></div>
            </MapContainer>
          </motion.div>
        </div>

        {/* Desktop Layout (Two Columns) */}
        <div className="hidden md:grid md:grid-cols-2 gap-8">
          {/* Map (Desktop) */}
          <motion.div
            className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="h-[500px] w-full">
              <MapContainer
                center={activeLocation ? activeLocation.coordinates : kathmandu}
                zoom={14}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {locations.map((location) => (
                  <Marker
                    key={location.id}
                    position={location.coordinates}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-bold text-blue-900">{location.name}</h3>
                        <p className="text-sm text-gray-600">{location.address}</p>
                        <p className="text-sm text-gray-600">{location.phone}</p>
                        <a 
                          href={`https://www.google.com/maps/dir/?api=1&destination=${location.coordinates[0]},${location.coordinates[1]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center mt-2 text-sm text-blue-500 hover:text-blue-700"
                        >
                          <Navigation size={14} className="mr-1" />
                          Get Directions
                        </a>
                      </div>
                    </Popup>
                  </Marker>
                ))}
                <MapCenterUpdater center={activeLocation?.coordinates} />
              </MapContainer>
            </div>
          </motion.div>

          {/* Locations Cards (Desktop) */}
          <div>
            <div className="space-y-4">
              {locations.map((location, index) => (
                <motion.div
                  key={location.id}
                  className={`bg-white rounded-xl shadow-lg border border-gray-200 p-5 cursor-pointer transition-all duration-300 hover:shadow-xl ${
                    activeLocation?.id === location.id ? "ring-2 ring-blue-500" : ""
                  }`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => handleLocationClick(location)}
                >
                  <h2 className="text-xl font-semibold text-blue-900 mb-4 tracking-tight">
                    {location.name}
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 text-blue-900 mr-3 mt-1 flex-shrink-0" />
                      <p className="text-gray-600">{location.address}</p>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 text-blue-900 mr-3 flex-shrink-0" />
                      <p className="text-gray-600">{location.phone}</p>
                    </div>
                    <div className="flex items-start">
                      <Clock className="w-5 h-5 text-blue-900 mr-3 mt-1 flex-shrink-0" />
                      <p className="text-gray-600">{location.hours}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${location.coordinates[0]},${location.coordinates[1]}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-500 hover:text-blue-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Navigation size={16} className="mr-1" />
                      Get Directions
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Locations;