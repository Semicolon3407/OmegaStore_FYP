import React, { useState } from "react";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

const initialWishlist = [
  {
    id: 1,
    name: "Smartphone X",
    price: 799.99,
    image: "/assets/images/iphone16pro.png",
    category: "Mobile",
    description: "Smartphone X features a sleek design with a powerful processor.\nPerfect for gaming, photography, and multitasking.",
    color: "Midnight Black",
    brand: "TechCorp"
  },
  {
    id: 2,
    name: "Wireless Earbuds",
    price: 129.99,
    image: "/assets/images/iphone16pro.png",
    category: "Earbuds & Headphones",
    description: "Experience high-quality sound with these wireless earbuds.\nPerfect for music, calls, and a truly wireless experience.",
    color: "White",
    brand: "SoundMax"
  },
  {
    id: 3,
    name: "Laptop Pro",
    price: 1299.99,
    image: "/assets/images/placeholder.png",
    category: "Laptop",
    description: "Laptop Pro is designed for professionals needing both performance and portability.\nEnjoy ultra-fast speeds and a stunning display.",
    color: "Space Gray",
    brand: "ProTech"
  },
  {
    id: 4,
    name: "Smart Watch",
    price: 249.99,
    image: "/assets/images/placeholder.png",
    category: "Accessories",
    description: "Stay connected and track your health with the Smart Watch.\nWith fitness tracking and notifications, it's your perfect companion.",
    color: "Silver",
    brand: "FitTrack"
  },
  {
    id: 5,
    name: "Bluetooth Speaker",
    price: 79.99,
    image: "/assets/images/placeholder.png",
    category: "Earbuds & Headphones",
    description: "Portable Bluetooth speaker for all your music needs.\nEnjoy crystal clear sound wherever you go with great battery life.",
    color: "Black",
    brand: "BassBox"
  },
  {
    id: 6,
    name: "Phone Case",
    price: 19.99,
    image: "/assets/images/placeholder.png",
    category: "Accessories",
    description: "Protect your phone with this durable and stylish phone case.\nAvailable in various colors and designs to match your style.",
    color: "Red",
    brand: "CaseGuard"
  },
  {
    id: 7,
    name: "Gaming Console",
    price: 499.99,
    image: "/assets/images/placeholder.png",
    category: "Accessories",
    description: "Take your gaming to the next level with this high-performance gaming console.\nSupports 4K gaming and a wide range of games.",
    color: "Black",
    brand: "GameBox"
  },
  {
    id: 8,
    name: "Wireless Mouse",
    price: 39.99,
    image: "/assets/images/placeholder.png",
    category: "Accessories",
    description: "Ergonomically designed wireless mouse for comfort and precision.\nPerfect for work or gaming with wireless freedom.",
    color: "Blue",
    brand: "PrecisionPro"
  },
  {
    id: 9,
    name: "External SSD",
    price: 89.99,
    image: "/assets/images/placeholder.png",
    category: "Accessories",
    description: "Super-fast external SSD for all your storage needs.\nPerfect for transferring large files quickly and securely.",
    color: "Gray",
    brand: "SpeedDrive"
  },
  {
    id: 10,
    name: "Mechanical Keyboard",
    price: 129.99,
    image: "/assets/images/placeholder.png",
    category: "Accessories",
    description: "Responsive mechanical keyboard for a better typing experience.\nPerfect for gaming and professional use with customizable keys.",
    color: "Black",
    brand: "KeyTech"
  },
];

const Wishlist = () => {
  const [wishlist, setWishlist] = useState(initialWishlist);

  const removeFromWishlist = (id) => {
    setWishlist((prevWishlist) => prevWishlist.filter((item) => item.id !== id));
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
              className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors inline-block"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-md overflow-hidden"
              >
                <img
                  src={item.image}
                  alt={`${item.name} - ${item.color}`}
                  className="w-full h-64 object-cover"
                  onError={(e) => {e.target.src = "/assets/images/placeholder.png"}}
                />
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2 text-gray-800">
                    {item.name}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Rs {item.price.toLocaleString()}
                  </p>
                  <div className="flex justify-between items-center">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors flex items-center">
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;