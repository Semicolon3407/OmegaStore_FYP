import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CheckoutProgress from "../components/CheckoutProgress";

const Checkout = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    country: "",
    zipCode: "",
    EsewaID: "",
    expiryDate: "",
    cvv: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step < 2) {
      setStep(step + 1);
    } else {
      // Here we would typically process the payment and create an order
      console.log("Order submitted:", formData);
      // Navigate to order confirmation page
      navigate("/order-confirmation");
    }
  };

  const pageVariants = {
    initial: { opacity: 0, x: "-100%" },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: "100%" },
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5,
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <motion.div
            key="shipping"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label htmlFor="city" className="block text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label htmlFor="country" className="block text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label htmlFor="zipCode" className="block text-gray-700 mb-2">
                  Zip Code
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
          </motion.div>
        );
      case 1:
        return (
          <motion.div
            key="payment"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label
                  htmlFor="cardNumber"
                  className="block text-gray-700 mb-2"
                >
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    required
                    className="w-full p-2 pl-10 border rounded-md"
                  />
                  <CreditCard
                    className="absolute left-3 top-2.5 text-gray-400"
                    size={20}
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="expiryDate"
                  className="block text-gray-700 mb-2"
                >
                  Expiry Date
                </label>
                <input
                  type="text"
                  id="expiryDate"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  required
                  placeholder="MM/YY"
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label htmlFor="cvv" className="block text-gray-700 mb-2">
                  CVV
                </label>
                <input
                  type="text"
                  id="cvv"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            key="review"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <h2 className="text-xl font-semibold mb-4">Review Your Order</h2>
            <div className="bg-gray-100 p-4 rounded-md mb-4">
              <h3 className="font-semibold mb-2">Shipping Information</h3>
              <p>{formData.name}</p>
              <p>{formData.email}</p>
              <p>{formData.address}</p>
              <p>
                {formData.city}, {formData.country} {formData.zipCode}
              </p>
            </div>
            <div className="bg-gray-100 p-4 rounded-md mb-4">
              <h3 className="font-semibold mb-2">Payment Information</h3>
              <p>Card ending in {formData.cardNumber.slice(-4)}</p>
              <p>Expires {formData.expiryDate}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-md mb-4">
              <h3 className="font-semibold mb-2">Order Summary</h3>
              {/* Add order summary details here */}
              <p>Total: $XXX.XX</p>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <CheckoutProgress currentStep={step} />
      <motion.form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-md p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
        <div className="mt-6 flex justify-between">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="bg-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-400 transition-colors"
            >
              Back
            </button>
          )}
          <motion.button
            type="submit"
            className="bg-primary-600 text-white px-6 py-3 rounded-md flex items-center hover:bg-primary-700 transition-colors ml-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {step < 2 ? "Continue" : "Place Order"}
            <Lock className="ml-2" size={20} />
          </motion.button>
        </div>
      </motion.form>
    </div>
  );
};

export default Checkout;