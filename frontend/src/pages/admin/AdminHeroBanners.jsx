import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Image as ImageIcon,
  X,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import AdminSidebar from "../../components/AdminNav";

const initialFormData = {
  title: "",
  highlightedTitle: "",
  description: "",
  highlightedDescription: "",
  backgroundColor: "bg-gradient-to-br from-gray-900 via-black to-gray-950",
  offerTitle: "SHIELD+ Protection",
  offerWorth: "Worth NPR 13,000",
  offerItems: [
    { title: "Extended Warranty", description: "1 Year" },
    { title: "Front Screen", description: "1 Replacement" },
    { title: "Back Glass", description: "1 Replacement" },
  ],
  image: null,
};

const AdminHeroBanners = () => {
  const [banners, setBanners] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState(null);
  const [bannerToToggle, setBannerToToggle] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const API_URL = "http://localhost:5001/api/hero-banners";

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setBanners(response.data);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to fetch banners.";
      setError(errorMsg);
      if (error.response?.status === 401) {
        toast.info("Session expired, please login");
        navigate("/sign-in");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      toast.info("Access denied. Admins only.");
      navigate("/sign-in");
    } else {
      fetchBanners();
    }
  }, [navigate, location.pathname]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleOfferItemChange = (index, field, value) => {
    const newOfferItems = [...formData.offerItems];
    newOfferItems[index][field] = value;
    setFormData({ ...formData, offerItems: newOfferItems });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.title ||
      !formData.highlightedTitle ||
      !formData.description ||
      (!formData.image && !editId)
    ) {
      toast.error("Please fill all required fields and select an image.");
      return;
    }

    setLoading(true);
    const data = new FormData();
    for (const key in formData) {
      if (key === "offerItems") {
        data.append(key, JSON.stringify(formData[key]));
      } else if (formData[key]) {
        data.append(key, formData[key]);
      }
    }

    try {
      if (editId) {
        await axios.put(`${API_URL}/update/${editId}`, data, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Banner updated successfully!");
      } else {
        await axios.post(`${API_URL}/create`, data, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Banner created successfully!");
      }
      fetchBanners();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save banner.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (banner) => {
    setEditId(banner._id);
    setFormData({
      title: banner.title,
      highlightedTitle: banner.highlightedTitle,
      description: banner.description,
      highlightedDescription: banner.highlightedDescription || "",
      backgroundColor: banner.backgroundColor,
      offerTitle: banner.offerTitle,
      offerWorth: banner.offerWorth,
      offerItems: banner.offerItems,
      image: null,
    });
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/delete/${bannerToDelete}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Banner deleted successfully!");
      fetchBanners();
      setIsDeleteModalOpen(false);
      setBannerToDelete(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete banner.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      setLoading(true);
      await axios.put(`${API_URL}/toggle/${bannerToToggle}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Banner status updated!");
      fetchBanners();
      setIsToggleModalOpen(false);
      setBannerToToggle(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to toggle status.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditId(null);
    setFormData(initialFormData);
  };

  if (loading && !banners.length) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center p-4 md:p-6">
          <div className="text-center">
            <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
            <p className="text-gray-600 text-lg">Loading banners...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            Manage Hero Banners
          </h1>
          <p className="text-gray-600 text-base">
            Create and manage promotional banners for the homepage.
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border-l-4 border-red-500"
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200"
        >
          <div className="flex items-center gap-2 mb-4">
            <Plus size={24} className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              {editId ? "Edit Banner" : "Add New Banner"}
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1 font-medium">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:opacity-50"
                required
                placeholder="e.g., The Future"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">
                Highlighted Title
              </label>
              <input
                type="text"
                name="highlightedTitle"
                value={formData.highlightedTitle}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:opacity-50"
                required
                placeholder="e.g., Reimagined"
                disabled={loading}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-gray-700 mb-1 font-medium">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:opacity-50"
                required
                placeholder="e.g., Discover the iPhone 16 Pro..."
                disabled={loading}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-gray-700 mb-1 font-medium">
                Highlighted Description (Optional)
              </label>
              <input
                type="text"
                name="highlightedDescription"
                value={formData.highlightedDescription}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:opacity-50"
                placeholder="e.g., iPhone 16 Pro"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">
                Background Color
              </label>
              <select
                name="backgroundColor"
                value={formData.backgroundColor}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:opacity-50"
                disabled={loading}
              >
                <option value="bg-gradient-to-br from-gray-900 via-black to-gray-950">
                  Dark Gradient
                </option>
                <option value="bg-gradient-to-br from-blue-900 via-blue-700 to-blue-950">
                  Blue Gradient
                </option>
                <option value="bg-gradient-to-br from-purple-900 via-purple-700 to-purple-950">
                  Purple Gradient
                </option>
                <option value="bg-gradient-to-br from-green-900 via-green-700 to-green-950">
                  Green Gradient
                </option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">
                Offer Title
              </label>
              <input
                type="text"
                name="offerTitle"
                value={formData.offerTitle}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:opacity-50"
                placeholder="e.g., SHIELD+ Protection"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">
                Offer Worth
              </label>
              <input
                type="text"
                name="offerWorth"
                value={formData.offerWorth}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:opacity-50"
                placeholder="e.g., Worth NPR 13,000"
                disabled={loading}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-gray-700 mb-1 font-medium">
                Offer Items (Exactly 3)
              </label>
              {formData.offerItems.map((item, index) => (
                <div key={index} className="flex gap-4 mb-2">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) =>
                      handleOfferItemChange(index, "title", e.target.value)
                    }
                    className="w-1/2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:opacity-50"
                    placeholder={`Item ${index + 1} Title`}
                    required
                    disabled={loading}
                  />
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) =>
                      handleOfferItemChange(index, "description", e.target.value)
                    }
                    className="w-1/2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:opacity-50"
                    placeholder={`Item ${index + 1} Description`}
                    required
                    disabled={loading}
                  />
                </div>
              ))}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-gray-700 mb-1 font-medium">Image</label>
              <input
                type="file"
                name="image"
                onChange={handleFileChange}
                className="w-full p-2 border border-gray-300 rounded-lg disabled:opacity-50"
                accept="image/*"
                required={!editId}
                disabled={loading}
              />
            </div>
            <div className="sm:col-span-2 flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
              >
                <Plus size={20} className="mr-2" />
                {editId ? "Update Banner" : "Add Banner"}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={loading}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </motion.div>

        {/* Banner Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-lg shadow-md border border-gray-200"
        >
          <div className="p-4 bg-gray-100 flex items-center gap-2">
            <ImageIcon size={20} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Banner List</h2>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              {banners.length} {banners.length === 1 ? "banner" : "banners"}
            </span>
          </div>
          {banners.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              <AnimatePresence>
                {banners.map((banner, index) => (
                  <motion.div
                    key={banner._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow"
                  >
                    <img
                      src={`http://localhost:5001${banner.image}`}
                      alt={banner.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <h3 className="text-lg font-semibold text-gray-800">
                      {banner.title}{" "}
                      <span className="text-blue-600">
                        {banner.highlightedTitle}
                      </span>
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {banner.highlightedDescription ? (
                        <>
                          {banner.description.split(
                            banner.highlightedDescription
                          )[0]}
                          <span className="font-semibold text-blue-600">
                            {banner.highlightedDescription}
                          </span>
                          {banner.description.split(
                            banner.highlightedDescription
                          )[1]}
                        </>
                      ) : (
                        banner.description
                      )}
                    </p>
                    <div className="mt-2 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Background:</span>{" "}
                        {banner.backgroundColor
                          .split(" ")[0]
                          .replace("bg-gradient-to-br", "")
                          .replace("from-", "")}
                      </p>
                      <p>
                        <span className="font-medium">Offer:</span>{" "}
                        {banner.offerTitle} - {banner.offerWorth}
                      </p>
                      <ul className="list-disc list-inside">
                        {banner.offerItems.map((item, idx) => (
                          <li key={idx}>
                            {item.title}: {item.description}
                          </li>
                        ))}
                      </ul>
                      <p>
                        <span className="font-medium">Status:</span>{" "}
                        <span
                          className={`${
                            banner.isActive
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {banner.isActive ? "Active" : "Inactive"}
                        </span>
                      </p>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => handleEdit(banner)}
                        className="text-orange-500 hover:text-orange-600 transition-colors"
                        title="Edit Banner"
                        disabled={loading}
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => {
                          setBannerToDelete(banner._id);
                          setIsDeleteModalOpen(true);
                        }}
                        className="text-red-500 hover:text-red-600 transition-colors"
                        title="Delete Banner"
                        disabled={loading}
                      >
                        <Trash2 size={20} />
                      </button>
                      <button
                        onClick={() => {
                          setBannerToToggle(banner._id);
                          setIsToggleModalOpen(true);
                        }}
                        className={`${
                          banner.isActive
                            ? "text-green-500 hover:text-green-600"
                            : "text-gray-500 hover:text-gray-600"
                        } transition-colors`}
                        title={
                          banner.isActive ? "Hide Banner" : "Show Banner"
                        }
                        disabled={loading}
                      >
                        {banner.isActive ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 flex flex-col items-center gap-2">
              <ImageIcon size={48} className="text-blue-600" />
              <p>No banners available.</p>
              <p className="text-sm">Add a banner using the form above.</p>
            </div>
          )}
        </motion.div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {isDeleteModalOpen && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="bg-white rounded-lg shadow-md p-6 w-full max-w-sm relative"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                  title="Close"
                >
                  <X size={24} />
                </button>
                <div className="flex items-center gap-2 mb-4">
                  <Trash2 size={24} className="text-red-500" />
                  <h2 className="text-xl font-semibold text-gray-800">
                    Confirm Deletion
                  </h2>
                </div>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this banner? This action cannot
                  be undone.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    disabled={loading}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Status Confirmation Modal */}
        <AnimatePresence>
          {isToggleModalOpen && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="bg-white rounded-lg shadow-md p-6 w-full max-w-sm relative"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={() => setIsToggleModalOpen(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                  title="Close"
                >
                  <X size={24} />
                </button>
                <div className="flex items-center gap-2 mb-4">
                  {banners.find((b) => b._id === bannerToToggle)?.isActive ? (
                    <EyeOff size={24} className="text-gray-500" />
                  ) : (
                    <Eye size={24} className="text-green-500" />
                  )}
                  <h2 className="text-xl font-semibold text-gray-800">
                    Confirm Status Change
                  </h2>
                </div>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to{" "}
                  {banners.find((b) => b._id === bannerToToggle)?.isActive
                    ? "hide"
                    : "show"}{" "}
                  this banner?
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={handleToggleStatus}
                    disabled={loading}
                    className={`${
                      banners.find((b) => b._id === bannerToToggle)?.isActive
                        ? "bg-gray-500"
                        : "bg-green-500"
                    } text-white px-6 py-2 rounded-lg hover:${
                      banners.find((b) => b._id === bannerToToggle)?.isActive
                        ? "bg-gray-600"
                        : "bg-green-600"
                    } transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed`}
                  >
                    {banners.find((b) => b._id === bannerToToggle)?.isActive
                      ? "Hide"
                      : "Show"}
                  </button>
                  <button
                    onClick={() => setIsToggleModalOpen(false)}
                    disabled={loading}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminHeroBanners;