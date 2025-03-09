import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ShoppingCart,
  Heart,
  Phone,
  Search,
  ChevronDown,
  Menu,
  User,
  BarChart,
} from "lucide-react";

const Header = () => {
  const [searchCategory, setSearchCategory] = useState("All Categories");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState("admin");
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="w-full bg-white shadow">
      {/* Top Bar */}
      <div className="bg-gray-100 text-sm py-2">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex space-x-4">
            <Link to="/sign-in" className="text-gray-600 hover:text-gray-900">
              Sign In
            </Link>
            <Link to="/contact" className="text-gray-600 hover:text-gray-900">
              Contact Us
            </Link>
            <Link to="/account/create" className="text-gray-600 hover:text-gray-900">
              Create an Account
            </Link>
          </div>
          <Link to="/warranty" className="text-primary-600 font-medium hover:text-primary-700">
            Extended Warranty
          </Link>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-gray-900">
            Omega Store
          </Link>

          {/* Search Bar */}
<div className="hidden md:flex flex-grow max-w-lg">
  <div className="relative flex w-full">
    {/* Select Dropdown with Arrow */}
    <div className="relative">
      <select
        className="h-full rounded-l-md border-r bg-gray-50 px-4 py-2 pr-10 text-sm outline-none appearance-none"
        value={searchCategory}
        onChange={(e) => setSearchCategory(e.target.value)}
      >
        <option>All Categories</option>
        <option>Mobiles</option>
        <option>Laptops</option>
        <option>Accessories</option>
        <option>Headphones</option>
        <option>Earbuds</option>
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
    </div>

    {/* Search Input */}
    <input
      type="text"
      placeholder="Search products..."
      className="flex-grow border px-4 py-2 outline-none focus:ring-2 focus:ring-primary-600"
    />
    <button className="bg-primary-600 text-white px-6 rounded-r-md hover:bg-primary-700">
      <Search className="w-5 h-5" />
    </button>
  </div>
</div>


          {/* Icons */}
          <div className="flex items-center space-x-4">
            <Link to="/profile" className="text-gray-600 hover:text-gray-900">
              <User className="w-6 h-6" />
            </Link>
            <Link to="/wishlist" className="text-gray-600 hover:text-gray-900">
              <Heart className="w-6 h-6" />
            </Link>
            <Link to="/compare" className="text-gray-600 hover:text-gray-900">
              <BarChart className="w-6 h-6" />
            </Link>
            <Link to="/cart" className="relative text-gray-600 hover:text-gray-900">
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                2
              </span>
            </Link>
            <button className="md:hidden text-gray-600 hover:text-gray-900" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`border-b ${isMenuOpen ? "block" : "hidden md:block"}`}>
        <div className="container mx-auto px-4">
          <ul className="flex flex-col md:flex-row md:space-x-6">
            <NavItem to="/products" isActive={isActive}>All Products</NavItem>
            <NavItem to="/sale" isActive={isActive}>Sale</NavItem>
            <NavItem to="/locations" isActive={isActive}>Locations</NavItem>
            <NavItem to="/warranty" isActive={isActive}>Warranty</NavItem>
            <NavItem to="/contact" isActive={isActive}>Contact</NavItem>
            {userRole === "admin" && <NavItem to="/admin" isActive={isActive}>Admin Dashboard</NavItem>}
          </ul>
        </div>
      </nav>
    </header>
  );
};

// NavItem Component for Reusability
const NavItem = ({ to, isActive, children }) => (
  <li className="py-2 md:py-4">
    <Link to={to} className={`${isActive(to) ? "text-primary-600 font-medium" : "text-gray-700"} hover:text-primary-600`}>
      {children}
    </Link>
  </li>
);

export default Header;
