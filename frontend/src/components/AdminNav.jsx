import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Home, Box, ShoppingCart, Users, BarChart2, DollarSign, Menu, X, LogOut, ChevronRight, MessageSquare } from "lucide-react";
import { toast } from "react-toastify";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");

  const navLinks = [
    { title: "Dashboard", path: "/admin", icon: <Home size={18} /> },
    { title: "Products", path: "/admin/products", icon: <Box size={18} /> },
    { title: "Orders", path: "/admin/orders", icon: <ShoppingCart size={18} /> },
    { title: "Users", path: "/admin/users", icon: <Users size={18} /> },
    { title: "Chat", path: "/admin/chat", icon: <MessageSquare size={18} /> },
    { title: "Analytics", path: "/admin/analytics", icon: <BarChart2 size={18} /> },
    { title: "Revenue", path: "/admin/revenue", icon: <DollarSign size={18} /> },
  ];

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role"); // Changed from "admin" to "role"
      setIsLoggedIn(!!token);
      setUserRole(role || "");
    };

    checkAuthStatus();

    window.addEventListener("storage", checkAuthStatus);

    const handleRouteChange = () => setIsMenuOpen(false);
    window.addEventListener("popstate", handleRouteChange);

    return () => {
      window.removeEventListener("storage", checkAuthStatus);
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:5001/api/user/logout", {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error.response?.data || error.message);
      toast.info("Session cleared");
    } finally {
      localStorage.clear();
      setIsLoggedIn(false);
      setUserRole("");
      setIsMenuOpen(false);
      navigate("/", { replace: true });
      window.dispatchEvent(new Event("storage"));
    }
  };

  const isActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav className="hidden md:block bg-gray-800 text-white sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/admin" className="text-2xl font-bold flex items-center gap-2 hover:text-yellow-400 transition-colors">
            <span className="text-yellow-400 font-bold">Ω</span>
            <span>Omega Admin</span>
          </Link>
          <ul className="flex items-center space-x-1 lg:space-x-4">
            {navLinks.map((link, index) => (
              <li key={index}>
                <Link
                  to={link.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 ${
                    isActive(link.path) ? "text-yellow-400 font-medium bg-gray-700" : "hover:text-yellow-400 hover:bg-gray-700"
                  }`}
                >
                  {link.icon}
                  <span className="hidden lg:inline">{link.title}</span>
                </Link>
              </li>
            ))}
          </ul>
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-all duration-200"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          )}
        </div>
      </nav>

      <nav className="md:hidden bg-gray-800 text-white sticky top-0 z-50 shadow-md">
        <div className="flex justify-between items-center p-4">
          <Link to="/admin" className="text-xl font-bold flex items-center gap-1">
            <span className="text-yellow-400 font-bold">Ω</span>
            <span>Omega Admin</span>
          </Link>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-md hover:bg-gray-700 focus:outline-none transition-colors"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-gray-800 shadow-lg z-50">
            <ul className="flex flex-col border-t border-gray-700">
              {navLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className={`flex items-center justify-between px-4 py-3 border-b border-gray-700 hover:bg-gray-700 transition-colors ${
                      isActive(link.path) ? "text-yellow-400 bg-gray-700" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {link.icon}
                      <span>{link.title}</span>
                    </div>
                    <ChevronRight size={16} className={isActive(link.path) ? "text-yellow-400" : "text-gray-400"} />
                  </Link>
                </li>
              ))}
              {isLoggedIn && (
                <li>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-between w-full text-left px-4 py-3 hover:bg-gray-700 text-red-400 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <LogOut size={18} />
                      <span>Logout</span>
                    </div>
                  </button>
                </li>
              )}
            </ul>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;