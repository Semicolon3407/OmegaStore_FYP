import React from "react";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-100 text-blue-900 border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-8 sm:py-10 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12">
          {/* Brand Section */}
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              <span className="text-blue-900">Omega</span>
              <span className="text-orange-500">Store</span>
            </h3>
            <p className="text-sm sm:text-base text-blue-900/80 max-w-xs leading-relaxed">
              Your premier destination for cutting-edge technology and innovation.
            </p>
            <div className="space-y-3 text-sm sm:text-base">
              <div className="flex items-center group">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-3 text-blue-900 transition-colors group-hover:text-blue-500" />
                <span className="group-hover:text-blue-500 transition-colors">+977 984-479-8222</span>
              </div>
              <div className="flex items-center group">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-3 text-blue-900 transition-colors group-hover:text-blue-500" />
                <a
                  href="mailto:sanup3407@gmail.com"
                  className="group-hover:text-blue-500 transition-colors duration-200"
                >
                  sanup3407@gmail.com
                </a>
              </div>
              <div className="flex items-center group">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-3 text-blue-900 transition-colors group-hover:text-blue-500" />
                <span className="group-hover:text-blue-500 transition-colors">Newroad, Kathmandu, Nepal</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg sm:text-xl font-semibold text-blue-900 mb-4 sm:mb-6">Quick Links</h4>
            <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base">
              {[
                { to: "/products", label: "All Products" },
                { to: "/sale", label: "Sale" },
                { to: "/warranty", label: "Warranty" },
                { to: "/contact", label: "Contact" },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-blue-900 hover:text-blue-500 transition-colors duration-200 flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg sm:text-xl font-semibold text-blue-900 mb-4 sm:mb-6">Customer Service</h4>
            <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base">
              {[
                { to: "/profile", label: "My Account" },
                { to: "/cart", label: "Shopping Cart" },
                { to: "/wishlist", label: "Wishlist" },
                { to: "/locations", label: "Store Locations" },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-blue-900 hover:text-blue-500 transition-colors duration-200 flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Newsletter */}
          <div className="space-y-6 sm:space-y-8">
            <div>
              <h4 className="text-lg sm:text-xl font-semibold text-blue-900 mb-4 sm:mb-6">Connect With Us</h4>
              <div className="flex space-x-4 sm:space-x-6">
                {[
                  { icon: Facebook, label: "Facebook" },
                  { icon: Twitter, label: "Twitter" },
                  { icon: Instagram, label: "Instagram" },
                ].map((social, index) => (
                  <a
                    key={index}
                    href="#"
                    className="text-blue-900 hover:text-blue-500 transition-all duration-200 transform hover:scale-105"
                  >
                    <social.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="sr-only">{social.label}</span>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h5 className="text-base sm:text-lg font-medium text-blue-900 mb-3 sm:mb-4">Newsletter</h5>
              <form className="flex w-full max-w-xs sm:max-w-sm">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-grow bg-gray-200 text-blue-900 px-3 sm:px-4 py-2 sm:py-3 rounded-l-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                />
                <button
                  type="submit"
                  className="bg-blue-900 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-r-lg hover:bg-blue-800 transition-all duration-200 font-medium text-xs sm:text-sm"
                >
                  Subscribe
                </button>
              </form>
              <p className="text-xs text-blue-900/80 mt-2 sm:mt-3">Stay updated with our latest offers</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 sm:mt-10 lg:mt-12 pt-6 sm:pt-8 border-t border-gray-200 text-center">
          <p className="text-xs sm:text-sm text-blue-900/80">
            © {new Date().getFullYear()} Omega Store. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;