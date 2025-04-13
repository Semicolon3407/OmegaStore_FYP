import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Percent, Edit2, Trash2, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/AdminNav";

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCoupon, setNewCoupon] = useState({
    name: "",
    expiry: "",
    discount: "",
    userId: "",
  });
  const [editingCoupon, setEditingCoupon] = useState(null);
  const navigate = useNavigate();

  const API_BASE_URL = "http://localhost:5001/api";

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found, please log in");
      const { data } = await axios.get(`${API_BASE_URL}/coupon`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoupons(data);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "Failed to fetch coupons";
      setError(errorMsg);
      if (error.response?.status === 401) {
        toast.info("Session expired, please login");
        navigate("/sign-in");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found, please log in");
      const { data } = await axios.get(`${API_BASE_URL}/user/all-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
      setUsers([]);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      toast.info("Access denied. Admins only.");
      navigate("/sign-in");
    } else {
      Promise.all([fetchCoupons(), fetchUsers()]).catch((err) => {
        setError("Failed to load data");
        setLoading(false);
      });
    }
  }, [navigate]);

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const payload = {
        name: newCoupon.name,
        expiry: newCoupon.expiry,
        discount: Number(newCoupon.discount),
        userId: newCoupon.userId || null,
      };
      const { data } = await axios.post(`${API_BASE_URL}/coupon`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoupons([...coupons, data]);
      setNewCoupon({ name: "", expiry: "", discount: "", userId: "" });
      toast.success("Coupon created successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create coupon");
    }
  };

  const handleEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setNewCoupon({
      name: coupon.name,
      expiry: new Date(coupon.expiry).toISOString().split("T")[0],
      discount: coupon.discount,
      userId: coupon.user?._id || "",
    });
  };

  const handleUpdateCoupon = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const payload = {
        name: newCoupon.name,
        expiry: newCoupon.expiry,
        discount: Number(newCoupon.discount),
        userId: newCoupon.userId || null,
      };
      const { data } = await axios.put(
        `${API_BASE_URL}/coupon/${editingCoupon._id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCoupons(coupons.map((c) => (c._id === editingCoupon._id ? data : c)));
      setEditingCoupon(null);
      setNewCoupon({ name: "", expiry: "", discount: "", userId: "" });
      toast.success("Coupon updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update coupon");
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/coupon/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoupons(coupons.filter((c) => c._id !== id));
      toast.success("Coupon deleted successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete coupon");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1  flex items-center justify-center p-4 md:p-6">
          <div className="text-center">
            <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
            <p className="text-gray-600 text-lg">Loading coupons...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1  flex items-center justify-center p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200 text-center max-w-md"
          >
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Error</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => {
                setError(null);
                fetchCoupons();
              }}
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
      <div className="flex-1  p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Manage Coupons</h1>
          <p className="text-gray-600 text-base">
            Create, update, or delete coupons to offer discounts to your customers.
          </p>
        </motion.div>

        {/* Add/Edit Coupon Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200"
        >
          <div className="flex items-center gap-2 mb-4">
            <Percent size={24} className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              {editingCoupon ? "Edit Coupon" : "Add New Coupon"}
            </h2>
          </div>
          <form onSubmit={editingCoupon ? handleUpdateCoupon : handleAddCoupon}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Coupon Code</label>
                <input
                  type="text"
                  value={newCoupon.name}
                  onChange={(e) =>
                    setNewCoupon({ ...newCoupon, name: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g., SUMMER20"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:opacity-50"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Expiry Date</label>
                <input
                  type="date"
                  value={newCoupon.expiry}
                  onChange={(e) => setNewCoupon({ ...newCoupon, expiry: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:opacity-50"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Discount (%)</label>
                <input
                  type="number"
                  value={newCoupon.discount}
                  onChange={(e) =>
                    setNewCoupon({ ...newCoupon, discount: e.target.value })
                  }
                  placeholder="e.g., 20"
                  min="1"
                  max="100"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:opacity-50"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-medium">
                  Assign to User (Optional)
                </label>
                <select
                  value={newCoupon.userId}
                  onChange={(e) => setNewCoupon({ ...newCoupon, userId: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:opacity-50"
                  disabled={loading}
                >
                  <option value="">General Coupon (All Users)</option>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.firstname} {user.lastname} ({user.email})
                      </option>
                    ))
                  ) : (
                    <option disabled>No users available</option>
                  )}
                </select>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {editingCoupon ? "Update Coupon" : "Add Coupon"}
              </button>
              {editingCoupon && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingCoupon(null);
                    setNewCoupon({ name: "", expiry: "", discount: "", userId: "" });
                  }}
                  disabled={loading}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </motion.div>

        {/* Coupons Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-lg shadow-md border border-gray-200 overflow-x-auto"
        >
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-gray-700 font-medium">Coupon Code</th>
                <th className="px-4 py-3 text-gray-700 font-medium">Discount</th>
                <th className="px-4 py-3 text-gray-700 font-medium">Expiry</th>
                <th className="px-4 py-3 text-gray-700 font-medium">Assigned User</th>
                <th className="px-4 py-3 text-gray-700 font-medium">Status</th>
                <th className="px-4 py-3 text-gray-700 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {coupons.map((coupon, index) => (
                  <motion.tr
                    key={coupon._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-gray-800">{coupon.name}</td>
                    <td className="px-4 py-3 text-gray-800">{coupon.discount}%</td>
                    <td className="px-4 py-3 text-gray-800">
                      {new Date(coupon.expiry).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-800">
                      {coupon.user
                        ? `${coupon.user.firstname} ${coupon.user.lastname} (${coupon.user.email})`
                        : "All Users"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          new Date(coupon.expiry) >= new Date()
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {new Date(coupon.expiry) >= new Date() ? "Active" : "Expired"}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-3 items-center">
                      <button
                        onClick={() => handleEditCoupon(coupon)}
                        className="text-orange-500 hover:text-orange-600 transition-colors"
                        title="Edit Coupon"
                        disabled={loading}
                      >
                        <Edit2 size={20} />
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(coupon._id)}
                        className="text-red-500 hover:text-red-600 transition-colors"
                        title="Delete Coupon"
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
          {coupons.length === 0 && (
            <div className="text-center py-8 text-gray-500 flex items-center justify-center gap-2">
              <Percent size={24} className="text-blue-600" />
              <p>No coupons available.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminCoupons;