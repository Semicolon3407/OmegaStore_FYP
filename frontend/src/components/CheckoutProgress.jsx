import React from "react";
import { motion } from "framer-motion";

const CheckoutProgress = ({ currentStep }) => {
  const steps = ["Shipping", "Payment", "Review", "Confirmation"];

  return (
    <div className="flex justify-between mb-8">
      {steps.map((step, index) => (
        <div key={step} className="flex flex-col items-center">
          <motion.div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              index <= currentStep
                ? "bg-primary-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            {index + 1}
          </motion.div>
          <motion.span
            className={`mt-2 text-sm ${
              index <= currentStep
                ? "text-primary-600 font-semibold"
                : "text-gray-500"
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.2 }}
          >
            {step}
          </motion.span>
        </div>
      ))}
    </div>
  );
};

export default CheckoutProgress;