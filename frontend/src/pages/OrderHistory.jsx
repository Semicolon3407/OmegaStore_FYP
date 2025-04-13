import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.info("Please login to view order history");
        navigate("/sign-in");
        return false;
      }
      return true;
    };

    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        // First check authentication
        if (!checkAuth()) {
          setAuthChecked(true);
          setLoading(false);
          return;
        }

        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5001/api/user/get-orders", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setOrders(response.data);
        setAuthChecked(true);
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

    // Small delay to ensure authentication is properly checked
    const timer = setTimeout(() => {
      fetchOrders();
    }, 100);

    return () => clearTimeout(timer);
  }, [navigate]);

  // If still checking auth and loading, show loading spinner
  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-blue-900"></div>
          <p className="mt-3 sm:mt-4 text-gray-600 text-base sm:text-lg">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12 md:py-16">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 sm:mb-8 flex justify-between items-center border-b border-gray-200 pb-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-900 tracking-tight">
              Order History
            </h1>
            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-600 max-w-xl sm:max-w-2xl leading-relaxed">
              Review your past orders and track their status.
            </p>
          </div>
          <Link
            to="/products"
            className="text-blue-900 hover:text-orange-500 font-medium transition-colors duration-300 text-sm sm:text-base"
          >
            Continue Shopping
          </Link>
        </motion.div>

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center py-12 sm:py-16 bg-white rounded-xl shadow-lg border border-gray-200 max-w-md sm:max-w-lg mx-auto"
          >
            <Package size={60} className="mx-auto mb-4 sm:mb-6 text-gray-300" />
            <h2 className="text-xl sm:text-2xl font-semibold text-blue-900 mb-3 sm:mb-4 tracking-tight">
              No Orders Found
            </h2>
            <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base max-w-sm sm:max-w-md mx-auto leading-relaxed">
              You haven't placed any orders yet. Start shopping now!
            </p>
            <Link
              to="/products"
              className="bg-blue-900 text-white px-5 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-blue-500 transition-all duration-300 shadow-md inline-block text-sm sm:text-base"
            >
              Shop Now
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {orders.map((order, index) => (
              <motion.div
                key={order._id}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-blue-900 mb-2 sm:mb-0">
                    Order ID: {order.paymentIntent.id}
                  </h2>
                  <span
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
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
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div>
                    <p className="text-gray-600 text-sm sm:text-base">
                      <span className="font-semibold text-blue-900">Total:</span> Rs{" "}
                      {(order.totalAfterDiscount || order.paymentIntent.amount).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm sm:text-base">
                      <span className="font-semibold text-blue-900">Date:</span>{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm sm:text-base">
                      <span className="font-semibold text-blue-900">Coupon:</span>{" "}
                      {order.coupon ? order.coupon.name : "None"}
                    </p>
                  </div>
                </div>
                <div className="mt-4 sm:mt-6">
                  <h3 className="text-sm sm:text-base font-semibold text-blue-900 mb-2 sm:mb-3">
                    Products:
                  </h3>
                  <ul className="list-disc list-inside text-gray-600 text-sm sm:text-base">
                    {order.products.map((item) => (
                      <li key={item._id}>
                        {item.product?.title || "Product Unavailable"} (x{item.count}, Color: {item.color})
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;