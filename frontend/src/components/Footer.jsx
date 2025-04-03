import React from "react";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-gray-300">
      <div className="container mx-auto px-6 md:px-12 lg:px-20 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              <span className="text-white">Omega</span>
              <span className="text-blue-400">Store</span>
            </h3>
            <p className="text-base text-gray-400 max-w-xs leading-relaxed">
              Your premier destination for cutting-edge technology and innovation.
            </p>
            <div className="space-y-4 text-base">
              <div className="flex items-center group">
                <Phone className="w-5 h-5 mr-3 text-blue-400 transition-colors group-hover:text-blue-300" />
                <span className="group-hover:text-white transition-colors">+977 984-479-8222</span>
              </div>
              <div className="flex items-center group">
                <Mail className="w-5 h-5 mr-3 text-blue-400 transition-colors group-hover:text-blue-300" />
                <a
                  href="mailto:sanup3407@gmail.com"
                  className="group-hover:text-white transition-colors duration-200"
                >
                  sanup3407@gmail.com
                </a>
              </div>
              <div className="flex items-center group">
                <MapPin className="w-5 h-5 mr-3 text-blue-400 transition-colors group-hover:text-blue-300" />
                <span className="group-hover:text-white transition-colors">Newroad, Kathmandu, Nepal</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-semibold text-white mb-6">Quick Links</h4>
            <ul className="space-y-4 text-base">
              {[
                { to: "/products", label: "All Products" },
                { to: "/sale", label: "Sale" },
                { to: "/warranty", label: "Warranty" },
                { to: "/contact", label: "Contact" },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-xl font-semibold text-white mb-6">Customer Service</h4>
            <ul className="space-y-4 text-base">
              {[
                { to: "/profile", label: "My Account" },
                { to: "/cart", label: "Shopping Cart" },
                { to: "/wishlist", label: "Wishlist" },
                { to: "/locations", label: "Store Locations" },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Newsletter */}
          <div className="space-y-8">
            <div>
              <h4 className="text-xl font-semibold text-white mb-6">Connect With Us</h4>
              <div className="flex space-x-6">
                {[
                  { icon: Facebook, label: "Facebook" },
                  { icon: Twitter, label: "Twitter" },
                  { icon: Instagram, label: "Instagram" },
                ].map((social, index) => (
                  <a
                    key={index}
                    href="#"
                    className="text-gray-400 hover:text-blue-400 transition-all duration-300 transform hover:scale-110 group"
                  >
                    <social.icon className="w-6 h-6" />
                    <span className="sr-only">{social.label}</span>
                    <div className="absolute -bottom-1 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300"></div>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h5 className="text-lg font-medium text-white mb-4">Newsletter</h5>
              <form className="flex w-full max-w-sm">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-grow bg-gray-800/50 text-white px-4 py-3 rounded-l-full border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-sm backdrop-blur-sm"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-r-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium text-sm shadow-md hover:shadow-lg"
                >
                  Subscribe
                </button>
              </form>
              <p className="text-xs text-gray-500 mt-3">Stay updated with our latest offers</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-800/50 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Omega Store. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;