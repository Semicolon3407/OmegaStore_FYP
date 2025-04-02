import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { ShoppingCart, Heart, Phone, Search, ChevronDown, Menu, User, BarChart, LogOut } from "lucide-react";
import { useCart } from "../Context/cartContext";
import { useWishlist } from "../Context/wishlistContext";
import { toast } from "react-toastify";

const Header = () => {
  const [searchCategory, setSearchCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const { cartItems } = useCart();
  const { wishlistItems, fetchWishlist } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();

  // Check if current path is admin path
  const isAdminRoute = location.pathname.includes('/admin');
  
  // If we're on an admin route, don't render the regular header
  if (isAdminRoute) {
    return null;
  }

  const checkAuthStatus = useCallback(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    setIsLoggedIn(!!token);
    setUserRole(role || "");
    
    if (token) {
      fetchWishlist().catch(console.error);
    }
  }, [fetchWishlist]);

  useEffect(() => {
    checkAuthStatus();
    
    const handleStorageChange = () => checkAuthStatus();
    window.addEventListener('storage', handleStorageChange);
    
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [checkAuthStatus]);

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:5001/api/user/logout", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        withCredentials: true,
      });
      localStorage.clear();
      setIsLoggedIn(false);
      setUserRole("");
      toast.success("Logged out successfully");
      navigate("/");
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.clear();
      setIsLoggedIn(false);
      setUserRole("");
      toast.info("Session cleared");
      navigate("/");
      window.dispatchEvent(new Event('storage'));
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const searchParams = new URLSearchParams();
      searchParams.append("search", searchQuery.trim());
      if (searchCategory !== "All Categories") {
        searchParams.append("category", searchCategory);
      }
      navigate(`/products?${searchParams.toString()}`);
      setSearchQuery("");
      setIsMenuOpen(false);
    }
  };

  const isActive = (path) => location.pathname === path;
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className={`w-full bg-white fixed top-0 z-50 transition-all duration-300 ${isScrolled ? "shadow-md" : "shadow-sm"}`}>
      {/* Top Bar - Hidden on mobile */}
      {!isLoggedIn && (
        <div className="hidden sm:block bg-gray-800 text-gray-100 py-2.5 text-sm">
          <div className="container mx-auto px-4 sm:px-6 flex justify-between items-center">
            <div className="flex items-center space-x-4 sm:space-x-6">
              <Link to="/sign-in" className="flex items-center space-x-1 hover:text-blue-400 transition-colors duration-200">
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
              <Link to="/account/create" className="hover:text-blue-400 transition-colors duration-200">
                Create Account
              </Link>
            </div>
            <div className="flex items-center space-x-4 sm:space-x-6">
              <Link to="/warranty" className="hover:text-blue-400 transition-colors duration-200">
                Warranty
              </Link>
              <div className="flex items-center space-x-1 hover:text-blue-400 transition-colors duration-200">
                <Phone className="w-4 h-4" />
                <span>1-800-OMEGA</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        {/* Logo and Menu Button */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <Link to="/" className="flex items-center space-x-1 text-xl sm:text-2xl font-semibold tracking-tight">
            <span className="text-gray-900">Omega</span>
            <span className="text-blue-600">Store</span>
          </Link>
        </div>

        {/* Search Bar - Hidden on mobile */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xs lg:max-w-xl mx-4 lg:mx-8">
          <div className="relative w-full group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-20 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200 bg-gray-50 text-gray-700 text-sm lg:text-base"
            />
            <select
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent text-sm text-gray-600 focus:outline-none w-24 lg:w-32"
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
          </div>
        </form>

        {/* Icons and User Menu */}
        <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6">
          {isLoggedIn ? (
            <>
              <IconLink to="/wishlist" count={wishlistItems.length} icon={<Heart className="w-5 h-5 sm:w-6 sm:h-6" />}>
                Wishlist
              </IconLink>
              <IconLink to="/cart" count={cartItems.length} icon={<ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />}>
                Cart
              </IconLink>
              <div className="relative group">
                <button className="flex items-center space-x-1 sm:space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-50 flex items-center justify-center">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <span className="hidden lg:inline text-gray-700 font-medium text-sm">Account</span>
                  <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
                </button>
                <div className="absolute right-0 mt-2 w-52 sm:w-56 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-2">
                    <MenuItem to="/profile">My Profile</MenuItem>
                    <MenuItem to="/order-history">Order History</MenuItem>
                    {userRole === "admin" && <MenuItem to="/admin">Admin Panel</MenuItem>}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <Link
              to="/sign-in"
              className="flex items-center space-x-1 sm:space-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 p-2"
            >
              <User className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="hidden sm:inline text-sm">Sign In</span>
            </Link>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className={`bg-white border-t border-gray-100 ${isMenuOpen ? "block" : "hidden md:block"}`}>
        <div className="container mx-auto px-4 sm:px-6 py-2">
          <ul className="flex flex-col md:flex-row md:items-center md:space-x-2 lg:space-x-8">
            <NavItem to="/" isActive={isActive} onClick={closeMenu}>
              Home
            </NavItem>
            <NavItem to="/products" isActive={isActive} onClick={closeMenu}>
              All Products
            </NavItem>
            <NavItem to="/sale" isActive={isActive} onClick={closeMenu}>
              Sale
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                HOT
              </span>
            </NavItem>
            <NavItem to="/locations" isActive={isActive} onClick={closeMenu}>
              Stores
            </NavItem>
            <NavItem to="/warranty" isActive={isActive} onClick={closeMenu}>
              Support
            </NavItem>
          </ul>
        </div>
      </nav>

      {/* Mobile Search and Menu */}
      {isMenuOpen && (
        <div className="md:hidden px-4 py-4 bg-gray-50 border-t border-gray-200">
          <div className="space-y-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none bg-white text-sm"
                />
              </div>
              <select
                className="w-full mt-2 py-2.5 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
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
            </form>
            {!isLoggedIn && (
              <div className="space-y-2">
                <Link
                  to="/sign-in"
                  className="block w-full py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                  onClick={closeMenu}
                >
                  Sign In
                </Link>
                <Link
                  to="/account/create"
                  className="block w-full py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                  onClick={closeMenu}
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

const NavItem = ({ to, isActive, children, onClick }) => (
  <li className="w-full md:w-auto">
    <Link
      to={to}
      onClick={onClick}
      className={`block px-4 py-3 md:py-2 text-sm font-medium rounded-lg transition-all duration-200 w-full ${
        isActive(to)
          ? "text-blue-600 bg-blue-50 md:bg-transparent md:border-b-2 md:border-blue-600"
          : "text-gray-600 hover:text-blue-600 hover:bg-gray-50 md:hover:bg-transparent"
      }`}
    >
      {children}
    </Link>
  </li>
);

const IconLink = ({ to, count, icon, children }) => (
  <Link to={to} className="relative p-1 sm:p-2 group">
    <span className="text-gray-600 hover:text-blue-600 transition-colors duration-200">{icon}</span>
    {count > 0 && (
      <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-medium rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
        {count}
      </span>
    )}
    <span className="sr-only">{children}</span>
  </Link>
);

const MenuItem = ({ to, children }) => (
  <Link
    to={to}
    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
  >
    {children}
  </Link>
);

export default Header;