import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { ShoppingCart, Heart, Phone, Search, ChevronDown, Menu, User, BarChart, LogOut, Scale, GitCompare } from "lucide-react";
import { useCart } from "../Context/cartContext";
import { useCompare } from "../Context/compareContext.jsx"; // Adjust extension if needed
import { toast } from "react-toastify";

const Header = () => {
  const [searchCategory, setSearchCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const { cartItems } = useCart();
  const { compareItems } = useCompare();
  const location = useLocation();
  const navigate = useNavigate();

  // Listen for location changes to update wishlist count when navigating
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    setIsLoggedIn(!!token);
    setUserRole(role || "");

    if (token) {
      fetchWishlistCount();
    } else {
      setWishlistCount(0);
    }
  }, [location.pathname]); // Re-run when route changes

  // Set up scroll listener separately to avoid unnecessary API calls
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Dedicated effect for wishlist count with polling interval
  useEffect(() => {
    if (!isLoggedIn) return;
    
    // Initial fetch
    fetchWishlistCount();
    
    // Optional: Set up polling to keep wishlist count updated
    const intervalId = setInterval(fetchWishlistCount, 60000); // Update every minute
    
    return () => clearInterval(intervalId);
  }, [isLoggedIn, compareItems]); // Re-run when login status changes

  const fetchWishlistCount = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    try {
      const response = await axios.get("http://localhost:5001/api/user/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlistCount(response.data.wishlist?.length || 0);
    } catch (error) {
      console.error("Failed to fetch wishlist count:", error);
      // Handle unauthorized errors specifically
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        // Token may be invalid, clear it
        setWishlistCount(0);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:5001/api/user/logout", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        withCredentials: true,
      });
      localStorage.clear();
      setIsLoggedIn(false);
      setUserRole("");
      setWishlistCount(0);
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.clear();
      setIsLoggedIn(false);
      setUserRole("");
      setWishlistCount(0);
      toast.info("Session cleared");
      navigate("/");
    }
  };

  // Add public method to refresh wishlist count
  const refreshWishlist = () => {
    if (isLoggedIn) {
      fetchWishlistCount();
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
    <header className={`w-full fixed top-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white shadow-lg" : "bg-white shadow-sm"}`}>
      {!isLoggedIn && (
        <div className="hidden lg:block bg-gray-900 text-white py-2 text-sm">
          <div className="container mx-auto px-6 flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <Link to="/sign-in" className="flex items-center space-x-2 hover:text-blue-300 transition-colors">
                <User size={16} />
                <span>Sign In</span>
              </Link>
              <Link to="/account/create" className="hover:text-blue-300 transition-colors">
                Create Account
              </Link>
            </div>
            <div className="flex items-center space-x-6">
              <Link to="/warranty" className="hover:text-blue-300 transition-colors">
                Warranty
              </Link>
              <div className="flex items-center space-x-2 hover:text-blue-300 transition-colors">
                <Phone size={16} />
                <span>1-800-OMEGA</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <Menu size={24} className="text-gray-700" />
            </button>
            <Link to="/" className="text-2xl font-bold tracking-tight">
              <span className="text-gray-900">Omega</span>
              <span className="text-blue-600">Store</span>
            </Link>
          </div>

          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full shadow-sm rounded-full overflow-hidden">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-32 py-3 border-none focus:ring-2 focus:ring-blue-200 focus:outline-none bg-gray-100 text-gray-700"
              />
              <select
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent text-gray-600 focus:outline-none pr-8 appearance-none"
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
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </form>

          <div className="flex items-center space-x-6">
            {isLoggedIn ? (
              <>
                <IconLink to="/wishlist" count={wishlistCount} icon={<Heart size={24} />} onClick={refreshWishlist}>
                  Wishlist
                </IconLink>
                <IconLink to="/cart" count={cartItems.length} icon={<ShoppingCart size={24} />}>
                  Cart
                </IconLink>
                <IconLink to="/compare" count={compareItems.length} icon={<GitCompare size={24} />}>
                  Compare
                </IconLink>
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User size={20} className="text-blue-600" />
                    </div>
                    <ChevronDown size={16} className="text-gray-600" />
                  </button>
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="p-4 space-y-2">
                      <MenuItem to="/profile" onClick={refreshWishlist}>My Profile</MenuItem>
                      <MenuItem to="/order-history" onClick={refreshWishlist}>Order History</MenuItem>
                      {userRole === "admin" && <MenuItem to="/admin" onClick={refreshWishlist}>Admin Panel</MenuItem>}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut size={16} className="mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <Link to="/sign-in" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors p-2">
                <User size={24} />
                <span className="hidden xl:inline">Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <nav className={`bg-white border-t border-gray-100 ${isMenuOpen ? "block" : "hidden lg:block"}`}>
        <div className="container mx-auto px-6 py-2">
          <ul className="flex flex-col lg:flex-row lg:items-center lg:space-x-8">
            <NavItem to="/" isActive={isActive} onClick={closeMenu}>Home</NavItem>
            <NavItem to="/products" isActive={isActive} onClick={closeMenu}>All Products</NavItem>
            <NavItem to="/sale" isActive={isActive} onClick={closeMenu}>
              Sale
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                HOT
              </span>
            </NavItem>
            <NavItem to="/locations" isActive={isActive} onClick={closeMenu}>Stores</NavItem>
            <NavItem to="/warranty" isActive={isActive} onClick={closeMenu}>Support</NavItem>
          </ul>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="lg:hidden px-6 py-4 bg-gray-50 border-t border-gray-200">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              />
            </div>
            <select
              className="w-full mt-2 py-3 px-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-200 focus:outline-none"
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
              <Link to="/sign-in" className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-lg" onClick={closeMenu}>
                Sign In
              </Link>
              <Link to="/account/create" className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-lg" onClick={closeMenu}>
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

const NavItem = ({ to, isActive, children, onClick }) => (
  <li className="w-full lg:w-auto">
    <Link
      to={to}
      onClick={onClick}
      className={`block px-4 py-3 lg:py-2 text-base font-medium rounded-lg transition-all ${
        isActive(to)
          ? "text-blue-600 bg-blue-50 lg:bg-transparent lg:border-b-2 lg:border-blue-600"
          : "text-gray-700 hover:text-blue-600 hover:bg-gray-50 lg:hover:bg-transparent"
      }`}
    >
      {children}
    </Link>
  </li>
);

const IconLink = ({ to, count, icon, children, onClick }) => (
  <Link to={to} className="relative p-2 group" onClick={onClick}>
    <span className="text-gray-700 hover:text-blue-600 transition-colors">{icon}</span>
    {count > 0 && (
      <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
        {count}
      </span>
    )}
    <span className="sr-only">{children}</span>
  </Link>
);

const MenuItem = ({ to, children, onClick }) => (
  <Link
    to={to}
    className="block px-4 py-2 text-base text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
    onClick={onClick}
  >
    {children}
  </Link>
);

export default Header;