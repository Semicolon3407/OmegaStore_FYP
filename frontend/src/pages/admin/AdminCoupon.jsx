import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tag, Edit2, Trash2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/AdminNav';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCoupon, setNewCoupon] = useState({
    name: '',
    expiry: '',
    discount: '',
    userId: '',
  });
  const [editingCoupon, setEditingCoupon] = useState(null);
  const navigate = useNavigate();

  const API_BASE_URL = 'http://localhost:5001/api';

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found, please log in');
      const { data } = await axios.get(`${API_BASE_URL}/coupon`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoupons(data);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch coupons';
      setError(errorMsg);
      if (error.response?.status === 401) {
        toast.info('Session expired, please login');
        navigate('/sign-in');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found, please log in');
      const { data } = await axios.get(`${API_BASE_URL}/user/all-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch users');
      setUsers([]);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      toast.info('Access denied. Admins only.');
      navigate('/sign-in');
    } else {
      Promise.all([fetchCoupons(), fetchUsers()]).catch(() => {
        setLoading(false);
      });
    }
  }, [navigate]);

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
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
      setNewCoupon({ name: '', expiry: '', discount: '', userId: '' });
      toast.success('Coupon created successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create coupon');
    }
  };

  const handleEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setNewCoupon({
      name: coupon.name,
      expiry: new Date(coupon.expiry).toISOString().split('T')[0],
      discount: coupon.discount,
      userId: coupon.user?._id || '',
    });
  };

  const handleUpdateCoupon = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
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
      setNewCoupon({ name: '', expiry: '', discount: '', userId: '' });
      toast.success('Coupon updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update coupon');
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/coupon/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoupons(coupons.filter((c) => c._id !== id));
      toast.success('Coupon deleted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete coupon');
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen pt-40 lg:pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading coupons...</p>
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
            onClick={() => fetchCoupons()}
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
      <div className="container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Manage Coupons
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
            Create, update, or delete coupons to offer discounts to your customers.
          </p>
        </motion.div>

        {/* Add/Edit Coupon Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-200"
        >
          <h2 className="text-xl font-semibold mb-4">
            {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
          </h2>
          <form onSubmit={editingCoupon ? handleUpdateCoupon : handleAddCoupon}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Coupon Code</label>
                <input
                  type="text"
                  value={newCoupon.name}
                  onChange={(e) =>
                    setNewCoupon({ ...newCoupon, name: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g., SUMMER20"
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Expiry Date</label>
                <input
                  type="date"
                  value={newCoupon.expiry}
                  onChange={(e) => setNewCoupon({ ...newCoupon, expiry: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Discount (%)</label>
                <input
                  type="number"
                  value={newCoupon.discount}
                  onChange={(e) =>
                    setNewCoupon({ ...newCoupon, discount: e.target.value })
                  }
                  placeholder="e.g., 20"
                  min="1"
                  max="100"
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Assign to User (Optional)</label>
                <select
                  value={newCoupon.userId}
                  onChange={(e) => setNewCoupon({ ...newCoupon, userId: e.target.value })}
                  className="w-full p-2 border rounded-md"
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
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-blue-900 text-white px-6 py-2 rounded-md hover:bg-blue-800 transition-all duration-300"
              >
                {editingCoupon ? 'Update Coupon' : 'Add Coupon'}
              </button>
              {editingCoupon && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingCoupon(null);
                    setNewCoupon({ name: '', expiry: '', discount: '', userId: '' });
                  }}
                  className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-all duration-300"
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
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-x-auto"
        >
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 text-left">Coupon Code</th>
                <th className="px-6 py-3 text-left">Discount</th>
                <th className="px-6 py-3 text-left">Expiry</th>
                <th className="px-6 py-3 text-left">Assigned User</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <motion.tr
                  key={coupon._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td className="px-6 py-4">{coupon.name}</td>
                  <td className="px-6 py-4">{coupon.discount}%</td>
                  <td className="px-6 py-4">
                    {new Date(coupon.expiry).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {coupon.user
                      ? `${coupon.user.firstname} ${coupon.user.lastname} (${coupon.user.email})`
                      : 'All Users'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        new Date(coupon.expiry) >= new Date()
                          ? 'bg-green-200 text-green-800'
                          : 'bg-red-200 text-red-800'
                      }`}
                    >
                      {new Date(coupon.expiry) >= new Date() ? 'Active' : 'Expired'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEditCoupon(coupon)}
                      className="text-yellow-600 hover:text-yellow-800 mr-4"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteCoupon(coupon._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminCoupons;