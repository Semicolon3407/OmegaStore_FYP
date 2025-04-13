import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit2,
  Trash2,
  UserPlus,
  Users,
  Search,
  X,
  Save,
  UserCheck,
  Lock,
  Unlock,
  Loader2,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import AdminSidebar from "../../components/AdminNav";

const initialUserState = {
  id: "",
  name: "",
  email: "",
  role: "User",
  mobile: "",
  address: "",
  photo: null,
};

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState(initialUserState);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isUnblockModalOpen, setIsUnblockModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToBlock, setUserToBlock] = useState(null);
  const [userToUnblock, setUserToUnblock] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const API_URL = "http://localhost:5001/api/user";

  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`${API_URL}/all-users`, getAuthConfig());
      setUsers(response.data);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to fetch users. Please try again.";
      setError(errorMsg);
      if (err.response?.status === 401) {
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
      fetchUsers();
    }
  }, [navigate, location.pathname]);

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.role) {
      setError("Name, email, and role are required!");
      return;
    }

    try {
      setLoading(true);
      const userData = {
        firstname: newUser.name.split(" ")[0],
        lastname: newUser.name.split(" ").slice(1).join(" ") || "",
        email: newUser.email,
        mobile: newUser.mobile || "",
        address: newUser.address || "",
        password: "password123",
        role: newUser.role,
        photo: newUser.photo || null,
      };
      await axios.post(`${API_URL}/register`, userData, getAuthConfig());
      setNewUser(initialUserState);
      setSuccess("User added successfully! Temporary password: password123");
      setError("");
      fetchUsers();
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add user.");
      toast.error(err.response?.data?.message || "Failed to add user.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    const editUser = {
      id: user._id,
      name: `${user.firstname} ${user.lastname}`.trim(),
      email: user.email,
      role: user.role || "User",
      mobile: user.mobile || "",
      address: user.address || "",
      photo: user.photo || null,
    };
    setSelectedUser(user);
    setNewUser(editUser);
    setIsEditing(true);
    setError("");
  };

  const handleUpdateUser = async () => {
    if (!newUser.name || !newUser.email) {
      setError("Name and email are required!");
      return;
    }

    try {
      setLoading(true);
      const userData = {
        _id: newUser.id,
        firstname: newUser.name.split(" ")[0],
        lastname: newUser.name.split(" ").slice(1).join(" ") || "",
        email: newUser.email,
        mobile: newUser.mobile || "",
        address: newUser.address || "",
        role: newUser.role || "User",
        photo: newUser.photo || null,
      };
      await axios.put(`${API_URL}/edit-user`, userData, getAuthConfig());
      setIsEditing(false);
      setNewUser(initialUserState);
      setSelectedUser(null);
      setSuccess("User updated successfully!");
      setError("");
      fetchUsers();
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user.");
      toast.error(err.response?.data?.message || "Failed to update user.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/delete-user/${userToDelete}`, getAuthConfig());
      setSuccess("User deleted successfully!");
      setError("");
      fetchUsers();
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user.");
      toast.error(err.response?.data?.message || "Failed to delete user.");
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async () => {
    try {
      setLoading(true);
      await axios.put(`${API_URL}/block-user/${userToBlock}`, {}, getAuthConfig());
      setSuccess("User blocked successfully!");
      setError("");
      fetchUsers();
      setIsBlockModalOpen(false);
      setUserToBlock(null);
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to block user.");
      toast.error(err.response?.data?.message || "Failed to block user.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockUser = async () => {
    try {
      setLoading(true);
      await axios.put(`${API_URL}/unblock-user/${userToUnblock}`, {}, getAuthConfig());
      setSuccess("User unblocked successfully!");
      setError("");
      fetchUsers();
      setIsUnblockModalOpen(false);
      setUserToUnblock(null);
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to unblock user.");
      toast.error(err.response?.data?.message || "Failed to unblock user.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewUser({ ...newUser, photo: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.firstname} ${user.lastname}`.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.mobile && user.mobile.includes(searchTerm))
    );
  });

  if (loading && !users.length) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center p-4 md:p-6">
          <div className="text-center">
            <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
            <p className="text-gray-600 text-lg">Loading users...</p>
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
          <h1 className="text-3xl font-bold text-blue-900 mb-2">User Management</h1>
          <p className="text-gray-600 text-base">
            Add, edit, or manage user roles and statuses.
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
              placeholder="Search users by name, email, or mobile..."
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

        {/* Add User Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200"
        >
          <div className="flex items-center gap-2 mb-4">
            <UserPlus size={24} className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Add New User</h2>
          </div>
          <form onSubmit={handleAddUser}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="e.g., John Doe"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:opacity-50"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="e.g., john@example.com"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:opacity-50"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Mobile Number</label>
                <input
                  type="tel"
                  value={newUser.mobile}
                  onChange={(e) => setNewUser({ ...newUser, mobile: e.target.value })}
                  placeholder="e.g., 123-456-7890"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:opacity-50"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Address</label>
                <input
                  type="text"
                  value={newUser.address}
                  onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                  placeholder="e.g., 123 Main St"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:opacity-50"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:opacity-50"
                  required
                  disabled={loading}
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Profile Photo</label>
                <input
                  type="file"
                  onChange={handlePhotoChange}
                  accept="image/*"
                  className="w-full p-2 border border-gray-300 rounded-lg disabled:opacity-50"
                  disabled={loading}
                />
                {newUser.photo && (
                  <img
                    src={newUser.photo}
                    alt="Preview"
                    className="mt-2 h-16 w-16 rounded-full object-cover border border-gray-200"
                  />
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-6 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              <UserPlus size={20} className="mr-2" />
              Add User
            </button>
          </form>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-lg shadow-md border border-gray-200 overflow-x-auto"
        >
          <div className="p-4 bg-gray-100 flex items-center gap-2">
            <UserCheck size={20} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">User List</h2>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              {filteredUsers.length} {filteredUsers.length === 1 ? "user" : "users"}
            </span>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-gray-700 font-medium">Name</th>
                <th className="px-4 py-3 text-gray-700 font-medium">Email</th>
                <th className="px-4 py-3 text-gray-700 font-medium">Mobile</th>
                <th className="px-4 py-3 text-gray-700 font-medium">Role</th>
                <th className="px-4 py-3 text-gray-700 font-medium">Status</th>
                <th className="px-4 py-3 text-gray-700 font-medium">Photo</th>
                <th className="px-4 py-3 text-gray-700 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-gray-800">
                        {`${user.firstname} ${user.lastname}`}
                      </td>
                      <td className="px-4 py-3 text-gray-800">{user.email}</td>
                      <td className="px-4 py-3 text-gray-800">{user.mobile || "N/A"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === "Admin"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {user.role || "User"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.isBlocked
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {user.isBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {user.photo ? (
                          <img
                            src={user.photo}
                            alt={`${user.firstname} ${user.lastname}`}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
                            {user.firstname.charAt(0)}
                            {user.lastname ? user.lastname.charAt(0) : ""}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 flex gap-3 items-center">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-orange-500 hover:text-orange-600 transition-colors"
                          title="Edit User"
                          disabled={loading}
                        >
                          <Edit2 size={20} />
                        </button>
                        {user.isBlocked ? (
                          <button
                            onClick={() => {
                              setUserToUnblock(user._id);
                              setIsUnblockModalOpen(true);
                            }}
                            className="text-green-500 hover:text-green-600 transition-colors"
                            title="Unblock User"
                            disabled={loading}
                          >
                            <Unlock size={20} />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setUserToBlock(user._id);
                              setIsBlockModalOpen(true);
                            }}
                            className="text-red-500 hover:text-red-600 transition-colors"
                            title="Block User"
                            disabled={loading}
                          >
                            <Lock size={20} />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setUserToDelete(user._id);
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-red-500 hover:text-red-600 transition-colors"
                          title="Delete User"
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
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        {searchTerm ? (
                          <>
                            <Search size={48} className="text-blue-600 mb-2" />
                            <p>No users found matching "{searchTerm}"</p>
                            <button
                              onClick={() => setSearchTerm("")}
                              className="mt-2 text-blue-500 hover:text-blue-600"
                            >
                              Clear search
                            </button>
                          </>
                        ) : (
                          <>
                            <Users size={48} className="text-blue-600 mb-2" />
                            <p>No users found</p>
                            <p className="text-sm mt-1">Add a user using the form above</p>
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

        {/* Edit User Modal */}
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
                className="bg-white rounded-lg shadow-md p-6 w-full max-w-md relative"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setNewUser(initialUserState);
                    setSelectedUser(null);
                  }}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                  title="Close"
                >
                  <X size={24} />
                </button>
                <div className="flex items-center gap-2 mb-4">
                  <UserCheck size={24} className="text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Edit User</h2>
                </div>
                {error && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm border-l-4 border-red-500">
                    {error}
                  </div>
                )}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-1 font-medium">Full Name</label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="e.g., John Doe"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:opacity-50"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1 font-medium">Email</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="e.g., john@example.com"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:opacity-50"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1 font-medium">Mobile Number</label>
                    <input
                      type="tel"
                      value={newUser.mobile}
                      onChange={(e) => setNewUser({ ...newUser, mobile: e.target.value })}
                      placeholder="e.g., 123-456-7890"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:opacity-50"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1 font-medium">Address</label>
                    <input
                      type="text"
                      value={newUser.address}
                      onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                      placeholder="e.g., 123 Main St"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:opacity-50"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1 font-medium">Role</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:opacity-50"
                      required
                      disabled={loading}
                    >
                      <option value="User">User</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1 font-medium">Profile Photo</label>
                    <input
                      type="file"
                      onChange={handlePhotoChange}
                      accept="image/*"
                      className="w-full p-2 border border-gray-300 rounded-lg disabled:opacity-50"
                      disabled={loading}
                    />
                    {newUser.photo && (
                      <img
                        src={newUser.photo}
                        alt="Preview"
                        className="mt-2 h-16 w-16 rounded-full object-cover border border-gray-200"
                      />
                    )}
                  </div>
                </div>
                <div className="mt-6 flex gap-4">
                  <button
                    onClick={handleUpdateUser}
                    disabled={loading}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                  >
                    <Save size={20} className="mr-2" />
                    Update User
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setNewUser(initialUserState);
                      setSelectedUser(null);
                    }}
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
                  Are you sure you want to delete this user? This action cannot be undone.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={handleDeleteUser}
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

        {/* Block Confirmation Modal */}
        <AnimatePresence>
          {isBlockModalOpen && (
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
                  onClick={() => setIsBlockModalOpen(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                  title="Close"
                >
                  <X size={24} />
                </button>
                <div className="flex items-center gap-2 mb-4">
                  <Lock size={24} className="text-red-500" />
                  <h2 className="text-xl font-semibold text-gray-800">Confirm Block</h2>
                </div>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to block this user? They will lose access to the system.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={handleBlockUser}
                    disabled={loading}
                    className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Block
                  </button>
                  <button
                    onClick={() => setIsBlockModalOpen(false)}
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

        {/* Unblock Confirmation Modal */}
        <AnimatePresence>
          {isUnblockModalOpen && (
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
                  onClick={() => setIsUnblockModalOpen(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                  title="Close"
                >
                  <X size={24} />
                </button>
                <div className="flex items-center gap-2 mb-4">
                  <Unlock size={24} className="text-green-500" />
                  <h2 className="text-xl font-semibold text-gray-800">Confirm Unblock</h2>
                </div>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to unblock this user? They will regain access to the system.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={handleUnblockUser}
                    disabled={loading}
                    className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Unblock
                  </button>
                  <button
                    onClick={() => setIsUnblockModalOpen(false)}
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

export default AdminUserManagement;