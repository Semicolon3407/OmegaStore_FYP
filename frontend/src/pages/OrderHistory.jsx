import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.info("Please login to view order history");
          navigate("/sign-in");
          return;
        }

        const response = await axios.get("http://localhost:5001/api/user/get-orders", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error(error.response?.data?.message || "Failed to fetch orders");
        if (error.response?.status === 401) {
          navigate("/sign-in");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-500">
          <svg
            className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-2"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4" 
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading your orders...
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Order History</h1>

      {orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-200"
        >
          <Package size={80} className="mx-auto mb-6 text-gray-300" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 tracking-tight">
            No Orders Found
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
            You haven't placed any orders yet. Start shopping now!
          </p>
          <a
            href="/products"
            className="bg-blue-900 text-white px-6 py-3 rounded-full hover:bg-blue-800 transition-all duration-300 shadow-md inline-block"
          >
            Shop Now
          </a>
        </motion.div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 text-left">Order ID</th>
                <th className="px-6 py-3 text-left">Total</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Coupon</th>
                <th className="px-6 py-3 text-left">Products</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <motion.tr
                  key={order._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td className="px-6 py-4">{order.paymentIntent.id}</td>
                  <td className="px-6 py-4">
                    Rs {(order.totalAfterDiscount || order.paymentIntent.amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        order.orderStatus === "Not Processed"
                          ? "bg-yellow-200 text-yellow-800"
                          : order.orderStatus === "Processing"
                          ? "bg-blue-200 text-blue-800"
                          : order.orderStatus === "Dispatched"
                          ? "bg-purple-200 text-purple-800"
                          : order.orderStatus === "Delivered"
                          ? "bg-green-200 text-green-800"
                          : order.orderStatus === "Cancelled"
                          ? "bg-red-200 text-red-800"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{order.coupon ? order.coupon.name : "None"}</td>
                  <td className="px-6 py-4">
                    <ul className="list-disc list-inside">
                      {order.products.map((item) => (
                        <li key={item._id}>
                          {item.product?.title} (x{item.count}, Color: {item.color})
                        </li>
                      ))}
                    </ul>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;