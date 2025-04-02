import React from "react";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">Omega Store</h3>
            <p className="text-sm md:text-base text-gray-400 max-w-xs">
              Your premier destination for cutting-edge technology and innovation.
            </p>
            <div className="space-y-3 text-sm md:text-base">
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-blue-500" />
                <span>+977 984-479-8222</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-blue-500" />
                <a href="mailto:sanup3407@gmail.com" className="hover:text-white transition-colors duration-200">
                  sanup3407@gmail.com
                </a>
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-3 text-blue-500" />
                <span>Newroad, Kathmandu, Nepal</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm md:text-base">
              <li>
                <Link to="/products" className="hover:text-blue-400 transition-colors duration-200">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/sale" className="hover:text-blue-400 transition-colors duration-200">
                  Sale
                </Link>
              </li>
              <li>
                <Link to="/warranty" className="hover:text-blue-400 transition-colors duration-200">
                  Warranty
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-blue-400 transition-colors duration-200">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6">Customer Service</h4>
            <ul className="space-y-3 text-sm md:text-base">
              <li>
                <Link to="/profile" className="hover:text-blue-400 transition-colors duration-200">
                  My Account
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-blue-400 transition-colors duration-200">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-blue-400 transition-colors duration-200">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link to="/locations" className="hover:text-blue-400 transition-colors duration-200">
                  Store Locations
                </Link>
              </li>
            </ul>
          </div>

          {/* Social & Newsletter */}
          <div className="space-y-6">
            <div>
              <h4 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6">Connect With Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-200 transform hover:scale-110">
                  <Facebook className="w-6 h-6" />
                  <span className="sr-only">Facebook</span>
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-200 transform hover:scale-110">
                  <Twitter className="w-6 h-6" />
                  <span className="sr-only">Twitter</span>
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-200 transform hover:scale-110">
                  <Instagram className="w-6 h-6" />
                  <span className="sr-only">Instagram</span>
                </a>
              </div>
            </div>
            <div>
              <h5 className="text-base md:text-lg font-medium text-white mb-3">Newsletter</h5>
              <form className="flex w-full max-w-sm">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-grow bg-gray-800 text-white px-4 py-2.5 rounded-l-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2.5 rounded-r-lg hover:bg-blue-700 transition-colors duration-300 font-medium text-sm"
                >
                  Subscribe
                </button>
              </form>
              <p className="text-xs text-gray-500 mt-2">Stay updated with our latest offers</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 pt-8 border-t border-gray-800 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Omega Store. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;