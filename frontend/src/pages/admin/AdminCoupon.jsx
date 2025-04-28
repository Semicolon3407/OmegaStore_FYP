import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Percent, 
  Edit2, 
  Trash2, 
  Loader2, 
  X, 
  Save,
  Search,
  Plus 
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/AdminNav";

const initialCouponState = {
  name: "",
  expiry: "",
  discount: "",
  userId: "",
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [newCoupon, setNewCoupon] = useState(initialCouponState);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const navigate = useNavigate();

  const API_BASE_URL = "http://localhost:5001/api";

  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found, please log in");
      const { data } = await axios.get(`${API_BASE_URL}/coupon`, getAuthConfig());
      setCoupons(data);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to fetch coupons";
      setError(errorMsg);
      if (err.response?.status === 401) {
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
      const { data } = await axios.get(`${API_BASE_URL}/user/all-users`, getAuthConfig());
      setUsers(data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
      setError(error.response?.data?.message || "Failed to fetch users");
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
    if (!newCoupon.name || !newCoupon.expiry || !newCoupon.discount) {
      setError("Coupon code, expiry date, and discount percentage are required!");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: newCoupon.name,
        expiry: newCoupon.expiry,
        discount: Number(newCoupon.discount),
        userId: newCoupon.userId || null,
      };
      
      await axios.post(`${API_BASE_URL}/coupon`, payload, getAuthConfig());
      setNewCoupon(initialCouponState);
      setSuccess("Coupon created successfully!");
      setError("");
      fetchCoupons();
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create coupon");
      toast.error(err.response?.data?.message || "Failed to create coupon");
    } finally {
      setLoading(false);
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
    setError("");
  };

  const handleUpdateCoupon = async (e) => {
    e.preventDefault();
    if (!newCoupon.name || !newCoupon.expiry || !newCoupon.discount) {
      setError("Coupon code, expiry date, and discount percentage are required!");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: newCoupon.name,
        expiry: newCoupon.expiry,
        discount: Number(newCoupon.discount),
        userId: newCoupon.userId || null,
      };
      
      await axios.put(
        `${API_BASE_URL}/coupon/${editingCoupon._id}`,
        payload,
        getAuthConfig()
      );
      
      setEditingCoupon(null);
      setNewCoupon(initialCouponState);
      setSuccess("Coupon updated successfully!");
      setError("");
      fetchCoupons();
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update coupon");
      toast.error(err.response?.data?.message || "Failed to update coupon");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCoupon = async () => {
    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/coupon/${couponToDelete}`, getAuthConfig());
      setSuccess("Coupon deleted successfully!");
      setError("");
      fetchCoupons();
      setIsDeleteModalOpen(false);
      setCouponToDelete(null);
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete coupon");
      toast.error(err.response?.data?.message || "Failed to delete coupon");
    } finally {
      setLoading(false);
    }
  };

  const filteredCoupons = coupons.filter((coupon) => {
    return (
      coupon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (coupon.user && `${coupon.user.firstname} ${coupon.user.lastname}`.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (coupon.user && coupon.user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  if (loading && !coupons.length) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center p-4 md:p-6">
          <div className="text-center">
            <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
            <p className="text-gray-600 text-lg">Loading coupons...</p>
          </div>
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
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Manage Coupons</h1>
          <p className="text-gray-600 text-base">
            Create, update, or delete coupons to offer discounts to your customers.
          </p>
        </motion.div>

        {/* Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border-l-4 border-red-500"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg border-l-4 border-green-500"
          >
            {success}
          </motion.div>
        )}

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search coupons by code or assigned user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:opacity-50"
              disabled={loading}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </motion.div>

        {/* Add/Edit Coupon Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200"
        >
          <div className="flex items-center gap-2 mb-4">
            {editingCoupon ? (
              <Edit2 size={24} className="text-blue-600" />
            ) : (
              <Plus size={24} className="text-blue-600" />
            )}
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
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
              >
                {editingCoupon ? (
                  <>
                    <Save size={20} className="mr-2" />
                    Update Coupon
                  </>
                ) : (
                  <>
                    <Plus size={20} className="mr-2" />
                    Add Coupon
                  </>
                )}
              </button>
              {editingCoupon && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingCoupon(null);
                    setNewCoupon(initialCouponState);
                    setError("");
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
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-lg shadow-md border border-gray-200 overflow-x-auto"
        >
          <div className="p-4 bg-gray-100 flex items-center gap-2">
            <Percent size={20} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Coupon List</h2>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              {filteredCoupons.length} {filteredCoupons.length === 1 ? "coupon" : "coupons"}
            </span>
          </div>
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
                {filteredCoupons.length > 0 ? (
                  filteredCoupons.map((coupon, index) => (
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
                          onClick={() => {
                            setCouponToDelete(coupon._id);
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-red-500 hover:text-red-600 transition-colors"
                          title="Delete Coupon"
                          disabled={loading}
                        >
                          <Trash2 size={20} />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-gray-200"
                  >
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        {searchTerm ? (
                          <>
                            <Search size={48} className="text-blue-600 mb-2" />
                            <p>No coupons found matching "{searchTerm}"</p>
                            <button
                              onClick={() => setSearchTerm("")}
                              className="mt-2 text-blue-500 hover:text-blue-600"
                            >
                              Clear search
                            </button>
                          </>
                        ) : (
                          <>
                            <Percent size={48} className="text-blue-600 mb-2" />
                            <p>No coupons found</p>
                            <p className="text-sm mt-1">Add a coupon using the form above</p>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </motion.div>

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
                className="bg-white rounded-lg shadow-md p-6 w-full max-w-sm relative"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                  title="Close"
                >
                  <X size={24} />
                </button>
                <div className="flex items-center gap-2 mb-4">
                  <Trash2 size={24} className="text-red-500" />
                  <h2 className="text-xl font-semibold text-gray-800">Confirm Deletion</h2>
                </div>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this coupon? This action cannot be undone.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={handleDeleteCoupon}
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

export default AdminCoupons;