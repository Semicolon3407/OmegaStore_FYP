import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Edit, Lock, Eye, EyeOff, Save, X } from "lucide-react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [tempUser, setTempUser] = useState({});
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
  const navigate = useNavigate();
  const { token } = useParams(); // For reset password token (optional)

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
        toast.error("Failed to fetch user data");
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

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
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
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      toast.error("New passwords don't match");
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

      toast.success("Password updated successfully");
      setIsResettingPassword(false);
      setResetPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password");
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  if (!user) {
    return (
      <div className="bg-gray-100 min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-blue-900"></div>
          <p className="mt-3 sm:mt-4 text-gray-600 text-base sm:text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-12 sm:py-16 md:py-20 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-xl sm:max-w-2xl mx-auto"
        >
          <div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-900 mb-3 sm:mb-4 tracking-tight">
              Your Profile
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-md sm:max-w-xl mx-auto leading-relaxed">
              Manage your personal information and account settings
            </p>
          </div>

          <motion.div
            className="bg-white rounded-lg shadow-md hover:shadow-xl p-6 sm:p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8">
              <div className="flex items-center mb-4 sm:mb-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue-100 flex items-center justify-center mr-3 sm:mr-4">
                  <User size={24} sm:size={32} className="text-blue-900" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-blue-900">
                    {user.firstname} {user.lastname}
                  </h2>
                  <p className="text-gray-500 text-xs sm:text-sm">Account Member</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-900 hover:text-orange-500 flex items-center font-medium text-sm sm:text-base transition-colors duration-300"
                >
                  <Edit size={16} sm:size={20} className="mr-1 sm:mr-2" />
                  Edit Profile
                </button>
                <button
                  onClick={() => setIsResettingPassword(true)}
                  className="text-blue-900 hover:text-orange-500 flex items-center font-medium text-sm sm:text-base transition-colors duration-300"
                >
                  <Lock size={16} sm:size={20} className="mr-1 sm:mr-2" />
                  Change Password
                </button>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center">
                <Mail size={16} sm:size={20} className="text-gray-500 mr-3 sm:mr-4" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Email</p>
                  <p className="text-blue-900 font-medium text-sm sm:text-base">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone size={16} sm:size={20} className="text-gray-500 mr-3 sm:mr-4" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Phone</p>
                  <p className="text-blue-900 font-medium text-sm sm:text-base">{user.mobile || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-center">
                <MapPin size={16} sm:size={20} className="text-gray-500 mr-3 sm:mr-4" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Address</p>
                  <p className="text-blue-900 font-medium text-sm sm:text-base">{user.address || "Not provided"}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Edit Profile Modal */}
        {isEditing && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-md sm:max-w-lg"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl sm:text-2xl font-bold text-blue-900 mb-4 sm:mb-6">Edit Profile</h2>
              <form onSubmit={handleProfileSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <div className="relative">
                    <User size={16} sm:size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="firstname"
                      value={tempUser.firstname}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <div className="relative">
                    <User size={16} sm:size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="lastname"
                      value={tempUser.lastname}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail size={16} sm:size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={tempUser.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <div className="relative">
                    <Phone size={16} sm:size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      name="mobile"
                      value={tempUser.mobile}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Address</label>
                  <div className="relative">
                    <MapPin size={16} sm:size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="address"
                      value={tempUser.address}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-6">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 sm:px-5 py-2 text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors duration-300 flex items-center text-sm sm:text-base"
                  >
                    <X size={16} sm:size={18} className="mr-1 sm:mr-2" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 sm:px-5 py-2 bg-blue-900 text-white rounded-full hover:bg-blue-500 transition-all duration-300 flex items-center shadow-md text-sm sm:text-base"
                  >
                    <Save size={16} sm:size={18} className="mr-1 sm:mr-2" />
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Reset Password Modal */}
        {isResettingPassword && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-md sm:max-w-lg"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl sm:text-2xl font-bold text-blue-900 mb-4 sm:mb-6">Change Password</h2>
              <form onSubmit={handleResetPasswordSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <div className="relative">
                    <Lock size={16} sm:size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword.currentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={resetPasswordData.currentPassword}
                      onChange={handleResetPasswordChange}
                      className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("currentPassword")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showPassword.currentPassword ? <EyeOff size={16} sm:size={18} /> : <Eye size={16} sm:size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <div className="relative">
                    <Lock size={16} sm:size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword.newPassword ? "text" : "password"}
                      name="newPassword"
                      value={resetPasswordData.newPassword}
                      onChange={handleResetPasswordChange}
                      className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("newPassword")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showPassword.newPassword ? <EyeOff size={16} sm:size={18} /> : <Eye size={16} sm:size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <Lock size={16} sm:size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword.confirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={resetPasswordData.confirmPassword}
                      onChange={handleResetPasswordChange}
                      className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("confirmPassword")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showPassword.confirmPassword ? <EyeOff size={16} sm:size={18} /> : <Eye size={16} sm:size={18} />}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-6">
                  <button
                    type="button"
                    onClick={() => setIsResettingPassword(false)}
                    className="px-4 sm:px-5 py-2 text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors duration-300 flex items-center text-sm sm:text-base"
                  >
                    <X size={16} sm:size={18} className="mr-1 sm:mr-2" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 sm:px-5 py-2 bg-blue-900 text-white rounded-full hover:bg-blue-500 transition-all duration-300 flex items-center shadow-md text-sm sm:text-base"
                  >
                    <Save size={16} sm:size={18} className="mr-1 sm:mr-2" />
                    Update Password
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;