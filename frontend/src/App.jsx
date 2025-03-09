import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import ProductListing from "./pages/ProductListing";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Wishlist from "./pages/Wishlist";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUserManagement from "./pages/admin/AdminUserManagement";
import Locations from "./pages/Locations";
import SaleProducts from "./pages/SaleProducts";
import SignIn from "./pages/SignIn";
import Contact from "./pages/Contact";
import CreateAccount from "./pages/CreateAccount";
import Warranty from "./pages/Warranty";
import UserProfile from "./pages/UserProfile";
import AdminRevenue from "./pages/admin/AdminRevenue";
import AdminAnalytics from "./pages/admin/AdminAnalytics";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <AnimatePresence mode="wait">
          <motion.main
            className="flex-grow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<ProductListing />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route
                path="/order-confirmation"
                element={<OrderConfirmation />}
              />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/revenue" element={<AdminRevenue />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/users" element={<AdminUserManagement />} />
              <Route path="/locations" element={<Locations />} />
              <Route path="/sale" element={<SaleProducts />} />
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/account/create" element={<CreateAccount />} />
              <Route path="/warranty" element={<Warranty />} />
              <Route path="/profile" element={<UserProfile />} />
            </Routes>
          </motion.main>
        </AnimatePresence>
        <Footer />
      </div>
    </Router>
  );
}

export default App;