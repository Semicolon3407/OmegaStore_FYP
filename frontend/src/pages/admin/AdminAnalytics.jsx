import React from "react";
import { motion } from "framer-motion";
import {
  BarChart2,
  PieChart,
  TrendingUp,
  Eye,
  Users,
  ShoppingCart,
  DollarSign,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts";
import Navbar from "../../components/AdminNav"; // Import the Navbar component

const AdminAnalytics = () => {
  const analyticsData = [
    { title: "Total Visits", value: 15000, icon: Eye, change: 12 },
    { title: "New Customers", value: 350, icon: Users, change: 5 },
    { title: "Orders", value: 1250, icon: ShoppingCart, change: -3 },
    { title: "Revenue", value: 50000, icon: DollarSign, change: 8 },
  ];

  const visitorData = [
    { name: "Mon", visits: 1000 },
    { name: "Tue", visits: 1200 },
    { name: "Wed", visits: 1500 },
    { name: "Thu", visits: 1300 },
    { name: "Fri", visits: 1400 },
    { name: "Sat", visits: 1800 },
    { name: "Sun", visits: 1600 },
  ];

  const trafficSourceData = [
    { name: "Direct", value: 400 },
    { name: "Organic Search", value: 300 },
    { name: "Paid Search", value: 200 },
    { name: "Social Media", value: 100 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div>
      <Navbar /> {/* Add the Navbar component */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {analyticsData.map((data, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-lg shadow-md p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex items-center mb-2">
                <data.icon className="text-primary-600 mr-2" size={24} />
                <h2 className="text-xl font-semibold">{data.title}</h2>
              </div>
              <p className="text-3xl font-bold">{data.value.toLocaleString()}</p>
              <div
                className={`flex items-center mt-2 ${
                  data.change >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {data.change >= 0 ? (
                  <TrendingUp size={20} />
                ) : (
                  <TrendingUp size={20} className="transform rotate-180" />
                )}
                <span className="ml-1">
                  {Math.abs(data.change)}%{" "}
                  {data.change >= 0 ? "Increase" : "Decrease"}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
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

          <div className="bg-white rounded-lg shadow-md p-6">
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
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {trafficSourceData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">Top Products</h3>
            <ul className="space-y-2">
              <li className="flex justify-between items-center">
                <span>Product A</span>
                <span className="font-semibold">250 sales</span>
              </li>
              <li className="flex justify-between items-center">
                <span>Product B</span>
                <span className="font-semibold">180 sales</span>
              </li>
              <li className="flex justify-between items-center">
                <span>Product C</span>
                <span className="font-semibold">150 sales</span>
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">Customer Satisfaction</h3>
            <div className="text-4xl font-bold text-center mb-2">4.7/5</div>
            <div className="flex justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-6 h-6 ${
                    star <= 4 ? "text-yellow-400" : "text-gray-300"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">Conversion Rate</h3>
            <div className="text-4xl font-bold text-center mb-2">3.2%</div>
            <p className="text-center text-gray-600">
              Visitors who made a purchase
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;