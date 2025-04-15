import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Lock, Wallet } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import CheckoutProgress from "../components/CheckoutProgress";
import { useCart } from "../Context/cartContext";
import axios from "axios";
import { toast } from "react-toastify";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, cartTotal, totalAfterDiscount, emptyCart } = useCart();
  const [step, setStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    phone: "",
  });
  const [error, setError] = useState(null);

  const couponCode = location.state?.couponCode || null;

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const errorMsg = query.get("error");
    if (errorMsg) {
      toast.error(errorMsg);
      setError(errorMsg);
    }
  }, [location.search]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handleEsewaPayment = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to place an order");
      }

      // Show test credentials alert
      toast.info(
        "For testing, use these eSewa credentials:\neSewa ID: 9806800001\nPassword: Nepal@123\nToken: 123456",
        { autoClose: 10000 }
      );

      const response = await axios.post(
        "http://localhost:5001/api/user/esewa/initiate-payment",
        {
          couponApplied: !!couponCode,
          couponCode,
          shippingInfo: formData,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { formData: paymentFormData, paymentUrl } = response.data;

      // Create and submit form to redirect to eSewa
      const form = document.createElement("form");
      form.method = "POST";
      form.action = paymentUrl;

      Object.keys(paymentFormData).forEach((key) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = paymentFormData[key];
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error("Error initiating eSewa payment:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to initiate payment";
      toast.error(errorMessage);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 2) {
      setStep(step + 1);
    } else {
      if (paymentMethod === "COD") {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Please log in to place an order");
          }
          const response = await axios.post(
            "http://localhost:5001/api/user/cart/cash-order",
            {
              COD: true,
              couponApplied: !!couponCode,
              couponCode,
              shippingInfo: formData,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          await emptyCart();
          toast.success("Order placed successfully!");
          navigate("/order-confirmation", {
            state: { orderId: response.data.orderId },
          });
        } catch (error) {
          console.error("Error creating order:", error);
          const errorMessage =
            error.response?.data?.message || "Failed to place order";
          toast.error(errorMessage);
        }
      } else if (paymentMethod === "eSewa") {
        await handleEsewaPayment();
      }
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
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-900"
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
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-900"
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
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-900"
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
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-900"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-900"
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
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
            <div className="space-y-4">
              <div className="flex items-center p-4 border rounded-md cursor-pointer hover:bg-gray-100">
                <input
                  type="radio"
                  id="cod"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={() => handlePaymentMethodChange("COD")}
                  className="mr-3 text-blue-900 focus:ring-blue-900"
                />
                <label htmlFor="cod" className="flex items-center cursor-pointer">
                  <CreditCard className="mr-2" size={20} />
                  Cash on Delivery
                </label>
              </div>
              <div className="flex items-center p-4 border rounded-md cursor-pointer hover:bg-gray-100">
                <input
                  type="radio"
                  id="esewa"
                  name="paymentMethod"
                  value="eSewa"
                  checked={paymentMethod === "eSewa"}
                  onChange={() => handlePaymentMethodChange("eSewa")}
                  className="mr-3 text-blue-900 focus:ring-blue-900"
                />
                <label htmlFor="esewa" className="flex items-center cursor-pointer">
                  <Wallet className="mr-2" size={20} />
                  Pay with eSewa
                </label>
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
              <p>{formData.city}</p>
              <p>{formData.phone}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-md mb-4">
              <h3 className="font-semibold mb-2">Payment Method</h3>
              <p>
                {paymentMethod === "COD" ? "Cash on Delivery" : "Pay with eSewa"}
              </p>
            </div>
            <div className="bg-gray-100 p-4 rounded-md mb-4">
              <h3 className="font-semibold mb-2">Order Summary</h3>
              {cartItems.map((item) => (
                <div key={item._id} className="flex justify-between mb-2">
                  <span>
                    {item.product?.title} (x{item.count})
                  </span>
                  <span>Rs {(item.price * item.count).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span>Rs {cartTotal.toLocaleString()}</span>
              </div>
              {couponCode && totalAfterDiscount && (
                <div className="flex justify-between mb-2">
                  <span>Coupon ({couponCode}):</span>
                  <span className="text-green-600">
                    -Rs {(cartTotal - totalAfterDiscount).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-semibold mt-2">
                <span>Total:</span>
                <span>
                  Rs {(totalAfterDiscount || cartTotal).toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 pt-28 md:pt-32 lg:pt-36">
      <h1 className="text-3xl font-bold mb-6 text-blue-900">Checkout</h1>
      <CheckoutProgress currentStep={step} />
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      <motion.form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto"
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
            className="bg-blue-900 text-white px-6 py-3 rounded-md flex items-center hover:bg-blue-800 transition-colors ml-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!localStorage.getItem("token")}
          >
            {step < 2
              ? "Continue"
              : paymentMethod === "COD"
              ? "Place Order"
              : "Proceed to eSewa"}
            <Lock className="ml-2" size={20} />
          </motion.button>
        </div>
      </motion.form>
    </div>
  );
};

export default Checkout;