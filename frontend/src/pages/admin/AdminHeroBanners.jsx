import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import Navbar from "../../components/AdminNav";

const AdminHeroBanners = () => {
  const [banners, setBanners] = useState([]);
  const [formData, setFormData] = useState({
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
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = "http://localhost:5001/api/hero-banners";

  const fetchBanners = async () => {
    try {
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setBanners(response.data);
    } catch (error) {
      toast.error("Failed to fetch banners: " + (error.response?.data?.message || error.message));
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

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
      toast.error("Failed to save banner: " + (error.response?.data?.message || error.message));
      console.error("Error details:", error.response?.data);
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

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      try {
        await axios.delete(`${API_URL}/delete/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        toast.success("Banner deleted successfully!");
        fetchBanners();
      } catch (error) {
        toast.error("Failed to delete banner: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await axios.put(`${API_URL}/toggle/${id}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Banner status updated!");
      fetchBanners();
    } catch (error) {
      toast.error("Failed to toggle status: " + (error.response?.data?.message || error.message));
    }
  };

  const resetForm = () => {
    setEditId(null);
    setFormData({
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
    });
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 tracking-tight">
          Manage Hero Banners ({banners.length} Active)
        </h1>

        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8 mb-12 border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100 transition-all duration-300"
                required
                placeholder="e.g., The Future"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Highlighted Title</label>
              <input
                type="text"
                name="highlightedTitle"
                value={formData.highlightedTitle}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100 transition-all duration-300"
                required
                placeholder="e.g., Reimagined"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100 transition-all duration-300"
                required
                placeholder="e.g., Discover the iPhone 16 Pro..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Highlighted Description (Optional)</label>
              <input
                type="text"
                name="highlightedDescription"
                value={formData.highlightedDescription}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100 transition-all duration-300"
                placeholder="e.g., iPhone 16 Pro"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
              <select
                name="backgroundColor"
                value={formData.backgroundColor}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100 transition-all duration-300"
              >
                <option value="bg-gradient-to-br from-gray-900 via-black to-gray-950">Dark Gradient (Default)</option>
                <option value="bg-gradient-to-br from-blue-900 via-blue-700 to-blue-950">Blue Gradient</option>
                <option value="bg-gradient-to-br from-purple-900 via-purple-700 to-purple-950">Purple Gradient</option>
                <option value="bg-gradient-to-br from-green-900 via-green-700 to-green-950">Green Gradient</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Offer Title</label>
              <input
                type="text"
                name="offerTitle"
                value={formData.offerTitle}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100 transition-all duration-300"
                placeholder="e.g., SHIELD+ Protection"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Offer Worth</label>
              <input
                type="text"
                name="offerWorth"
                value={formData.offerWorth}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100 transition-all duration-300"
                placeholder="e.g., Worth NPR 13,000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Offer Items (Exactly 3)</label>
              {formData.offerItems.map((item, index) => (
                <div key={index} className="flex space-x-4 mb-2">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleOfferItemChange(index, "title", e.target.value)}
                    className="w-1/2 p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100 transition-all duration-300"
                    placeholder={`Item ${index + 1} Title`}
                    required
                  />
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleOfferItemChange(index, "description", e.target.value)}
                    className="w-1/2 p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100 transition-all duration-300"
                    placeholder={`Item ${index + 1} Description`}
                    required
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
              <input
                type="file"
                name="image"
                onChange={handleFileChange}
                className="w-full p-3 border rounded-lg bg-gray-100"
                accept="image/*"
                required={!editId}
              />
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-8 rounded-full hover:shadow-xl transition-all duration-300 shadow-md disabled:opacity-50"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                {loading ? "Saving..." : editId ? "Update Banner" : "Add Banner"}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 text-gray-700 py-3 px-8 rounded-full hover:bg-gray-400 transition-all duration-300"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {banners.map((banner) => (
            <motion.div
              key={banner._id}
              className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src={`http://localhost:5001${banner.image}`}
                alt={banner.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-lg font-semibold text-gray-900">
                {banner.title}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  {banner.highlightedTitle}
                </span>
              </h3>
              <p className="text-gray-600">
                {banner.highlightedDescription ? (
                  <>
                    {banner.description.split(banner.highlightedDescription)[0]}
                    <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                      {banner.highlightedDescription}
                    </span>
                    {banner.description.split(banner.highlightedDescription)[1]}
                  </>
                ) : (
                  banner.description
                )}
              </p>
              <div className="mt-2">
                <p className="text-sm text-gray-700">Background: {banner.backgroundColor}</p>
                <p className="text-sm text-gray-700">
                  Offer: {banner.offerTitle} - {banner.offerWorth}
                </p>
                <ul className="text-sm text-gray-600 list-disc list-inside">
                  {banner.offerItems.map((item, index) => (
                    <li key={index}>
                      {item.title}: {item.description}
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-gray-700">Status: {banner.isActive ? "Active" : "Inactive"}</p>
              </div>
              <div className="mt-4 flex space-x-4">
                <button
                  onClick={() => handleEdit(banner)}
                  className="text-blue-600 hover:text-blue-800 transition-colors duration-300"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={() => handleDelete(banner._id)}
                  className="text-red-600 hover:text-red-800 transition-colors duration-300"
                >
                  <Trash2 size={20} />
                </button>
                <button
                  onClick={() => handleToggleStatus(banner._id)}
                  className={
                    banner.isActive
                      ? "text-green-600 hover:text-green-800 transition-colors duration-300"
                      : "text-gray-600 hover:text-gray-800 transition-colors duration-300"
                  }
                >
                  {banner.isActive ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminHeroBanners;