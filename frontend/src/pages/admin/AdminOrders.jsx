import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, Edit2, Trash2 } from "lucide-react";
import Navbar from "../../components/AdminNav"; // Import the Navbar component

const initialOrders = [
  { id: 1, customer: "John Doe", total: 299.99, status: "Pending", date: "2023-06-01" },
  { id: 2, customer: "Jane Smith", total: 149.99, status: "Shipped", date: "2023-05-30" },
  { id: 3, customer: "Bob Johnson", total: 89.99, status: "Delivered", date: "2023-05-28" },
];

const initialOrderState = { customer: "", total: "", status: "Pending", date: "" };

const AdminOrders = () => {
  const [orders, setOrders] = useState(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newOrder, setNewOrder] = useState(initialOrderState);
  const [editOrder, setEditOrder] = useState(initialOrderState); // Separate state for editing
  const [isEditing, setIsEditing] = useState(false);

  const handleAddOrder = (e) => {
    e.preventDefault();
    const newId = orders.length ? Math.max(...orders.map((o) => o.id)) + 1 : 1;
    const newOrderData = { ...newOrder, id: newId, date: new Date().toLocaleDateString() };
    setOrders([...orders, newOrderData]);
    setNewOrder(initialOrderState); // Reset add form
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setEditOrder(order); // Set the selected order for editing
    setIsEditing(true);
  };

  const handleUpdateOrder = () => {
    setOrders(orders.map((order) => (order.id === editOrder.id ? editOrder : order)));
    setIsEditing(false);
    setEditOrder(initialOrderState); // Reset edit form
  };

  const handleDeleteOrder = (id) => {
    setOrders(orders.filter((order) => order.id !== id));
    setSelectedOrder(null);
  };

  return (
    <div>
      <Navbar /> {/* Add the Navbar component */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Manage Orders</h1>

        {/* Add Order Form */}
        <form onSubmit={handleAddOrder} className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Order</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              name="customer"
              value={newOrder.customer}
              onChange={(e) => setNewOrder({ ...newOrder, customer: e.target.value })}
              placeholder="Customer Name"
              className="border p-2 rounded"
              required
            />
            <input
              type="number"
              name="total"
              value={newOrder.total}
              onChange={(e) => setNewOrder({ ...newOrder, total: e.target.value })}
              placeholder="Total Amount"
              className="border p-2 rounded"
              required
            />
            <select
              name="status"
              value={newOrder.status}
              onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value })}
              className="border p-2 rounded"
              required
            >
              <option value="Pending">Pending</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
          <button
            type="submit"
            className="mt-4 bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
          >
            Add Order
          </button>
        </form>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 text-left">Order ID</th>
                <th className="px-6 py-3 text-left">Customer</th>
                <th className="px-6 py-3 text-left">Total</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <motion.tr key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <td className="px-6 py-4">{order.id}</td>
                  <td className="px-6 py-4">{order.customer}</td>
                  <td className="px-6 py-4">Rs{order.total.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        order.status === "Pending"
                          ? "bg-yellow-200 text-yellow-800"
                          : order.status === "Shipped"
                          ? "bg-blue-200 text-blue-800"
                          : "bg-green-200 text-green-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{order.date}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEditOrder(order)}
                      className="text-yellow-600 hover:text-yellow-800 mr-2"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit Order Modal */}
        {isEditing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Edit Order</h2>
              <div className="grid grid-cols-1 gap-4">
                <input
                  type="text"
                  value={editOrder.customer}
                  onChange={(e) => setEditOrder({ ...editOrder, customer: e.target.value })}
                  placeholder="Customer Name"
                  className="border p-2 rounded"
                  required
                />
                <input
                  type="number"
                  value={editOrder.total}
                  onChange={(e) => setEditOrder({ ...editOrder, total: e.target.value })}
                  placeholder="Total Amount"
                  className="border p-2 rounded"
                  required
                />
                <select
                  value={editOrder.status}
                  onChange={(e) => setEditOrder({ ...editOrder, status: e.target.value })}
                  className="border p-2 rounded"
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleUpdateOrder}
                  className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
                >
                  Update Order
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;