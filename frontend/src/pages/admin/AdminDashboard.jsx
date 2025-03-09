import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  Users,
  IndianRupee,
  BarChart,
  ChevronRight,
} from "lucide-react";

const AdminDashboard = () => {
  const stats = [
    { title: "Total Products", value: 45, icon: Package, link: "/admin/products" },
    { title: "Total Orders", value: 1250, icon: ShoppingCart, link: "/admin/orders" },
    { title: "Total Revenue", value: "Rs 25,000", icon: IndianRupee, link: "" }, 
    { title: "Total Users", value: 320, icon: Users, link: "/admin/users" },
  ];

  const quickLinks = [
    { title: "Manage Products", icon: Package, link: "/admin/products" },
    { title: "Manage Orders", icon: ShoppingCart, link: "/admin/orders" },
    { title: "User Management", icon: Users, link: "/admin/users" },
    { title: "View Analytics", icon: BarChart, link: "" },
    { title: "View Revenue", icon: IndianRupee, link: "" }, 
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 flex items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Link to={stat.link} className="flex items-center w-full">
              {stat.icon && <stat.icon size={40} className="text-primary-600 mr-4" />}
              <div>
                <h2 className="text-xl font-semibold">{stat.title}</h2>
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickLinks.map((link, index) => (
          <Link
            key={index}
            to={link.link}
            className="bg-white text-primary-600 rounded-lg shadow-md p-6 hover:bg-primary-50 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center">
              {link.icon && <link.icon size={24} className="mr-3" />}
              <span className="font-semibold">{link.title}</span>
            </div>
            <ChevronRight size={20} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
