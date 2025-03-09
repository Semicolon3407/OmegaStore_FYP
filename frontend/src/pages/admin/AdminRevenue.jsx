

import React from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const AdminRevenue = () => {
  const revenueData = [
    { period: "Today", amount: 1250, trend: "up", percentage: 5 },
    { period: "This Week", amount: 8750, trend: "up", percentage: 12 },
    { period: "This Month", amount: 35000, trend: "down", percentage: 3 },
    { period: "This Year", amount: 425000, trend: "up", percentage: 18 },
  ];

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Revenue Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {revenueData.map((data, index) => (
          <motion.div
            key={index}
            className="bg-white rounded-lg shadow-md p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <h2 className="text-xl font-semibold mb-2">{data.period}</h2>
            <div className="flex items-center">
              <DollarSign className="text-primary-600 mr-2" size={24} />
              <span className="text-3xl font-bold">
                {data.amount.toLocaleString()}
              </span>
            </div>
            <div
              className={`flex items-center mt-2 ${
                data.trend === "up" ? "text-green-500" : "text-red-500"
              }`}
            >
              {data.trend === "up" ? (
                <TrendingUp size={20} />
              ) : (
                <TrendingDown size={20} />
              )}
              <span className="ml-1">
                {data.percentage}%{" "}
                {data.trend === "up" ? "Increase" : "Decrease"}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-2">Monthly Revenue</h2>
        <p className="text-gray-600 mb-4">
          Revenue trend over the past 12 months
        </p>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#8884d8"
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
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
        <div className="bg-white rounded-lg shadow-md p-6">
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
      </div>
    </div>
  );
};

export default AdminRevenue;
