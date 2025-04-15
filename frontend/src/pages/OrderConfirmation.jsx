import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = new URLSearchParams(useLocation().search);
  const orderId = location.get("orderId");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get("http://localhost:5001/api/user/get-orders", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const foundOrder = response.data.find((o) => o._id === orderId);
        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          setError("Order not found");
        }
      } catch (err) {
        setError("Failed to fetch order details");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    } else {
      setError("No order ID provided");
      setLoading(false);
    }
  }, [orderId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Order Confirmation</h2>
      <p className="text-green-500 mb-4">Thank you for your order!</p>
      <div className="border p-4 rounded">
        <h3 className="text-lg font-semibold">Order ID: {order._id}</h3>
        <p>Status: {order.orderStatus}</p>
        <p>Total: NPR {order.totalAfterDiscount}</p>
        <p>Payment Method: {order.paymentIntent.method}</p>
        <h4 className="mt-4 font-semibold">Shipping Information:</h4>
        <p>Name: {order.shippingInfo.name}</p>
        <p>Email: {order.shippingInfo.email}</p>
        <p>Address: {order.shippingInfo.address}, {order.shippingInfo.city}</p>
        <p>Phone: {order.shippingInfo.phone}</p>
        <h4 className="mt-4 font-semibold">Items:</h4>
        {order.products.map((item) => (
          <div key={item._id} className="flex justify-between">
            <span>{item.product.title} x {item.count}</span>
            <span>NPR {item.price * item.count}</span>
          </div>
        ))}
      </div>
      <button
        onClick={() => navigate("/")}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Continue Shopping
      </button>
    </div>
  );
};

export default OrderConfirmation;