import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Edit, Save, X, Check, Lock, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tempUser, setTempUser] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { token } = useParams(); // For reset password token (optional for forgot-password flow)
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        
        if (!token || !userId) {
          navigate("/sign-in");
          return;
        }

        const response = await axios.get(`http://localhost:5001/api/user/get-user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const userData = response.data.getaUser;
        setUser(userData);
        setTempUser({
          firstname: userData.firstname,
          lastname: userData.lastname,
          email: userData.email,
          mobile: userData.mobile,
          address: userData.address || "",
        });
      } catch (err) {
        setError("Failed to fetch user data");
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate("/sign-in");
        }
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetPasswordChange = (e) => {
    const { name, value } = e.target;
    setResetPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsResettingPassword(false);
    setTempUser({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      mobile: user.mobile,
      address: user.address || "",
    });
    setResetPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      const response = await axios.put(
        "http://localhost:5001/api/user/edit-user",
        { ...tempUser, _id: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser(response.data.user);
      setIsEditing(false);
      setSuccess("Profile updated successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:5001/api/user/password",
        {
          currentPassword: resetPasswordData.currentPassword,
          newPassword: resetPasswordData.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("Password updated successfully");
      setIsResettingPassword(false);
      setResetPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password");
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-md mx-auto"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <motion.h1
            className="text-3xl font-extrabold text-gray-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            User Profile
          </motion.h1>
          <p className="mt-2 text-sm text-gray-600">
            {isEditing || isResettingPassword ? "Update your information" : "View and manage your profile"}
          </p>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4">{success}</div>}

        <motion.div
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-6 sm:p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                  <User className="text-indigo-600" size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  {user.firstname} {user.lastname}
                </h2>
              </div>
              {!isEditing && !isResettingPassword && (
                <div className="space-x-2">
                  <button
                    onClick={handleEditClick}
                    className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    <Edit className="mr-1" size={16} />
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setIsResettingPassword(true)}
                    className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    <Lock className="mr-1" size={16} />
                    Change Password
                  </button>
                </div>
              )}
            </div>

            {isResettingPassword ? (
              <form onSubmit={handleResetPasswordSubmit}>
                <div className="space-y-5">
                  <div className="relative">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="text-gray-400" size={18} />
                      </div>
                      <input
                        className="block w-full pl-10 pr-10 py-2 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring-0 transition-colors"
                        type={showPassword.currentPassword ? "text" : "password"}
                        name="currentPassword"
                        value={resetPasswordData.currentPassword}
                        onChange={handleResetPasswordChange}
                        required
                      />
                      <div
                        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                        onClick={() => togglePasswordVisibility("currentPassword")}
                      >
                        {showPassword.currentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="text-gray-400" size={18} />
                      </div>
                      <input
                        className="block w-full pl-10 pr-10 py-2 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring-0 transition-colors"
                        type={showPassword.newPassword ? "text" : "password"}
                        name="newPassword"
                        value={resetPasswordData.newPassword}
                        onChange={handleResetPasswordChange}
                        required
                      />
                      <div
                        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                        onClick={() => togglePasswordVisibility("newPassword")}
                      >
                        {showPassword.newPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="text-gray-400" size={18} />
                      </div>
                      <input
                        className="block w-full pl-10 pr-10 py-2 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring-0 transition-colors"
                        type={showPassword.confirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={resetPasswordData.confirmPassword}
                        onChange={handleResetPasswordChange}
                        required
                      />
                      <div
                        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                        onClick={() => togglePasswordVisibility("confirmPassword")}
                      >
                        {showPassword.confirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <X className="mr-2" size={16} />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Check className="mr-2" size={16} />
                    Update Password
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleProfileSubmit}>
                <div className="space-y-5">
                  <div className="relative">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      First Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="text-gray-400" size={18} />
                      </div>
                      <input
                        className={`block w-full pl-10 pr-3 py-2 rounded-lg border-2 ${
                          isEditing ? "border-gray-200 focus:border-indigo-500" : "border-transparent bg-gray-50"
                        } focus:ring-0 transition-colors`}
                        type="text"
                        name="firstname"
                        value={tempUser.firstname}
                        onChange={handleInputChange}
                        readOnly={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      Last Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="text-gray-400" size={18} />
                      </div>
                      <input
                        className={`block w-full pl-10 pr-3 py-2 rounded-lg border-2 ${
                          isEditing ? "border-gray-200 focus:border-indigo-500" : "border-transparent bg-gray-50"
                        } focus:ring-0 transition-colors`}
                        type="text"
                        name="lastname"
                        value={tempUser.lastname}
                        onChange={handleInputChange}
                        readOnly={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="text-gray-400" size={18} />
                      </div>
                      <input
                        className={`block w-full pl-10 pr-3 py-2 rounded-lg border-2 ${
                          isEditing ? "border-gray-200 focus:border-indigo-500" : "border-transparent bg-gray-50"
                        } focus:ring-0 transition-colors`}
                        type="email"
                        name="email"
                        value={tempUser.email}
                        onChange={handleInputChange}
                        readOnly={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="text-gray-400" size={18} />
                      </div>
                      <input
                        className={`block w-full pl-10 pr-3 py-2 rounded-lg border-2 ${
                          isEditing ? "border-gray-200 focus:border-indigo-500" : "border-transparent bg-gray-50"
                        } focus:ring-0 transition-colors`}
                        type="tel"
                        name="mobile"
                        value={tempUser.mobile}
                        onChange={handleInputChange}
                        readOnly={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="text-gray-400" size={18} />
                      </div>
                      <input
                        className={`block w-full pl-10 pr-3 py-2 rounded-lg border-2 ${
                          isEditing ? "border-gray-200 focus:border-indigo-500" : "border-transparent bg-gray-50"
                        } focus:ring-0 transition-colors`}
                        type="text"
                        name="address"
                        value={tempUser.address}
                        onChange={handleInputChange}
                        readOnly={!isEditing}
                      />
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-8 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <X className="mr-2" size={16} />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Save className="mr-2" size={16} />
                      Save Changes
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default UserProfile;