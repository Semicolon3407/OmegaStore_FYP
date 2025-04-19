import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Home,
  Box,
  ShoppingCart,
  Users,
  BarChart2,
  Menu,
  X,
  LogOut,
  MessageSquare,
  Image,
  Percent,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import logo from "/assets/images/logo.png";

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [userRole, setUserRole] = useState(localStorage.getItem("role") || "");
  const sidebarRef = useRef(null);

  const navLinks = [
    { title: "Dashboard", path: "/admin", icon: <Home size={20} /> },
    { title: "Products", path: "/admin/products", icon: <Box size={20} /> },
    { title: "Orders", path: "/admin/orders", icon: <ShoppingCart size={20} /> },
    { title: "Coupons", path: "/admin/coupons", icon: <Percent size={20} /> },
    { title: "Users", path: "/admin/users", icon: <Users size={20} /> },
    { title: "Chat", path: "/admin/chat", icon: <MessageSquare size={20} /> },
    { title: "Hero Banners", path: "/admin/hero-banners", icon: <Image size={20} /> },
    { title: "Brands", path: "/admin/brands", icon: <Image size={20} /> },
  ];

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      setIsLoggedIn(!!token);
      setUserRole(role || "");
      if (!token || role !== "admin") {
        navigate("/sign-in");
      }
    };

    checkAuthStatus();
    window.addEventListener("storage", checkAuthStatus);

    return () => window.removeEventListener("storage", checkAuthStatus);
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen]);

  useEffect(() => {
    const savedState = localStorage.getItem("adminSidebarCollapsed");
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("adminSidebarCollapsed", JSON.stringify(newState));
  };

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:5001/api/user/logout", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        withCredentials: true,
      });
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.info("Session cleared");
    } finally {
      localStorage.clear();
      setIsLoggedIn(false);
      setUserRole("");
      setIsSidebarOpen(false);
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
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-full bg-blue-900 text-white hover:bg-blue-800 transition-colors"
        aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full z-40 transform transition-all duration-300 
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:static md:min-h-screen border-r border-gray-200 bg-white shadow-lg
        ${isCollapsed ? "md:w-20" : "md:w-64"} 
        w-64`}
      >
        <div className="flex flex-col h-full relative">
          <button
            onClick={toggleCollapse}
            className="hidden md:flex absolute -right-3 top-24 z-10 p-1 bg-blue-900 text-white rounded-full shadow-md hover:bg-blue-800 transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          <div className={`p-6 border-b border-gray-200 ${isCollapsed ? "flex justify-center" : ""}`}>
            <Link to="/admin" className={`flex items-center ${isCollapsed ? "" : "space-x-2"}`}>
              <img src={logo} alt="OmegaStore Logo" className="h-12 w-auto" />
              {!isCollapsed && <span className="text-xl font-bold text-blue-900">Admin Panel</span>}
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            <ul className={`space-y-2 ${isCollapsed ? "px-2" : "px-4"}`}>
              {navLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center ${
                      isCollapsed ? "justify-center" : "space-x-3"
                    } px-4 py-3 rounded-lg text-base font-medium transition-all ${
                      isActive(link.path)
                        ? "text-orange-500 bg-orange-500/10"
                        : "text-blue-900 hover:text-blue-500 hover:bg-gray-100"
                    }`}
                    title={isCollapsed ? link.title : ""}
                  >
                    {link.icon}
                    {!isCollapsed && <span>{link.title}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {isLoggedIn && (
            <div className={`p-4 border-t border-gray-200 ${isCollapsed ? "flex justify-center" : ""}`}>
              <button
                onClick={handleLogout}
                className={`flex items-center ${
                  isCollapsed ? "justify-center w-12 h-12" : "space-x-3 w-full px-4 py-3"
                } text-orange-500 hover:bg-orange-500/10 rounded-lg transition-colors`}
                title={isCollapsed ? "Sign Out" : ""}
              >
                <LogOut size={20} />
                {!isCollapsed && <span>Sign Out</span>}
              </button>
            </div>
          )}
        </div>
      </aside>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default AdminSidebar;