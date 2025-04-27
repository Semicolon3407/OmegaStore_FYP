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
  Lock,
  Unlock,
  UserCheck,
  CreditCard,
  Truck,
  CheckCircle,
  XCircle,
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
  Legend,
} from "recharts";
import axios from "axios";
import AdminSidebar from "../../components/AdminNav";
import { toast } from "react-toastify";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSaleProducts: 0,
    totalUsers: 0,
    activeUsers: 0,
    blockedUsers: 0,
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    unreadMessages: 0,
    totalRevenue: 0,
    esewaRevenue: 0,
    codRevenue: 0,
    recentOrders: [],
    userGrowth: [],
    orderStatusData: [],
    paymentMethodData: [],
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_BASE_URL = "http://localhost:5001/api";
  const API_PRODUCTS_URL = `${API_BASE_URL}/products`;
  const API_SALE_PRODUCTS_URL = `${API_BASE_URL}/sale-products`;
  const API_USERS_URL = `${API_BASE_URL}/user/all-users`;
  const API_CHAT_URL = `${API_BASE_URL}/chat/unread-count`;
  const API_ORDERS_URL = `${API_BASE_URL}/orders`;
  const API_REVENUE_URL = `${API_BASE_URL}/revenue`;

  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [
        productsRes,
        saleProductsRes,
        usersRes,
        chatRes,
        ordersRes,
        revenueRes,
      ] = await Promise.all([
        axios.get(API_PRODUCTS_URL),
        axios.get(API_SALE_PRODUCTS_URL),
        axios.get(API_USERS_URL, getAuthConfig()),
        axios.get(API_CHAT_URL, getAuthConfig()),
        axios.get(API_ORDERS_URL, getAuthConfig()),
        axios.get(`${API_REVENUE_URL}/all`, getAuthConfig()),
      ]);

      // Process users data
      const users = usersRes.data || [];
      const activeUsers = users.filter(user => !user.isBlocked).length;
      const blockedUsers = users.filter(user => user.isBlocked).length;

      // Process orders data
      const orders = ordersRes.data.orders || [];
      const pendingOrders = orders.filter(order => order.orderStatus === "Processing").length;
      const deliveredOrders = orders.filter(order => order.orderStatus === "Delivered").length;
      const cancelledOrders = orders.filter(order => order.orderStatus === "Cancelled").length;

      // Get recent 5 orders
      const recentOrders = orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(order => ({
          id: order._id,
          customer: order.orderby ? `${order.orderby.firstname} ${order.orderby.lastname}` : "Unknown",
          amount: order.paymentIntent.amount,
          status: order.orderStatus,
          date: new Date(order.createdAt).toLocaleDateString(),
          paymentMethod: order.paymentIntent.method || "Unknown",
        }));

      // Prepare order status data for chart
      const orderStatusData = [
        { name: "Processing", value: pendingOrders, color: "#0088FE" },
        { name: "Delivered", value: deliveredOrders, color: "#00C49F" },
        { name: "Cancelled", value: cancelledOrders, color: "#FF8042" },
      ];

      // Prepare payment method data for chart
      const paymentMethods = orders.reduce((acc, order) => {
        const method = order.paymentIntent.method || "Unknown";
        acc[method] = (acc[method] || 0) + 1;
        return acc;
      }, {});

      const paymentMethodData = Object.entries(paymentMethods).map(([name, value]) => ({
        name,
        value,
        color: name === "eSewa" ? "#00C49F" : name === "Cash on Delivery" ? "#FFBB28" : "#0088FE",
      }));

      // Calculate user growth (last 6 months)
      const userGrowth = calculateUserGrowth(users);

      setStats({
        totalProducts: productsRes.data.products.length,
        totalSaleProducts: saleProductsRes.data.saleProducts.length,
        totalUsers: users.length,
        activeUsers,
        blockedUsers,
        totalOrders: orders.length,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        unreadMessages: chatRes.data.count || 0,
        totalRevenue: revenueRes.data.total || 0,
        esewaRevenue: revenueRes.data.esewa || 0,
        codRevenue: revenueRes.data.cod || 0,
        recentOrders,
        userGrowth,
        orderStatusData,
        paymentMethodData,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      toast.error(error.response?.data?.message || "Failed to load dashboard data");
      if (error.response?.status === 401) {
        navigate("/sign-in");
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate user growth over last 6 months
  const calculateUserGrowth = (users) => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleString('default', { month: 'short' });
      const monthUsers = users.filter(user => {
        const userDate = new Date(user.createdAt);
        return userDate.getFullYear() === date.getFullYear() && 
               userDate.getMonth() === date.getMonth();
      }).length;
      
      months.push({
        name: monthName,
        users: monthUsers,
      });
    }
    
    return months;
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

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  const quickLinks = [
    { title: "Manage Products", icon: Package, link: "/admin/products" },
    { title: "Manage Sale Products", icon: Tag, link: "/admin/sale-products" },
    { title: "Manage Orders", icon: ShoppingCart, link: "/admin/orders" },
    { title: "User Management", icon: Users, link: "/admin/users" },
    { title: "Chat Support", icon: MessageSquare, link: "/admin/chat", badge: stats.unreadMessages },
    { title: "Analytics", icon: BarChart2, link: "/admin/analytics" },
  ];

  const renderStatusBadge = (status) => {
    const statusClasses = {
      Processing: "bg-blue-100 text-blue-800",
      Delivered: "bg-green-100 text-green-800",
      Cancelled: "bg-red-100 text-red-800",
      default: "bg-gray-100 text-gray-800",
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || statusClasses.default}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mb-6">Overview of your e-commerce platform</p>
        </motion.div>

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center h-64"
          >
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dashboard data...</p>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Quick Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
            >
              {/* Total Products */}
              <div className="bg-white rounded-lg shadow p-4 md:p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Products</p>
                    <p className="text-2xl font-bold mt-1">{stats.totalProducts}</p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-50 text-blue-600">
                    <Package size={20} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <span className="flex items-center">
                    <Tag size={14} className="mr-1" />
                    {stats.totalSaleProducts} on sale
                  </span>
                </div>
              </div>

              {/* Users Summary */}
              <div className="bg-white rounded-lg shadow p-4 md:p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Users</p>
                    <p className="text-2xl font-bold mt-1">{stats.totalUsers}</p>
                  </div>
                  <div className="p-3 rounded-full bg-purple-50 text-purple-600">
                    <Users size={20} />
                  </div>
                </div>
                <div className="mt-4 flex justify-between text-sm">
                  <span className="text-green-600 flex items-center">
                    <UserCheck size={14} className="mr-1" />
                    {stats.activeUsers} active
                  </span>
                  <span className="text-red-600 flex items-center">
                    <Lock size={14} className="mr-1" />
                    {stats.blockedUsers} blocked
                  </span>
                </div>
              </div>

              {/* Orders Summary */}
              <div className="bg-white rounded-lg shadow p-4 md:p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Orders</p>
                    <p className="text-2xl font-bold mt-1">{stats.totalOrders}</p>
                  </div>
                  <div className="p-3 rounded-full bg-orange-50 text-orange-600">
                    <ShoppingCart size={20} />
                  </div>
                </div>
                <div className="mt-4 flex justify-between text-sm">
                  <span className="text-blue-600 flex items-center">
                    <Truck size={14} className="mr-1" />
                    {stats.pendingOrders} processing
                  </span>
                  <span className="text-green-600 flex items-center">
                    <CheckCircle size={14} className="mr-1" />
                    {stats.deliveredOrders} delivered
                  </span>
                </div>
              </div>

              {/* Revenue Summary */}
              <div className="bg-white rounded-lg shadow p-4 md:p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-bold mt-1">Rs. {stats.totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-full bg-green-50 text-green-600">
                    <DollarSign size={20} />
                  </div>
                </div>
                <div className="mt-4 flex justify-between text-sm">
                  <span className="text-teal-600 flex items-center">
                    <CreditCard size={14} className="mr-1" />
                    Rs. {stats.esewaRevenue.toLocaleString()} eSewa
                  </span>
                  <span className="text-yellow-600 flex items-center">
                    <DollarSign size={14} className="mr-1" />
                    Rs. {stats.codRevenue.toLocaleString()} COD
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Charts Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"
            >
              {/* User Growth */}
              <div className="bg-white rounded-lg shadow p-4 md:p-6 border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">User Growth (Last 6 Months)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="users" fill="#8884d8" name="New Users" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Order Status Distribution */}
              <div className="bg-white rounded-lg shadow p-4 md:p-6 border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">Order Status Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={stats.orderStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {stats.orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-lg shadow p-4 md:p-6 border border-gray-100 lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.paymentMethodData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Orders" radius={[4, 4, 0, 0]}>
                        {stats.paymentMethodData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>

            {/* Recent Orders and Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Recent Orders */}
              <div className="bg-white rounded-lg shadow p-4 md:p-6 border border-gray-100 lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Recent Orders</h3>
                  <Link to="/admin/orders" className="text-sm text-blue-600 hover:underline">
                    View all
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.recentOrders.length > 0 ? (
                        stats.recentOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              #{order.id.slice(-6)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {order.customer}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              Rs. {order.amount.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {renderStatusBadge(order.status)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                            No recent orders found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-white rounded-lg shadow p-4 md:p-6 border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  {quickLinks.map((link, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Link
                        to={link.link}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="p-2 rounded-full bg-gray-100 text-gray-600 mr-3">
                            <link.icon size={18} />
                          </div>
                          <span className="font-medium">{link.title}</span>
                        </div>
                        <div className="flex items-center">
                          {link.badge && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full mr-2">
                              {link.badge}
                            </span>
                          )}
                          <ChevronRight size={18} className="text-gray-400" />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;