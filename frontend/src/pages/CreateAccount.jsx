import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Phone, MapPin, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

const formFields = [
  { id: "firstname", label: "First Name", type: "text", placeholder: "Enter your first name", icon: User, required: true },
  { id: "lastname", label: "Last Name", type: "text", placeholder: "Enter your last name", icon: User, required: true },
  { id: "email", label: "Email Address", type: "email", placeholder: "Enter your email", icon: Mail, required: true },
  { id: "mobile", label: "Mobile Number", type: "tel", placeholder: "Enter your mobile number", icon: Phone, required: true },
  { id: "address", label: "Address", type: "text", placeholder: "Enter your address", icon: MapPin, required: false },
];

const CreateAccount = () => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    mobile: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await axios.post("http://localhost:5001/api/user/register", formData);
      toast.success("Account created successfully! Please sign in.");
      navigate("/sign-in");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 flex items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12">
      <motion.div
        className="bg-white rounded-lg shadow-md hover:shadow-xl p-6 sm:p-8 w-full max-w-md sm:max-w-lg border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-900 tracking-tight">Create Account</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2 sm:mt-3">
            Join us today! Fill in the details to create your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {formFields.map(({ id, label, type, placeholder, icon: Icon, required }) => (
            <div key={id}>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{label}</label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type={type}
                  id={id}
                  className="w-full pl-10 pr-3 py-2 sm:py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 transition-all duration-300 text-sm sm:text-base"
                  placeholder={placeholder}
                  value={formData[id]}
                  onChange={handleChange}
                  required={required}
                />
              </div>
            </div>
          ))}

          {/* Password Field */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="w-full pl-10 pr-10 py-2 sm:py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 transition-all duration-300 text-sm sm:text-base"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900 transition-colors duration-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                className="w-full pl-10 pr-10 py-2 sm:py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 transition-all duration-300 text-sm sm:text-base"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900 transition-colors duration-300"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center bg-blue-900 text-white py-2 sm:py-3 rounded-full hover:bg-blue-500 transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </motion.button>
        </form>

        <p className="text-center text-gray-600 mt-4 sm:mt-6 text-sm sm:text-base">
          Already have an account?{" "}
          <Link
            to="/sign-in"
            className="text-blue-900 hover:text-orange-500 font-medium transition-colors duration-300"
          >
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default CreateAccount;