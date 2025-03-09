import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

const initialWishlist = [
  {
    id: 1,
    name: "Elegant Sofa",
    price: 599.99,
    image: "/placeholder.svg?height=300&width=300&text=Elegant+Sofa",
  },
  {
    id: 2,
    name: "Modern Coffee Table",
    price: 199.99,
    image: "/placeholder.svg?height=300&width=300&text=Modern+Coffee+Table",
  },
  {
    id: 3,
    name: "Artistic Wall Clock",
    price: 79.99,
    image: "/placeholder.svg?height=300&width=300&text=Artistic+Wall+Clock",
  },
];

const Wishlist = () => {
  const [wishlist, setWishlist] = useState(initialWishlist);

  const removeFromWishlist = (id) => {
    setWishlist(wishlist.filter((item) => item.id !== id));
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
          Your Wishlist
        </h1>
        {wishlist.length === 0 ? (
          <div className="text-center py-16">
            <Heart size={64} className="mx-auto mb-4 text-gray-400" />
            <p className="text-xl text-gray-600 mb-8">Your wishlist is empty</p>
            <Link
              to="/products"
              className="bg-primary-600 text-white px-6 py-3 rounded-full hover:bg-primary-700 transition-colors inline-block"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {wishlist.map((item) => (
              <motion.div
                key={item.id}
                className="bg-white rounded-2xl shadow-md overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2 text-gray-800">
                    {item.name}
                  </h2>
                 
                  <p className="text-gray-600 mb-4">Rs {item.price.toFixed(2)}</p>
                  <div className="flex justify-between items-center">
                    <button className="bg-primary-600 text-white px-4 py-2 rounded-full hover:bg-primary-700 transition-colors flex items-center">
                      <ShoppingCart size={20} className="mr-2" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
