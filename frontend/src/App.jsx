import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
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
import Compare from "./pages/Compare";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUserManagement from "./pages/admin/AdminUserManagement";
import AdminRevenue from "./pages/admin/AdminRevenue";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminChat from "./pages/admin/AdminChat";
import UserChat from "./pages/UserChat";
import Locations from "./pages/Locations";
import SaleProducts from "./pages/SaleProducts";
import SignIn from "./pages/SignIn";
import Contact from "./pages/Contact";
import CreateAccount from "./pages/CreateAccount";
import Warranty from "./pages/Warranty";
import UserProfile from "./pages/UserProfile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { CartProvider } from "./Context/cartContext";
import { WishlistProvider } from "./Context/wishlistContext";
import { CompareProvider } from "./Context/compareContext";
import { ChatProvider } from "./Context/chatContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const getAuthStatus = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  return {
    isLoggedIn: !!token,
    isAdmin: !!token && role === "admin",
    role: role || "",
  };
};

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const [auth, setAuth] = useState({ isLoggedIn: null, isAdmin: null });

  useEffect(() => {
    const updateAuth = () => setAuth(getAuthStatus());
    updateAuth();
    window.addEventListener("storage", updateAuth);
    return () => window.removeEventListener("storage", updateAuth);
  }, []);

  if (auth.isLoggedIn === null || auth.isAdmin === null) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!auth.isLoggedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  if (requireAdmin && !auth.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Something went wrong</h1>
            <p className="mt-2 text-gray-600">Please try refreshing the page.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const Layout = () => {
  const location = useLocation();
  const [auth, setAuth] = useState(getAuthStatus());

  useEffect(() => {
    const updateAuth = () => setAuth(getAuthStatus());
    updateAuth();
    window.addEventListener("storage", updateAuth);
    return () => window.removeEventListener("storage", updateAuth);
  }, []);

  const hideHeaderFooterRoutes = ["/sign-in", "/account/create", "/forgot-password", "/reset-password"];
  const isAdminRoute = location.pathname.startsWith("/admin");

  const shouldShowHeaderFooter = !hideHeaderFooterRoutes.includes(location.pathname) && !isAdminRoute;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {shouldShowHeaderFooter && <Header />}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          className="flex-grow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<ProductListing />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route
                path="/order-confirmation"
                element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>}
              />
              <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
              <Route path="/compare" element={<ProtectedRoute><Compare /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><UserChat /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
              <Route
                path="/admin"
                element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>}
              />
              <Route
                path="/admin/products"
                element={<ProtectedRoute requireAdmin><AdminProducts /></ProtectedRoute>}
              />
              <Route
                path="/admin/orders"
                element={<ProtectedRoute requireAdmin><AdminOrders /></ProtectedRoute>}
              />
              <Route
                path="/admin/revenue"
                element={<ProtectedRoute requireAdmin><AdminRevenue /></ProtectedRoute>}
              />
              <Route
                path="/admin/analytics"
                element={<ProtectedRoute requireAdmin><AdminAnalytics /></ProtectedRoute>}
              />
              <Route
                path="/admin/users"
                element={<ProtectedRoute requireAdmin><AdminUserManagement /></ProtectedRoute>}
              />
              <Route
                path="/admin/chat"
                element={<ProtectedRoute requireAdmin><AdminChat /></ProtectedRoute>}
              />
              <Route path="/locations" element={<Locations />} />
              <Route path="/sale" element={<SaleProducts />} />
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/account/create" element={<CreateAccount />} />
              <Route path="/warranty" element={<Warranty />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ErrorBoundary>
        </motion.main>
      </AnimatePresence>
      {shouldShowHeaderFooter && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <CartProvider>
        <WishlistProvider>
          <CompareProvider>
            <ChatProvider>
              <ToastContainer position="bottom-right" autoClose={3000} />
              <Layout />
            </ChatProvider>
          </CompareProvider>
        </WishlistProvider>
      </CartProvider>
    </Router>
  );
}

export default App;