import React, { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, ShoppingBag, Plus, Minus } from "lucide-react";
import { Link } from "react-router-dom";

const cartItems = [
  {
    id: 1,
    name: "Macbook Pro",
    price: 799.99,
    quantity: 2,
    image: "https://source.unsplash.com/random/100x100/?mobile", 
  },
  {
    id: 2,
    name: "Samgung Galaxy A7",
    price: 1299.99,
    quantity: 1,
    image: "https://source.unsplash.com/random/100x100/?laptop", 
  },
  {
    id: 3,
    name: "I Phone Bolt Charger",
    price: 599.99,
    quantity: 1,
    image: "https://source.unsplash.com/random/100x100/?smartphone", 
  },
];

const Cart = () => {
  const [items, setItems] = useState(cartItems);

  const updateQuantity = (id, change) => {
    setItems(
      items
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity + change) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      {items.length === 0 ? (
        <div className="text-center py-8">
          <ShoppingBag size={64} className="mx-auto mb-4 text-gray-400" />
          <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
          <Link
            to="/products"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          {items.map((item) => (
            <motion.div
              key={item.id}
              className="flex items-center justify-between border-b py-4 last:border-b-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-md mr-4"
                />
                <div>
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  <p className="text-gray-600">Rs {item.price.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => updateQuantity(item.id, -1)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Minus size={20} />
                </button>
                <span className="mx-2 w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, 1)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Plus size={20} />
                </button>
                <button
                  onClick={() => removeItem(item.id)}
                  className="ml-4 text-red-500 hover:text-red-700"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </motion.div>
          ))}
          <div className="mt-6 flex justify-between items-center">
            <p className="text-xl font-semibold">Total: Rs {total.toFixed(2)}</p>
            <Link
              to="/checkout"
              className="bg-blue-600 text-white px-6 py-3 rounded-md flex items-center hover:bg-blue-700 transition-colors"
            >
              <ShoppingBag className="mr-2" size={20} />
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
