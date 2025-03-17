import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { title: "Dashboard", path: "/admin" },
    { title: "Products", path: "/admin/products" },
    { title: "Orders", path: "/admin/orders" },
    { title: "Users", path: "/admin/users" },
    { title: "Analytics", path: "/admin/analytics" },
    { title: "Revenue", path: "/admin/revenue" },
  ];

  const handleLogout = () => {
    // Clear token or any authentication data
    localStorage.removeItem("token");
    navigate("/"); // Redirect to login page
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Omega Store</h1>
        <ul className="flex space-x-6">
          {navLinks.map((link, index) => (
            <li key={index}>
              <Link
                to={link.path}
                className={`hover:text-yellow-400 ${
                  location.pathname === link.path ? "text-yellow-400" : ""
                }`}
              >
                {link.title}
              </Link>
            </li>
          ))}
        </ul>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;