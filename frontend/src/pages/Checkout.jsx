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
  const [processingPayment, setProcessingPayment] = useState(false);

  const couponCode = location.state?.couponCode || null;

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const errorMsg = query.get("error");
    const success = query.get("success");
    const orderId = query.get("orderId");
    
    // Handle error from URL param
    if (errorMsg) {
      toast.error(errorMsg);
      setError(errorMsg);
    }
    
    // Check if payment was successful
    if (success === "true" && orderId) {
      handlePaymentSuccess(orderId);
    }
  }, [location.search]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  // Handle successful payment return
  const handlePaymentSuccess = async (orderId) => {
    try {
      if (!orderId) {
        throw new Error("No order ID provided");
      }
      
      // Empty the cart after successful payment
      await emptyCart();
      
      // Show success message
      toast.success("Payment successful! Your order has been placed.");
      
      // Navigate to order confirmation page with the order ID
      navigate(`/order?orderId=${orderId}`);
    } catch (error) {
      console.error("Error processing payment success:", error);
      toast.error("There was an issue with your payment. Please contact support.");
      navigate("/");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 2) {
      setStep(step + 1);
    } else {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Please log in to place an order");
        }

        // Validate required fields
        const requiredFields = ['name', 'email', 'address', 'city', 'phone'];
        const missingFields = requiredFields.filter(field => !formData[field]);
        if (missingFields.length > 0) {
          throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
        }

        if (paymentMethod === "COD") {
          setProcessingPayment(true);
          const response = await axios.post(
            "http://localhost:5001/api/user/cart/cash-order",
            {
              COD: true,
              couponApplied: !!couponCode,
              couponCode,
              shippingInfo: formData,
              paymentMethod: "cash on delivery"
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (response.data && response.data.order && response.data.order._id) {
            await emptyCart();
            toast.success("Order placed successfully!");
            navigate(`/order?orderId=${response.data.order._id}`);
          } else {
            throw new Error("Invalid order response from server");
          }
        } else if (paymentMethod === "eSewa") {
          await handleEsewaPayment();
        }
      } catch (error) {
        console.error("Error creating order:", error);
        const errorMessage = error.response?.data?.message || error.message || "Failed to place order";
        toast.error(errorMessage);
      } finally {
        setProcessingPayment(false);
      }
    }
  };

  const handleEsewaPayment = async () => {
    try {
      setProcessingPayment(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to place an order");
      }

      // Validate required fields
      const requiredFields = ['name', 'email', 'address', 'city', 'phone'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }

      // Initialize eSewa payment
      const response = await axios.post(
        "http://localhost:5001/api/monster/esewa/initiate-payment",
        {
          couponApplied: !!couponCode,
          couponCode,
          shippingInfo: formData,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { paymentUrl, formData: esewaFormData } = response.data;

      // Create a form for eSewa submission
      const form = document.createElement("form");
      form.method = "POST";
      form.action = paymentUrl;
      form.target = "_blank";
      form.style.display = 'none';

      // Add all required eSewa fields
      Object.entries(esewaFormData).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      // Append form to main document and submit
      document.body.appendChild(form);
      form.submit();
      
      // Remove the form after submission
      setTimeout(() => {
        document.body.removeChild(form);
      }, 1000);

      // Show processing message
      toast.info("Processing payment in eSewa window. Please complete the payment there.", {
        autoClose: false,
        position: "bottom-right"
      });
    } catch (error) {
      console.error("Error initiating eSewa payment:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to initiate payment";
      toast.error(errorMessage);
    } finally {
      setProcessingPayment(false);
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
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  minLength="3"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-900"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  required
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-900"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-gray-700 mb-2">
                  Delivery Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your complete delivery address"
                  required
                  minLength="5"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-900"
                />
              </div>
              <div>
                <label htmlFor="city" className="block text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter your city"
                  required
                  minLength="2"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-900"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  required
                  pattern="[0-9]{10}"
                  title="Please enter a valid 10-digit phone number"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-900"
                />
                <p className="text-xs text-gray-500 mt-1">Format: 10-digit number without spaces or dashes</p>
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
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span>Rs {cartTotal.toLocaleString()}</span>
              </div>
              {couponCode && totalAfterDiscount !== null && totalAfterDiscount < cartTotal && (
                <div className="flex justify-between mb-2 text-green-600">
                  <span>Coupon Discount ({couponCode}):</span>
                  <span>- Rs {(cartTotal - totalAfterDiscount).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between mb-2">
                <span>Delivery Charge:</span>
                <span>Rs 150</span>
              </div>
              <div className="flex justify-between font-semibold mt-2 text-lg border-t pt-2">
                <span>Total:</span>
                <span>
                  Rs {((totalAfterDiscount || cartTotal) + 150).toLocaleString()}
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
              disabled={processingPayment}
            >
              Back
            </button>
          )}
          <motion.button
            type="submit"
            className="bg-blue-900 text-white px-6 py-3 rounded-md flex items-center hover:bg-blue-800 transition-colors ml-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!localStorage.getItem("token") || processingPayment}
          >
            {processingPayment ? (
              "Processing..."
            ) : (
              <>
                {step < 2
                  ? "Continue"
                  : paymentMethod === "COD"
                  ? "Place Order"
                  : "Proceed to eSewa"}
                <Lock className="ml-2" size={20} />
              </>
            )}
          </motion.button>
        </div>
      </motion.form>
    </div>
  );
};

export default Checkout;