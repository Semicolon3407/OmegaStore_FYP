import React from "react";
import {
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">
              Omega Store
            </h3>
            <p className="text-gray-400 mb-4">
              Your one-stop shop for modern products.
            </p>
            <div className="space-y-2">
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-2 text-primary-500" />
                <span>9844798222</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-2 text-primary-500" />
                <span>sanup3407@gmail.com</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary-500" />
                <span>Newroad, Kathmandu, Nepal</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/products"
                  className="hover:text-white transition-colors"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/sale" className="hover:text-white transition-colors">
                  Sale
                </Link>
              </li>
              <li>
                <Link
                  to="/warranty"
                  className="hover:text-white transition-colors"
                >
                  Warranty
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              Customer Service
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/profile"
                  className="hover:text-white transition-colors"
                >
                  My Account
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link
                  to="/wishlist"
                  className="hover:text-white transition-colors"
                >
                  Wishlist
                </Link>
              </li>
              <li>
                <Link
                  to="/locations"
                  className="hover:text-white transition-colors"
                >
                  Store Locations
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Twitter className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Instagram className="w-6 h-6" />
              </a>
            </div>
            <div className="mt-6">
              <h5 className="text-white mb-2">Newsletter</h5>
              <form className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="bg-gray-800 text-white px-4 py-2 rounded-l focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
                <button
                  type="submit"
                  className="bg-primary-600 text-white px-4 py-2 rounded-r hover:bg-primary-700 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} Omega Store. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;