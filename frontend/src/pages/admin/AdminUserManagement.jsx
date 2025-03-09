import React, { useState } from "react";
import { motion } from "framer-motion";
import { Edit2, Trash2 } from "lucide-react";

const initialUsers = [
  { id: 1, name: "Admin User", email: "admin@example.com", role: "Admin", photo: null },
  { id: 2, name: "Test User", email: "test@example.com", role: "User", photo: null },
  { id: 3, name: "Jane Doe", email: "jane@example.com", role: "User", photo: null },
];

const initialUserState = { name: "", email: "", role: "User", photo: null };

const AdminUserManagement = () => {
  const [users, setUsers] = useState(initialUsers);
  const [newUser, setNewUser] = useState(initialUserState);  // State for Add User
  const [selectedUser, setSelectedUser] = useState(null);     // State for editing an existing user
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");  // Error state

  const handleAddUser = (e) => {
    e.preventDefault();
    // Basic validation
    if (!newUser.name || !newUser.email || !newUser.role) {
      setError("All fields are required!");
      return;
    }
    try {
      const newId = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
      const newUserData = { ...newUser, id: newId };
      setUsers([...users, newUserData]);
      setNewUser(initialUserState); // Reset newUser state after adding
      setError(""); // Reset error
    } catch (err) {
      setError("Failed to add user. Please try again.");
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setNewUser(user); // Set user data to newUser for editing
    setIsEditing(true);
    setError(""); // Reset error when editing
  };

  const handleUpdateUser = () => {
    if (!newUser.name || !newUser.email || !newUser.role) {
      setError("All fields are required!");
      return;
    }
    try {
      setUsers(users.map(user => (user.id === newUser.id ? newUser : user)));
      setIsEditing(false);
      setNewUser(initialUserState); // Reset newUser state after update
      setError(""); // Reset error
    } catch (err) {
      setError("Failed to update user. Please try again.");
    }
  };

  const handleDeleteUser = (id) => {
    try {
      setUsers(users.filter(user => user.id !== id));
      setSelectedUser(null);
      setError(""); // Reset error after delete
    } catch (err) {
      setError("Failed to delete user. Please try again.");
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

      {/* Add User Form */}
      <form onSubmit={handleAddUser} className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New User</h2>
        {error && <div className="text-red-600 mb-4">{error}</div>} {/* Error Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            name="name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            placeholder="User Name"
            className="border p-2 rounded"
            required
          />
          <input
            type="email"
            name="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            placeholder="User Email"
            className="border p-2 rounded"
            required
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
            {newUser.photo && <img src={newUser.photo} alt="Preview" className="mt-2 w-20 h-20 object-cover" />}
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
        >
          Add User
        </button>
      </form>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 text-left">User ID</th>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Role</th>
              <th className="px-6 py-3 text-left">Photo</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <td className="px-6 py-4">{user.id}</td>
                <td className="px-6 py-4">{user.name}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">{user.role}</td>
                <td className="px-6 py-4">
                  {user.photo ? (
                    <img src={user.photo} alt="User" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <span>No Photo</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => handleEditUser(user)} className="text-yellow-600 hover:text-yellow-800 mr-2">
                    <Edit2 size={20} />
                  </button>
                  <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-800">
                    <Trash2 size={20} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Edit User</h2>
            {error && <div className="text-red-600 mb-4">{error}</div>} {/* Error Display */}
            <div className="grid grid-cols-1 gap-4">
              <input
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="User Name"
                className="border p-2 rounded"
                required
              />
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="User Email"
                className="border p-2 rounded"
                required
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
                {newUser.photo && <img src={newUser.photo} alt="Preview" className="mt-2 w-20 h-20 object-cover" />}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={handleUpdateUser} className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">
                Update User
              </button>
              <button onClick={() => setIsEditing(false)} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
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
