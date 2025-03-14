import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Edit2, Trash2 } from "lucide-react";
import axios from "axios";

const initialUserState = { name: "", email: "", role: "User", mobile: "", address: "", photo: null };

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState(initialUserState);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const API_URL = "http://localhost:5001/api/user";
  const token = localStorage.getItem("token"); // Assuming token is stored in localStorage
  
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // Fetch all users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/all-users`, config);
      setUsers(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch users. " + (err.response?.data?.message || "Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!newUser.name || !newUser.email || !newUser.role) {
      setError("All fields are required!");
      return;
    }
    
    try {
      setLoading(true);
      // Create user including a temporary password (which they can change later)
      const userData = {
        firstname: newUser.name.split(" ")[0],
        lastname: newUser.name.split(" ").slice(1).join(" ") || "",
        email: newUser.email,
        mobile: newUser.mobile || "",
        address: newUser.address || "",
        password: "password123", // Set a temporary password
        role: newUser.role,
        photo: newUser.photo || null
      };
      
      await axios.post(`${API_URL}/register`, userData, config);
      setNewUser(initialUserState);
      fetchUsers(); // Refresh the user list
      setError("");
    } catch (err) {
      setError("Failed to add user. " + (err.response?.data?.message || "Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    // Format user data for editing
    const editUser = {
      id: user._id, // Assuming MongoDB _id
      name: `${user.firstname} ${user.lastname}`.trim(),
      email: user.email,
      role: user.role || "User",
      mobile: user.mobile || "",
      address: user.address || "",
      photo: user.photo || null
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
      // Format data for API
      const userData = {
        _id: newUser.id,
        firstname: newUser.name.split(" ")[0],
        lastname: newUser.name.split(" ").slice(1).join(" ") || "",
        email: newUser.email,
        mobile: newUser.mobile || "",
        address: newUser.address || "",
        role: newUser.role || "User",
        photo: newUser.photo || null
      };
      
      await axios.put(`${API_URL}/edit-user`, userData, config);
      setIsEditing(false);
      setNewUser(initialUserState);
      fetchUsers(); // Refresh the user list
      setError("");
    } catch (err) {
      setError("Failed to update user. " + (err.response?.data?.message || "Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }
    
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/${id}`, config);
      fetchUsers(); // Refresh the user list
      setError("");
    } catch (err) {
      setError("Failed to delete user. " + (err.response?.data?.message || "Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async (id, address) => {
    try {
      setLoading(true);
      await axios.put(`${API_URL}/save-address`, { id, address }, config);
      fetchUsers(); // Refresh the user list
      setError("");
    } catch (err) {
      setError("Failed to save address. " + (err.response?.data?.message || "Please try again."));
    } finally {
      setLoading(false);
    }
  };

  // Handle file input change for the photo
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewUser({ ...newUser, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Users</h1>
      
      {loading && <div className="text-center p-4">Loading...</div>}
      {error && <div className="text-red-600 mb-4 p-3 bg-red-100 rounded">{error}</div>}

      {/* Add User Form */}
      <form onSubmit={handleAddUser} className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New User</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            type="text"
            name="name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            placeholder="Full Name"
            className="border p-2 rounded"
            required
          />
          <input
            type="email"
            name="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            placeholder="Email"
            className="border p-2 rounded"
            required
          />
          <input
            type="tel"
            name="mobile"
            value={newUser.mobile}
            onChange={(e) => setNewUser({ ...newUser, mobile: e.target.value })}
            placeholder="Mobile Number"
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="address"
            value={newUser.address}
            onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
            placeholder="Address"
            className="border p-2 rounded"
          />
          <select
            name="role"
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            className="border p-2 rounded"
            required
          >
            <option value="User">User</option>
            <option value="Admin">Admin</option>
          </select>

          {/* File Input for Photo */}
          <div className="col-span-1">
            <input
              type="file"
              onChange={handlePhotoChange}
              accept="image/*"
              className="border p-2 rounded w-full"
            />
            {newUser.photo && <img src={newUser.photo} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded" />}
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add User"}
        </button>
      </form>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Mobile</th>
              <th className="px-6 py-3 text-left">Role</th>
              <th className="px-6 py-3 text-left">Address</th>
              <th className="px-6 py-3 text-left">Photo</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <motion.tr 
                key={user._id} 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="border-b"
              >
                <td className="px-6 py-4">{`${user.firstname} ${user.lastname}`}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">{user.mobile || "N/A"}</td>
                <td className="px-6 py-4">{user.role || "User"}</td>
                <td className="px-6 py-4">{user.address || "N/A"}</td>
                <td className="px-6 py-4">
                  {user.photo ? (
                    <img src={user.photo} alt="User" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <span>No Photo</span>
                  )}
                </td>
                <td className="px-6 py-4 flex">
                  <button 
                    onClick={() => handleEditUser(user)} 
                    className="text-yellow-600 hover:text-yellow-800 mr-2"
                    disabled={loading}
                  >
                    <Edit2 size={20} />
                  </button>
                  <button 
                    onClick={() => handleDeleteUser(user._id)} 
                    className="text-red-600 hover:text-red-800"
                    disabled={loading}
                  >
                    <Trash2 size={20} />
                  </button>
                </td>
              </motion.tr>
            ))}
            {users.length === 0 && !loading && (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">Edit User</h2>
            {error && <div className="text-red-600 mb-4 p-3 bg-red-100 rounded">{error}</div>}
            <div className="grid grid-cols-1 gap-4">
              <input
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Full Name"
                className="border p-2 rounded"
                required
              />
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="Email"
                className="border p-2 rounded"
                required
              />
              <input
                type="tel"
                value={newUser.mobile}
                onChange={(e) => setNewUser({ ...newUser, mobile: e.target.value })}
                placeholder="Mobile Number"
                className="border p-2 rounded"
              />
              <input
                type="text"
                value={newUser.address}
                onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                placeholder="Address"
                className="border p-2 rounded"
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="border p-2 rounded"
                required
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>

              {/* File Input for Photo in Modal */}
              <div className="col-span-1">
                <input
                  type="file"
                  onChange={handlePhotoChange}
                  accept="image/*"
                  className="border p-2 rounded w-full"
                />
                {newUser.photo && <img src={newUser.photo} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded" />}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button 
                onClick={handleUpdateUser} 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update User"}
              </button>
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setNewUser(initialUserState);
                }} 
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;