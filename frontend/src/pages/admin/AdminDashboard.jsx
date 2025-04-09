import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  Users,
  IndianRupee,
  BarChart,
  ChevronRight,
  MessageSquare,
  Tag,
  Image,
} from "lucide-react";
import axios from "axios";
import Navbar from "../../components/AdminNav";

const AdminDashboard = () => {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalSaleProducts, setTotalSaleProducts] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_PRODUCTS_URL = "http://localhost:5001/api/products";
  const API_SALE_PRODUCTS_URL = "http://localhost:5001/api/sale-products";
  const API_USERS_URL = "http://localhost:5001/api/user/all-users";
  const API_CHAT_URL = "http://localhost:5001/api/chat/unread-count";

  const fetchStats = async () => {
    try {
      setLoading(true);

      const productsResponse = await axios.get(API_PRODUCTS_URL);
      setTotalProducts(productsResponse.data.products.length);

      const saleProductsResponse = await axios.get(API_SALE_PRODUCTS_URL);
      setTotalSaleProducts(saleProductsResponse.data.saleProducts.length);

      const usersResponse = await axios.get(API_USERS_URL, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setTotalUsers(usersResponse.data.length);

      const chatResponse = await axios.get(API_CHAT_URL, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUnreadMessages(chatResponse.data.count || 0);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "admin") {
      navigate("/sign-in");
    } else {
      fetchStats();
    }
  }, [navigate]);

  const stats = [
    { title: "Total Products", value: totalProducts, icon: Package, link: "/admin/products" },
    { title: "Total Sale Products", value: totalSaleProducts, icon: Tag, link: "/admin/sale-products" },
    { title: "Total Orders", value: 1250, icon: ShoppingCart, link: "/admin/orders" },
    { title: "Total Revenue", value: "Rs 25,000", icon: IndianRupee, link: "/admin/revenue" },
    { title: "Total Users", value: totalUsers, icon: Users, link: "/admin/users" },
  ];

  const quickLinks = [
    { title: "Manage Products", icon: Package, link: "/admin/products" },
    { title: "Manage Sale Products", icon: Tag, link: "/admin/sale-products" },
    { title: "Manage Orders", icon: ShoppingCart, link: "/admin/orders" },
    { title: "User Management", icon: Users, link: "/admin/users" },
    { title: "View Analytics", icon: BarChart, link: "/admin/analytics" },
    { title: "View Revenue", icon: IndianRupee, link: "/admin/revenue" },
    {
      title: "Chat Support",
      icon: MessageSquare,
      link: "/admin/chat",
      badge: unreadMessages > 0 ? unreadMessages : null,
    },
    { title: "Manage Hero Banners", icon: Image, link: "/admin/hero-banners" }, // New quick link
  ];

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Admin Dashboard</h1>

        {loading ? (
          <div className="text-center text-gray-500">
            <svg
              className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-2"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading stats...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-lg shadow-md p-6 flex items-center hover:shadow-lg transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link to={stat.link} className="flex items-center w-full">
                  {stat.icon && <stat.icon size={40} className="text-blue-600 mr-4" />}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-700">{stat.title}</h2>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickLinks.map((link, index) => (
            <Link
              key={index}
              to={link.link}
              className="bg-white text-blue-600 rounded-lg shadow-md p-6 hover:bg-blue-50 transition-colors duration-300 flex items-center justify-between relative"
            >
              <div className="flex items-center">
                {link.icon && <link.icon size={24} className="mr-3" />}
                <span className="font-semibold text-gray-800">{link.title}</span>
              </div>
              <div className="flex items-center">
                {link.badge && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center mr-2">
                    {link.badge}
                  </span>
                )}
                <ChevronRight size={20} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;