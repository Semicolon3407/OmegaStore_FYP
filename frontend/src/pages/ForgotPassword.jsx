import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("http://localhost:5001/api/user/forgot-password-token", { email });
      toast.success("OTP sent to your email!");
      console.log("Navigating to Reset Password"); 
      navigate("/reset-password");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP. Please try again.");
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
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-900 tracking-tight">Forgot Password</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2 sm:mt-3">
            Enter your email to receive a one-time password (OTP).
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

          <button
            type="submit"
            className="w-full flex items-center justify-center bg-blue-900 text-white py-2 sm:py-3 rounded-full hover:bg-blue-500 transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mr-1 sm:mr-2" /> : null}
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;