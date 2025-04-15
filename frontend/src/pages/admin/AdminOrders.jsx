import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Edit2, Trash2, Loader2, X } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import AdminSidebar from "../../components/AdminNav";

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
    shippingInfo: { name: "", email: "", address: "", city: "", phone: "" },
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const API_BASE_URL = "http://localhost:5001/api/user";

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found, please log in");
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
        shippingInfo: order.shippingInfo || {
          name: "",
          email: "",
          address: "",
          city: "",
          phone: "",
        },
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
  }, [navigate, location.pathname]);

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
      setEditOrder({
        id: "",
        customer: "",
        total: "",
        status: "",
        date: "",
        coupon: null,
        shippingInfo: { name: "", email: "", address: "", city: "", phone: "" },
      });
      toast.success("Order updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update order");
    }
  };

  const handleDeleteOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/order/${orderToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(orders.filter((order) => order.id !== orderToDelete));
      setSelectedOrder(null);
      setIsDeleteModalOpen(false);
      setOrderToDelete(null);
      toast.success("Order deleted successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete order");
    }
  };

  const openDeleteModal = (id) => {
    setOrderToDelete(id);
    setIsDeleteModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center p-4 md:p-6">
          <div className="text-center">
            <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
            <p className="text-gray-600 text-lg">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200 text-center max-w-md"
          >
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Error</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={fetchOrders}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Manage Orders</h1>
          <p className="text-gray-600 text-base">
            View and update order statuses to manage customer purchases.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-lg shadow-md border border-gray-200 overflow-x-auto"
        >
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-gray-700 font-medium">Order ID</th>
                <th className="px-4 py-3 text-gray-700 font-medium">Customer Email</th>
                <th className="px-4 py-3 text-gray-700 font-medium">Total</th>
                <th className="px-4 py-3 text-gray-700 font-medium">Status</th>
                <th className="px-4 py-3 text-gray-700 font-medium">Date</th>
                <th className="px-4 py-3 text-gray-700 font-medium">Coupon</th>
                <th className="px-4 py-3 text-gray-700 font-medium">Shipping Info</th>
                <th className="px-4 py-3 text-gray-700 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {orders.map((order, index) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-gray-800">{order.id.slice(-6)}</td>
                    <td className="px-4 py-3 text-gray-800">{order.customer}</td>
                    <td className="px-4 py-3 text-gray-800">Rs {order.total.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === "Not Processed"
                            ? "bg-yellow-100 text-yellow-700"
                            : order.status === "Processing"
                            ? "bg-blue-100 text-blue-700"
                            : order.status === "Dispatched"
                            ? "bg-purple-100 text-purple-700"
                            : order.status === "Delivered"
                            ? "bg-green-100 text-green-700"
                            : order.status === "Cancelled"
                            ? "bg-red-100 text-red-700"
                            : order.status === "Cash on Delivery"
                            ? "bg-orange-100 text-orange-700"
                            : order.status === "eSewa"
                            ? "bg-teal-100 text-teal-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-800">{order.date}</td>
                    <td className="px-4 py-3 text-gray-800">{order.coupon}</td>
                    <td className="px-4 py-3 text-gray-800">
                      {order.shippingInfo ? (
                        <div className="flex flex-col">
                          <span>Name: {order.shippingInfo.name || "N/A"}</span>
                          <span>Email: {order.shippingInfo.email || "N/A"}</span>
                          <span>Address: {order.shippingInfo.address || "N/A"}</span>
                          <span>City: {order.shippingInfo.city || "N/A"}</span>
                          <span>Phone: {order.shippingInfo.phone || "N/A"}</span>
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="px-4 py-3 flex gap-3 items-center">
                      <button
                        onClick={() => handleEditOrder(order)}
                        className="text-orange-500 hover:text-orange-600 transition-colors"
                        title="Edit Order"
                        disabled={loading}
                      >
                        <Edit2 size={20} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(order.id)}
                        className="text-red-500 hover:text-red-600 transition-colors"
                        title="Delete Order"
                        disabled={loading}
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="text-center py-8 text-gray-500 flex items-center justify-center gap-2">
              <ShoppingCart size={24} className="text-blue-600" />
              <p>No orders available.</p>
            </div>
          )}
        </motion.div>

        {/* Edit Order Modal */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="bg-white rounded-lg shadow-md p-6 w-full max-w-lg relative"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={() => setIsEditing(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                  title="Close"
                >
                  <X size={24} />
                </button>
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingCart size={24} className="text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Edit Order</h2>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-1 font-medium">Customer Email</label>
                    <input
                      type="text"
                      value={editOrder.customer}
                      disabled
                      className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1 font-medium">Total Amount</label>
                    <input
                      type="text"
                      value={`Rs ${editOrder.total.toLocaleString()}`}
                      disabled
                      className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1 font-medium">Shipping Info</label>
                    <div className="bg-gray-100 p-3 rounded-lg text-gray-600">
                      <p>Name: {editOrder.shippingInfo.name}</p>
                      <p>Email: {editOrder.shippingInfo.email}</p>
                      <p>Address: {editOrder.shippingInfo.address}</p>
                      <p>City: {editOrder.shippingInfo.city}</p>
                      <p>Phone: {editOrder.shippingInfo.phone}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1 font-medium">Status</label>
                    <select
                      value={editOrder.status}
                      onChange={(e) => setEditOrder({ ...editOrder, status: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:opacity-50"
                      required
                      disabled={loading}
                    >
                      <option value="Not Processed">Not Processed</option>
                      <option value="Cash on Delivery">Cash on Delivery</option>
                      <option value="eSewa">eSewa</option>
                      <option value="Processing">Processing</option>
                      <option value="Dispatched">Dispatched</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex gap-4">
                  <button
                    onClick={handleUpdateOrder}
                    disabled={loading}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Update Order
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    disabled={loading}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {isDeleteModalOpen && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="bg-white rounded-lg shadow-md p-6 w-full max-w-md"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Confirm Deletion
                </h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this order? This action cannot be undone.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={handleDeleteOrder}
                    disabled={loading}
                    className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    disabled={loading}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminOrders;