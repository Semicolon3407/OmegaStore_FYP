import React, { useState, useEffect, useRef, Suspense } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { ShoppingCart, Heart, Phone, Search, ChevronDown, Menu, User, LogOut, GitCompare, MessageSquare, Tag } from "lucide-react";
import { useCart } from "../Context/cartContext";
import { useCompare } from "../Context/compareContext.jsx";
import { useWishlist } from "../Context/wishlistContext";
import { useChat } from "../Context/chatContext";
import { toast } from "react-toastify";
import logo from "/assets/images/logo.png";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get("category") || "All Categories";

  const [searchCategory, setSearchCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [auth, setAuth] = useState(() => ({
    isLoggedIn: !!localStorage.getItem("token"),
    userRole: localStorage.getItem("role") || ""
  }));
  const [isScrolled, setIsScrolled] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brandsByCategory, setBrandsByCategory] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { cartItems } = useCart();
  const { compareItems } = useCompare();
  const { wishlistItems } = useWishlist();
  const { unreadCount } = useChat();
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleStorageChange = () => {
      setAuth({
        isLoggedIn: !!localStorage.getItem("token"),
        userRole: localStorage.getItem("role") || ""
      });
    };
    
    const fetchCategoriesAndBrands = async () => {
      try {
        const response = await axios.get("http://localhost:5001/api/products");
        const products = response.data.products || [];
        const uniqueCategories = [...new Set(products.map((p) => p.category))];
        setCategories(uniqueCategories);

        const brandsMap = {};
        uniqueCategories.forEach((cat) => {
          brandsMap[cat] = [...new Set(products.filter((p) => p.category === cat).map((p) => p.brand))];
        });
        setBrandsByCategory(brandsMap);
      } catch (error) {
        console.error("Failed to fetch categories and brands:", error);
        toast.error("Failed to load categories");
      }
    };

    handleStorageChange();
    fetchCategoriesAndBrands();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    setSearchCategory(queryParams.get("category") || "All Categories");
  }, [location.search]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:5001/api/user/logout", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        withCredentials: true,
      });
      localStorage.clear();
      setAuth({ isLoggedIn: false, userRole: "" });
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.clear();
      setAuth({ isLoggedIn: false, userRole: "" });
      toast.info("Session cleared");
      navigate("/");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    const searchParams = new URLSearchParams();
    searchParams.append("search", searchQuery.trim());
    if (searchCategory !== "All Categories") {
      searchParams.append("category", searchCategory);
    }
    navigate(`/products?${searchParams.toString()}`);
    setSearchQuery("");
    setIsMenuOpen(false);
  };

  const handleBrandClick = (brand, category) => {
    const searchParams = new URLSearchParams();
    searchParams.append("brand", brand);
    searchParams.append("category", category);
    navigate(`/products?${searchParams.toString()}`);
    setSearchCategory(category);
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
  };

  const toggleDropdown = (e) => {
    e.preventDefault();
    setIsDropdownOpen((prev) => !prev);
  };

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsDropdownOpen(false), 200);
  };

  const isActive = (path) => location.pathname === path;
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header
      className={`w-full fixed top-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-lg" : "bg-white shadow-md"
      }`}
    >
      {!auth.isLoggedIn && (
        <div className="hidden lg:block bg-blue-900 text-white py-2 text-sm">
          <div className="container mx-auto px-6 flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <Link to="/sign-in" className="flex items-center space-x-2 hover:text-orange-500 transition-colors">
                <User size={16} />
                <span>Sign In</span>
              </Link>
              <Link to="/account/create" className="hover:text-orange-500 transition-colors">
                Create Account
              </Link>
            </div>
            <div className="flex items-center space-x-6">
              <Link to="/warranty" className="hover:text-orange-500 transition-colors">
                Warranty
              </Link>
              <div className="flex items-center space-x-2 hover:text-orange-500 transition-colors">
                <Phone size={16} />
                <span>9844708222</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              className="lg:hidden p-2 rounded-full hover:bg-gray-200 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <Menu size={24} className="text-blue-900" />
            </button>
            <Link to="/" className="text-2xl font-bold tracking-tight">
              <img src={logo} alt="OmegaStore Logo" className="h-20 w-auto" />
            </Link>
          </div>

          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full shadow-sm rounded-full overflow-hidden">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-900" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-32 py-3 border-none focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-200 text-blue-900 placeholder-blue-900"
              />
              <select
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent text-blue-900 focus:outline-none pr-8 appearance-none"
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
              >
                {["All Categories", ...categories].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-900 pointer-events-none" size={16} />
            </div>
          </form>

          <div className="flex items-center space-x-6">
            {auth.isLoggedIn ? (
              <>
                <IconLink to="/wishlist" count={wishlistItems.length} icon={<Heart size={24} />} color="text-blue-900 hover:text-orange-500">
                  Wishlist
                </IconLink>
                <IconLink to="/cart" count={cartItems.length} icon={<ShoppingCart size={24} />} color="text-blue-900 hover:text-orange-500">
                  Cart
                </IconLink>
                <IconLink to="/compare" count={compareItems.length} icon={<GitCompare size={24} />} color="text-blue-900 hover:text-orange-500">
                  Compare
                </IconLink>
                <IconLink to="/chat" count={unreadCount} icon={<MessageSquare size={24} />} color="text-blue-900 hover:text-orange-500">
                  Chat
                </IconLink>
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded-full transition-colors">
                    <div className="w-10 h-10 rounded-full bg-blue-900/10 flex items-center justify-center">
                      <User size={20} className="text-blue-900" />
                    </div>
                    <ChevronDown size={16} className="text-blue-900" />
                  </button>
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="p-4 space-y-2">
                      <MenuItem to="/profile" color="text-blue-900 hover:text-blue-500 hover:bg-gray-100">My Profile</MenuItem>
                      <MenuItem to="/order-history" color="text-blue-900 hover:text-blue-500 hover:bg-gray-100">Order History</MenuItem>
                      <MenuItem to="/coupons" color="text-blue-900 hover:text-blue-500 hover:bg-gray-100">Coupons</MenuItem>
                      {auth.userRole === "admin" && <MenuItem to="/admin" color="text-blue-900 hover:text-blue-500 hover:bg-gray-100">Admin Panel</MenuItem>}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-orange-500 hover:bg-orange-500/10 rounded-lg transition-colors"
                      >
                        <LogOut size={16} className="mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <Link to="/sign-in" className="flex items-center space-x-2 text-blue-900 hover:text-orange-500 transition-colors p-2">
                <User size={24} />
                <span className="hidden xl:inline">Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <nav className={`bg-white border-t border-gray-200 ${isMenuOpen ? "block" : "hidden lg:block"}`}>
        <div className="container mx-auto px-6 py-2">
          <Suspense fallback={<div>Loading navigation...</div>}>
            <ul className="flex flex-col lg:flex-row lg:items-center lg:space-x-8">
              <NavItem to="/" isActive={isActive} onClick={closeMenu} color="text-blue-900 hover:text-blue-500 hover:bg-gray-200 lg:hover:bg-transparent" activeColor="text-orange-500 bg-orange-500/10 lg:bg-transparent lg:border-b-2 lg:border-orange-500">
                Home
              </NavItem>
              <li
                className="w-full lg:w-auto relative group"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  to="/products"
                  onClick={(e) => {
                    if (window.innerWidth < 1024) {
                      e.preventDefault();
                      toggleDropdown(e);
                    } else {
                      closeMenu();
                    }
                  }}
                  className={`block px-4 py-3 lg:py-2 text-base font-medium rounded-lg transition-all ${
                    isActive("/products")
                      ? "text-orange-500 bg-orange-500/10 lg:bg-transparent lg:border-b-2 lg:border-orange-500"
                      : "text-blue-900 hover:text-blue-500 hover:bg-gray-200 lg:hover:bg-transparent"
                  }`}
                >
                  All Products
                  <ChevronDown size={16} className="inline ml-1" />
                </Link>
                {isDropdownOpen && (
                  <div
                    ref={dropdownRef}
                    className="lg:absolute left-0 top-full w-full lg:w-[48rem] bg-white rounded-xl shadow-xl border border-gray-200 z-50 p-4 max-h-96 overflow-y-auto"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                      {categories.map((category) => (
                        <div key={category} className="flex flex-col">
                          <h3 className="font-semibold text-blue-900 px-2 py-1 capitalize">{category}</h3>
                          <ul className="pl-2 space-y-1">
                            {brandsByCategory[category]?.map((brand) => (
                              <li key={brand}>
                                <button
                                  onClick={() => handleBrandClick(brand, category)}
                                  className="block w-full text-left px-2 py-1 text-sm text-blue-900 hover:text-blue-500 hover:bg-gray-100 rounded-lg transition-colors capitalize"
                                >
                                  {brand}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </li>
              <NavItem to="/sale" isActive={isActive} onClick={closeMenu} color="text-blue-900 hover:text-blue-500 hover:bg-gray-200 lg:hover:bg-transparent" activeColor="text-orange-500 bg-orange-500/10 lg:bg-transparent lg:border-b-2 lg:border-orange-500">
                Sale
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500 text-white">
                  HOT
                </span>
              </NavItem>
              <NavItem to="/locations" isActive={isActive} onClick={closeMenu} color="text-blue-900 hover:text-blue-500 hover:bg-gray-200 lg:hover:bg-transparent" activeColor="text-orange-500 bg-orange-500/10 lg:bg-transparent lg:border-b-2 lg:border-orange-500">
                Stores
              </NavItem>
              <NavItem to="/warranty" isActive={isActive} onClick={closeMenu} color="text-blue-900 hover:text-blue-500 hover:bg-gray-200 lg:hover:bg-transparent" activeColor="text-orange-500 bg-orange-500/10 lg:bg-transparent lg:border-b-2 lg:border-orange-500">
                Warranty
              </NavItem>
            </ul>
          </Suspense>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="lg:hidden px-6 py-4 bg-gray-200 border-t border-gray-200">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-900" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-blue-900 placeholder-blue-900"
              />
            </div>
            <select
              className="w-full mt-2 py-3 px-3 rounded-lg border border-gray-200 focus:outline-none bg-white text-blue-900"
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
            >
              {["All Categories", ...categories].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </form>
          <div className="space-y-2">
            {!auth.isLoggedIn ? (
              <>
                <Link to="/sign-in" className="block py-2 px-4 text-blue-900 hover:bg-white rounded-lg" onClick={closeMenu}>
                  Sign In
                </Link>
                <Link to="/account/create" className="block py-2 px-4 text-blue-900 hover:bg-white rounded-lg" onClick={closeMenu}>
                  Create Account
                </Link>
              </>
            ) : (
              <>
                <Link to="/profile" className="block py-2 px-4 text-blue-900 hover:bg-white rounded-lg" onClick={closeMenu}>
                  My Profile
                </Link>
                <Link to="/order-history" className="block py-2 px-4 text-blue-900 hover:bg-white rounded-lg" onClick={closeMenu}>
                  Order History
                </Link>
                <Link to="/coupons" className="block py-2 px-4 text-blue-900 hover:bg-white rounded-lg" onClick={closeMenu}>
                  Coupons
                </Link>
                {auth.userRole === "admin" && (
                  <Link to="/admin" className="block py-2 px-4 text-blue-900 hover:bg-white rounded-lg" onClick={closeMenu}>
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2 px-4 text-orange-500 hover:bg-orange-500/10 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

const NavItem = React.memo(({ to, isActive, children, onClick, color, activeColor }) => (
  <li className="w-full lg:w-auto">
    <Link
      to={to}
      onClick={onClick}
      className={`block px-4 py-3 lg:py-2 text-base font-medium rounded-lg transition-all ${
        isActive(to) ? activeColor : color
      }`}
    >
      {children}
    </Link>
  </li>
));

const IconLink = React.memo(({ to, count, icon, children, color }) => (
  <Link to={to} className={`relative p-2 group ${color} transition-colors`}>
    {icon}
    {count > 0 && (
      <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
        {count}
      </span>
    )}
    <span className="sr-only">{children}</span>
  </Link>
));

const MenuItem = React.memo(({ to, children, color }) => (
  <Link to={to} className={`block px-4 py-2 text-base rounded-lg transition-colors ${color}`}>
    {children}
  </Link>
));

export default Header;