import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, Edit2, Trash2 } from "lucide-react";
import Navbar from "../../components/AdminNav";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editOrder, setEditOrder] = useState({
    id: "",
    customer: "",
    total: "",
    status: "",
    date: "",
    coupon: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const API_BASE_URL = "http://localhost:5001/api/user";

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const formattedOrders = response.data.map((order) => ({
        id: order._id,
        customer: order.orderby?.email || "Unknown",
        total: order.paymentIntent.amount,
        status: order.orderStatus,
        date: new Date(order.createdAt).toLocaleDateString(),
        coupon: order.coupon ? order.coupon.name : "None",
      }));
      setOrders(formattedOrders);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to fetch orders";
      setError(errorMsg);
      if (error.response?.status === 401) {
        toast.info("Session expired, please login");
        navigate("/sign-in");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      toast.info("Access denied. Admins only.");
      navigate("/sign-in");
    } else {
      fetchOrders();
    }
  }, [navigate]);

  // Update an order
  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setEditOrder(order);
    setIsEditing(true);
  };

  const handleUpdateOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      const updatedData = {
        orderStatus: editOrder.status,
      };
      await axios.put(`${API_BASE_URL}/order/${editOrder.id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(
        orders.map((order) =>
          order.id === editOrder.id ? { ...order, status: editOrder.status } : order
        )
      );
      setIsEditing(false);
      setEditOrder({ id: "", customer: "", total: "", status: "", date: "", coupon: null });
      toast.success("Order updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update order");
    }
  };

  // Delete an order
  const handleDeleteOrder = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/order/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(orders.filter((order) => order.id !== id));
      setSelectedOrder(null);
      toast.success("Order deleted successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete order");
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen pt-40 lg:pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-100 min-h-screen pt-40 lg:pt-32 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Error</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={fetchOrders}
            className="bg-blue-900 text-white px-6 py-3 rounded-full hover:bg-blue-800 transition-all duration-300 shadow-md inline-block"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-gray-900">Manage Orders</h1>
          <p className="text-gray-600 mt-2">View and update order statuses.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-lg shadow-md border border-gray-200 overflow-x-auto"
        >
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 text-left">Order ID</th>
                <th className="px-6 py-3 text-left">Customer Email</th>
                <th className="px-6 py-3 text-left">Total</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Coupon</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td className="px-6 py-4">{order.id}</td>
                  <td className="px-6 py-4">{order.customer}</td>
                  <td className="px-6 py-4">Rs {order.total.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        order.status === "Not Processed"
                          ? "bg-yellow-200 text-yellow-800"
                          : order.status === "Processing"
                          ? "bg-blue-200 text-blue-800"
                          : order.status === "Dispatched"
                          ? "bg-purple-200 text-purple-800"
                          : order.status === "Delivered"
                          ? "bg-green-200 text-green-800"
                          : order.status === "Cancelled"
                          ? "bg-red-200 text-red-800"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{order.date}</td>
                  <td className="px-6 py-4">{order.coupon}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEditOrder(order)}
                      className="text-yellow-600 hover:text-yellow-800 mr-4"
                      title="Edit"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {isEditing && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Edit Order</h2>
              <div className="grid grid-cols-1 gap-4">
                <input
                  type="text"
                  value={editOrder.customer}
                  onChange={(e) => setEditOrder({ ...editOrder, customer: e.target.value })}
                  placeholder="Customer Email"
                  className="border p-2 rounded"
                  disabled
                />
                <input
                  type="number"
                  value={editOrder.total}
                  onChange={(e) => setEditOrder({ ...editOrder, total: e.target.value })}
                  placeholder="Total Amount"
                  className="border p-2 rounded"
                  disabled
                />
                <select
                  value={editOrder.status}
                  onChange={(e) => setEditOrder({ ...editOrder, status: e.target.value })}
                  className="border p-2 rounded"
                  required
                >
                  <option value="Not Processed">Not Processed</option>
                  <option value="Cash on Delivery">Cash on Delivery</option>
                  <option value="Processing">Processing</option>
                  <option value="Dispatched">Dispatched</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleUpdateOrder}
                  className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800 transition-all duration-300"
                >
                  Update Order
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;