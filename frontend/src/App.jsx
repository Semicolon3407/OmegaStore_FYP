import React, { useState, useEffect } from "react";
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
import AdminChat from "./pages/admin/AdminChat";
import AdminHeroBanners from "./pages/admin/AdminHeroBanners";
import AdminCoupons from "./pages/admin/AdminCoupon";
import AdminBrandsPage from "./pages/AdminBrands";
import UserChat from "./pages/UserChat";
import Locations from "./pages/Locations";
import SignIn from "./pages/SignIn";
import Contact from "./pages/Contact";
import CreateAccount from "./pages/CreateAccount";
import Warranty from "./pages/Warranty";
import UserProfile from "./pages/UserProfile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import OrderHistory from "./pages/OrderHistory";
import Coupons from "./pages/UserCoupon";
import { CartProvider } from "./Context/cartContext";
import { CouponProvider } from "./Context/couponContext";
import { WishlistProvider } from "./Context/wishlistContext";
import { CompareProvider } from "./Context/compareContext";
import { ChatProvider } from "./Context/chatContext";
import { ReviewProvider } from "./Context/ReviewContext";
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
    return (
      <div className="bg-gray-100 min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-blue-900"></div>
          <p className="mt-3 sm:mt-4 text-gray-600 text-base sm:text-lg">Loading...</p>
        </div>
      </div>
    );
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
        <div className="bg-gray-100 min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 flex items-center justify-center">
          <div className="text-center max-w-md p-6 sm:p-8 bg-white rounded-lg shadow-md hover:shadow-xl border border-gray-200">
            <h1 className="text-xl sm:text-2xl font-bold text-blue-900 mb-3 sm:mb-4 tracking-tight">Something went wrong</h1>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Please try refreshing the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-900 text-white px-5 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-blue-500 transition-all duration-300 shadow-md inline-block text-sm sm:text-base"
            >
              Refresh
            </button>
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
    <div className="flex flex-col min-h-screen bg-gray-100">
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
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<ProductListing />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/locations" element={<Locations />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/warranty" element={<Warranty />} />
              <Route path="/coupons" element={<Coupons />} />
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/account/create" element={<CreateAccount />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected Routes (User) */}
              <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/order-confirmation" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
              <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
              <Route path="/compare" element={<ProtectedRoute><Compare /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><UserChat /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
              <Route path="/order-history" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />

              {/* Protected Routes (Admin) */}
              <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/products" element={<ProtectedRoute requireAdmin={true}><AdminProducts /></ProtectedRoute>} />
              <Route path="/admin/orders" element={<ProtectedRoute requireAdmin={true}><AdminOrders /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute requireAdmin={true}><AdminUserManagement /></ProtectedRoute>} />
              <Route path="/admin/chat" element={<ProtectedRoute requireAdmin={true}><AdminChat /></ProtectedRoute>} />
              <Route path="/admin/hero-banners" element={<ProtectedRoute requireAdmin={true}><AdminHeroBanners /></ProtectedRoute>} />
              <Route path="/admin/coupons" element={<ProtectedRoute requireAdmin={true}><AdminCoupons /></ProtectedRoute>} />
              <Route path="/admin/brands" element={<ProtectedRoute requireAdmin={true}><AdminBrandsPage /></ProtectedRoute>} />

              {/* Fallback Route */}
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
      <CouponProvider>
        <CartProvider>
          <WishlistProvider>
            <CompareProvider>
              <ChatProvider>
                <ReviewProvider>
                  <ToastContainer position="bottom-right" autoClose={3000} />
                  <Layout />
                </ReviewProvider>
              </ChatProvider>
            </CompareProvider>
          </WishlistProvider>
        </CartProvider>
      </CouponProvider>
    </Router>
  );
}

export default App;