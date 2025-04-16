import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart2,
  PieChart,
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  MessageSquare,
  Tag,
  Image,
  Percent,
  ChevronRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts";
import axios from "axios";
import AdminSidebar from "../../components/AdminNav";

const AdminDashboard = () => {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalSaleProducts, setTotalSaleProducts] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [revenue, setRevenue] = useState({
    today: 0,
    week: 0,
    month: 0,
    year: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_PRODUCTS_URL = "http://localhost:5001/api/products";
  const API_SALE_PRODUCTS_URL = "http://localhost:5001/api/sale-products";
  const API_USERS_URL = "http://localhost:5001/api/user/all-users";
  const API_CHAT_URL = "http://localhost:5001/api/chat/unread-count";
  const API_ORDERS_URL = "http://localhost:5001/api/orders";
  const API_REVENUE_URL = "http://localhost:5001/api/revenue";

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

      // Fetch total orders
      const ordersResponse = await axios.get(API_ORDERS_URL, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setTotalOrders(ordersResponse.data.orders.length || 0);

      // Fetch revenue stats
      const revenueResponse = await axios.get(API_REVENUE_URL, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      setRevenue({
        today: revenueResponse.data.today || 0,
        week: revenueResponse.data.week || 0,
        month: revenueResponse.data.month || 0,
        year: revenueResponse.data.year || 0,
      });
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

  // Weekly visitor traffic data
  const visitorData = [
    { name: "Mon", visits: 1000 },
    { name: "Tue", visits: 1200 },
    { name: "Wed", visits: 1500 },
    { name: "Thu", visits: 1300 },
    { name: "Fri", visits: 1400 },
    { name: "Sat", visits: 1800 },
    { name: "Sun", visits: 1600 },
  ];

  // Traffic sources data
  const trafficSourceData = [
    { name: "Direct", value: 400 },
    { name: "Organic Search", value: 300 },
    { name: "Paid Search", value: 200 },
    { name: "Social Media", value: 100 },
  ];

  // Monthly revenue data
  const monthlyRevenue = [
    { name: "Jan", revenue: 30000 },
    { name: "Feb", revenue: 35000 },
    { name: "Mar", revenue: 40000 },
    { name: "Apr", revenue: 38000 },
    { name: "May", revenue: 42000 },
    { name: "Jun", revenue: 45000 },
    { name: "Jul", revenue: 50000 },
    { name: "Aug", revenue: 48000 },
    { name: "Sep", revenue: 52000 },
    { name: "Oct", revenue: 55000 },
    { name: "Nov", revenue: 58000 },
    { name: "Dec", revenue: 62000 },
  ];

  const quickLinks = [
    { title: "Manage Products", icon: Package, link: "/admin/products" },
    { title: "Manage Sale Products", icon: Tag, link: "/admin/sale-products" },
    { title: "Manage Orders", icon: ShoppingCart, link: "/admin/orders" },
    { title: "Manage Coupons", icon: Percent, link: "/admin/coupons" },
    { title: "User Management", icon: Users, link: "/admin/users" },
    { title: "Analytics & Revenue", icon: BarChart2, link: "/admin/analytics-revenue" },
    {
      title: "Chat Support",
      icon: MessageSquare,
      link: "/admin/chat",
      badge: unreadMessages > 0 ? unreadMessages : null,
    },
    { title: "Manage Hero Banners", icon: Image, link: "/admin/hero-banners" },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 p-4 md:p-6">
        <h1 className="text-3xl font-bold mb-6 text-blue-900">Analytics & Revenue Dashboard</h1>

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
          <>
            {/* Top Row - Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            

              {/* Total Users */}
              <motion.div
                className="bg-white rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="flex items-center mb-2">
                  <Users className="text-blue-600 mr-2" size={24} />
                  <h2 className="text-lg font-semibold text-gray-700">Total Users</h2>
                </div>
                <p className="text-2xl font-bold text-gray-800">{totalUsers.toLocaleString()}</p>
                <div className="flex items-center mt-2 text-green-500">
                  <TrendingUp size={20} />
                  <span className="ml-1">5% Increase</span>
                </div>
              </motion.div>

              {/* Total Orders */}
              <motion.div
                className="bg-white rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex items-center mb-2">
                  <ShoppingCart className="text-blue-600 mr-2" size={24} />
                  <h2 className="text-lg font-semibold text-gray-700">Total Orders</h2>
                </div>
                <p className="text-2xl font-bold text-gray-800">{totalOrders.toLocaleString()}</p>
                <div className="flex items-center mt-2 text-red-500">
                  <TrendingDown size={20} />
                  <span className="ml-1">3% Decrease</span>
                </div>
              </motion.div>

              {/* Total Products */}
              <motion.div
                className="bg-white rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="flex items-center mb-2">
                  <Package className="text-blue-600 mr-2" size={24} />
                  <h2 className="text-lg font-semibold text-gray-700">Total Products</h2>
                </div>
                <p className="text-2xl font-bold text-gray-800">{totalProducts.toLocaleString()}</p>
                <div className="flex items-center mt-2 text-green-500">
                  <TrendingUp size={20} />
                  <span className="ml-1">8% Increase</span>
                </div>
              </motion.div>
            </div>

            {/* Revenue Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
              {/* Revenue (Today) */}
              <motion.div
                className="bg-white rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="flex items-center mb-2">
                  <DollarSign className="text-blue-600 mr-2" size={24} />
                  <h2 className="text-lg font-semibold text-gray-700">Revenue (Today)</h2>
                </div>
                <p className="text-2xl font-bold text-gray-800">${revenue.today.toLocaleString()}</p>
                <div className="flex items-center mt-2 text-green-500">
                  <TrendingUp size={20} />
                  <span className="ml-1">5% Increase</span>
                </div>
              </motion.div>

              {/* Revenue (Week) */}
              <motion.div
                className="bg-white rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <div className="flex items-center mb-2">
                  <DollarSign className="text-blue-600 mr-2" size={24} />
                  <h2 className="text-lg font-semibold text-gray-700">Revenue (Week)</h2>
                </div>
                <p className="text-2xl font-bold text-gray-800">${revenue.week.toLocaleString()}</p>
                <div className="flex items-center mt-2 text-green-500">
                  <TrendingUp size={20} />
                  <span className="ml-1">12% Increase</span>
                </div>
              </motion.div>

              {/* Revenue (Month) */}
              <motion.div
                className="bg-white rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <div className="flex items-center mb-2">
                  <DollarSign className="text-blue-600 mr-2" size={24} />
                  <h2 className="text-lg font-semibold text-gray-700">Revenue (Month)</h2>
                </div>
                <p className="text-2xl font-bold text-gray-800">${revenue.month.toLocaleString()}</p>
                <div className="flex items-center mt-2 text-red-500">
                  <TrendingDown size={20} />
                  <span className="ml-1">3% Decrease</span>
                </div>
              </motion.div>

              {/* Revenue (Year) */}
              <motion.div
                className="bg-white rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow duration-300 sm:col-span-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <div className="flex items-center mb-2">
                  <DollarSign className="text-blue-600 mr-2" size={24} />
                  <h2 className="text-lg font-semibold text-gray-700">Revenue (Year)</h2>
                </div>
                <p className="text-2xl font-bold text-gray-800">${revenue.year.toLocaleString()}</p>
                <div className="flex items-center mt-2 text-green-500">
                  <TrendingUp size={20} />
                  <span className="ml-1">18% Increase</span>
                </div>
              </motion.div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
              {/* Weekly Visitor Traffic */}
              <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                <h3 className="text-xl font-semibold mb-2">Weekly Visitor Traffic</h3>
                <p className="text-gray-600 mb-4">Number of visitors per day</p>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={visitorData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="visits" fill="#8884d8" name="Visits" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Traffic Sources */}
              <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                <h3 className="text-xl font-semibold mb-2">Traffic Sources</h3>
                <p className="text-gray-600 mb-4">Distribution of visitor sources</p>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={trafficSourceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {trafficSourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Monthly Revenue */}
              <div className="bg-white rounded-lg shadow-md p-4 md:p-6 lg:col-span-2">
                <h3 className="text-xl font-semibold mb-2">Monthly Revenue</h3>
                <p className="text-gray-600 mb-4">Revenue trend over the past 12 months</p>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {quickLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.link}
                  className="bg-white text-blue-600 rounded-lg shadow-md p-4 md:p-6 hover:bg-blue-50 transition-colors duration-300 flex items-center justify-between relative"
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

            {/* Additional Metrics */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {/* Top Products */}
              <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                <h3 className="text-xl font-semibold mb-2">Top Selling Products</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between items-center">
                    <span>Product A</span>
                    <span className="font-semibold">$12,500</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>Product B</span>
                    <span className="font-semibold">$10,200</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>Product C</span>
                    <span className="font-semibold">$8,750</span>
                  </li>
                </ul>
              </div>

              {/* Revenue by Category */}
              <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                <h3 className="text-xl font-semibold mb-2">Revenue by Category</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between items-center">
                    <span>Electronics</span>
                    <span className="font-semibold">$45,000</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>Clothing</span>
                    <span className="font-semibold">$32,000</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>Home & Garden</span>
                    <span className="font-semibold">$28,500</span>
                  </li>
                </ul>
              </div>

              {/* Customer Satisfaction */}
              <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                <h3 className="text-xl font-semibold mb-2">Customer Satisfaction</h3>
                <div className="text-3xl font-bold text-center mb-2">4.7/5</div>
                <div className="flex justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${star <= 4 ? "text-yellow-400" : "text-gray-300"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>

              {/* Conversion Rate */}
              <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                <h3 className="text-xl font-semibold mb-2">Conversion Rate</h3>
                <div className="text-3xl font-bold text-center mb-2">3.2%</div>
                <p className="text-center text-gray-600">Visitors who made a purchase</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;