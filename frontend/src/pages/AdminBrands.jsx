import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import AdminSidebar from "../components/AdminNav";
import AdminBrandManager from "../components/AdminBrandManager";

const AdminBrandsPage = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Helper function to handle success messages
  const showSuccess = (message) => {
    setSuccess(message);
    toast.success(message);
    // Auto-clear the success message after 5 seconds
    setTimeout(() => setSuccess(""), 5000);
  };

  // Helper function to handle error messages
  const showError = (message) => {
    setError(message);
    toast.error(message);
    // Auto-clear the error message after 5 seconds
    setTimeout(() => setError(""), 5000);
  };

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
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Manage Brands</h1>
          <p className="text-gray-600 text-base">
            Add, edit, or manage brand information.
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

        <AdminBrandManager 
          showSuccess={showSuccess} 
          showError={showError} 
        />
      </div>
    </div>
  );
};

export default AdminBrandsPage;