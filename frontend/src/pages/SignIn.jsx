import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token) {
      if (role === "admin") navigate("/admin");
      else navigate("/");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5001/api/user/login",
        { email, password },
        { withCredentials: true }
      );
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.role || "user");
        localStorage.setItem("userId", response.data._id);
        toast.success("Signed in successfully!");
        if (response.data.role === "admin") navigate("/admin");
        else navigate("/");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed. Please try again.");
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
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-900 tracking-tight">Sign In</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2 sm:mt-3">
            Welcome back! Please sign in to your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="email"
                className="w-full pl-10 pr-3 py-2 sm:py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 transition-all duration-300 text-sm sm:text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type={showPassword ? "text" : "password"}
                className="w-full pl-10 pr-10 py-2 sm:py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 transition-all duration-300 text-sm sm:text-base"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900 transition-colors duration-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
            <div className="text-right mt-1 sm:mt-2">
              <Link
                to="/forgot-password"
                className="text-xs sm:text-sm text-blue-900 hover:text-orange-500 transition-colors duration-300"
                onClick={() => console.log("Navigating to Forgot Password")} // Debugging
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center bg-blue-900 text-white py-2 sm:py-3 rounded-full hover:bg-blue-500 transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mr-1 sm:mr-2" /> : null}
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-4 sm:mt-6 text-sm sm:text-base">
          Don’t have an account?{" "}
          <Link
            to="/account/create"
            className="text-blue-900 hover:text-orange-500 font-medium transition-colors duration-300"
            onClick={() => console.log("Navigating to Create Account")} // Debugging
          >
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SignIn;