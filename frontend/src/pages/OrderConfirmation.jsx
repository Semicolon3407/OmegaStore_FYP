import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Package } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import CheckoutProgress from "../components/CheckoutProgress";

const OrderConfirmation = () => {
  const location = useLocation();
  const orderId = location.state?.orderId || "N/A";

  return (
    <div className="container mx-auto px-4 py-8">
      <CheckoutProgress currentStep={3} />
      <motion.div
        className="bg-white rounded-lg shadow-md p-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
        </motion.div>
        <motion.h1
          className="text-3xl font-bold mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Order Confirmed!
        </motion.h1>
        <motion.p
          className="text-xl text-gray-600 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Thank you for your purchase. Your order has been received and is being processed.
        </motion.p>
        <motion.div
          className="bg-gray-100 p-4 rounded-md mb-8 inline-block"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <h2 className="text-lg font-semibold mb-2">Order Number</h2>
          <p className="text-2xl font-bold text-blue-900">{orderId}</p>
        </motion.div>
        <motion.div
          className="flex justify-center items-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Package size={24} className="mr-2 text-blue-900" />
          <p className="text-lg">Estimated delivery: 3-5 business days</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <Link
            to="/"
            className="bg-blue-900 text-white px-6 py-3 rounded-md hover:bg-blue-800 transition-colors inline-block"
          >
            Continue Shopping
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OrderConfirmation;