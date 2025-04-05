import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Save, X, Search, Image as ImageIcon } from "lucide-react";
import axios from "axios";
import Navbar from "../../components/AdminNav";

const initialSaleProductState = {
  title: "",
  price: "",
  salePrice: "",
  quantity: "",
  category: "",
  brand: "",
  color: "",
  description: "",
  images: [],
};

const AdminSaleProducts = () => {
  const [saleProducts, setSaleProducts] = useState([]);
  const [newSaleProduct, setNewSaleProduct] = useState(initialSaleProductState);
  const [selectedSaleProduct, setSelectedSaleProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const API_URL = "http://localhost:5001/api/sale-products";

  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  useEffect(() => {
    fetchSaleProducts();
  }, []);

  const fetchSaleProducts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(API_URL, getAuthConfig());
      setSaleProducts(response.data.saleProducts || []);
      setError("");
    } catch (err) {
      console.error("Fetch sale products error:", err);
      setError("Failed to fetch sale products: " + (err.response?.data?.message || "Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "your_upload_preset"); // Replace with your Cloudinary preset

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/de9o7sdbs/image/upload",
        formData
      );
      const imageUrl = res.data.secure_url;
      setNewSaleProduct((prev) => ({
        ...prev,
        images: [...prev.images, imageUrl],
      }));
    } catch (error) {
      console.error("Image upload error:", error);
      setError("Error uploading image: " + (error.response?.data?.message || "Please try again."));
    }
  };

  const handleAddSaleProduct = async (e) => {
    e.preventDefault();
    if (!newSaleProduct.title || !newSaleProduct.price || !newSaleProduct.salePrice || !newSaleProduct.quantity || !newSaleProduct.category) {
      setError("Title, price, sale price, quantity, and category are required!");
      return;
    }

    try {
      setIsLoading(true);
      await axios.post(API_URL, newSaleProduct, getAuthConfig());
      setNewSaleProduct(initialSaleProductState);
      setSuccess("Sale product added successfully!");
      setError("");
      await fetchSaleProducts();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Add sale product error:", err);
      setError("Failed to add sale product: " + (err.response?.data?.message || "Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSaleProduct = (saleProduct) => {
    const editSaleProduct = {
      id: saleProduct._id,
      title: saleProduct.title || "",
      price: saleProduct.price || "",
      salePrice: saleProduct.salePrice || "",
      quantity: saleProduct.quantity || "",
      category: saleProduct.category || "",
      brand: saleProduct.brand || "",
      color: saleProduct.color || "",
      description: saleProduct.description || "",
      images: saleProduct.images || [],
    };
    setSelectedSaleProduct(saleProduct);
    setNewSaleProduct(editSaleProduct);
    setIsEditing(true);
    setError("");
  };

  const handleUpdateSaleProduct = async () => {
    if (!newSaleProduct.title || !newSaleProduct.price || !newSaleProduct.salePrice || !newSaleProduct.quantity || !newSaleProduct.category) {
      setError("Title, price, sale price, quantity, and category are required!");
      return;
    }

    try {
      setIsLoading(true);
      const saleProductData = { ...newSaleProduct, _id: newSaleProduct.id };
      await axios.put(`${API_URL}/${newSaleProduct.id}`, saleProductData, getAuthConfig());
      setIsEditing(false);
      setNewSaleProduct(initialSaleProductState);
      setSuccess("Sale product updated successfully!");
      setError("");
      await fetchSaleProducts();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Update sale product error:", err);
      setError("Failed to update sale product: " + (err.response?.data?.message || "Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSaleProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this sale product?")) return;

    try {
      setIsLoading(true);
      await axios.delete(`${API_URL}/${id}`, getAuthConfig());
      setSuccess("Sale product deleted successfully!");
      setError("");
      await fetchSaleProducts();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Delete sale product error:", err);
      setError("Failed to delete sale product: " + (err.response?.data?.message || "Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSaleProducts = saleProducts.filter((saleProduct) =>
    (saleProduct.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (saleProduct.category?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (saleProduct.brand?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const EditSaleProductModal = () => {
    if (!isEditing) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Edit Sale Product</h2>
            <button
              onClick={() => {
                setIsEditing(false);
                setNewSaleProduct(initialSaleProductState);
              }}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm border-l-4 border-red-500">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Title</label>
              <input
                type="text"
                value={newSaleProduct.title}
                onChange={(e) => setNewSaleProduct({ ...newSaleProduct, title: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs)</label>
              <input
                type="number"
                value={newSaleProduct.price}
                onChange={(e) => setNewSaleProduct({ ...newSaleProduct, price: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price (Rs)</label>
              <input
                type="number"
                value={newSaleProduct.salePrice}
                onChange={(e) => setNewSaleProduct({ ...newSaleProduct, salePrice: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                value={newSaleProduct.quantity}
                onChange={(e) => setNewSaleProduct({ ...newSaleProduct, quantity: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                value={newSaleProduct.category}
                onChange={(e) => setNewSaleProduct({ ...newSaleProduct, category: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <input
                type="text"
                value={newSaleProduct.brand}
                onChange={(e) => setNewSaleProduct({ ...newSaleProduct, brand: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <input
                type="text"
                value={newSaleProduct.color}
                onChange={(e) => setNewSaleProduct({ ...newSaleProduct, color: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={newSaleProduct.description}
                onChange={(e) => setNewSaleProduct({ ...newSaleProduct, description: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
              <input
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {newSaleProduct.images.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img}
                      alt="Sale product preview"
                      className="w-16 h-16 object-cover rounded border border-gray-200"
                    />
                    <button
                      onClick={() =>
                        setNewSaleProduct({
                          ...newSaleProduct,
                          images: newSaleProduct.images.filter((_, i) => i !== index),
                        })
                      }
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setIsEditing(false);
                setNewSaleProduct(initialSaleProductState);
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateSaleProduct}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Updating...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Update Sale Product
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  if (isLoading && !saleProducts.length) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
            <ImageIcon className="mr-2 text-blue-600" size={28} />
            Sale Product Management
          </h1>
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search sale products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg shadow-sm">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg shadow-sm">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-sm">{success}</p>
            </div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white p-6 rounded-xl shadow-md mb-8"
        >
          <div className="flex items-center mb-6">
            <Plus size={20} className="mr-2 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Add New Sale Product</h2>
          </div>

          <form onSubmit={handleAddSaleProduct}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Title</label>
                <input
                  type="text"
                  value={newSaleProduct.title}
                  onChange={(e) => setNewSaleProduct({ ...newSaleProduct, title: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs)</label>
                <input
                  type="number"
                  value={newSaleProduct.price}
                  onChange={(e) => setNewSaleProduct({ ...newSaleProduct, price: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price (Rs)</label>
                <input
                  type="number"
                  value={newSaleProduct.salePrice}
                  onChange={(e) => setNewSaleProduct({ ...newSaleProduct, salePrice: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  value={newSaleProduct.quantity}
                  onChange={(e) => setNewSaleProduct({ ...newSaleProduct, quantity: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={newSaleProduct.category}
                  onChange={(e) => setNewSaleProduct({ ...newSaleProduct, category: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <input
                  type="text"
                  value={newSaleProduct.brand}
                  onChange={(e) => setNewSaleProduct({ ...newSaleProduct, brand: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <input
                  type="text"
                  value={newSaleProduct.color}
                  onChange={(e) => setNewSaleProduct({ ...newSaleProduct, color: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newSaleProduct.description}
                  onChange={(e) => setNewSaleProduct({ ...newSaleProduct, description: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
                <input
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {newSaleProduct.images.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {newSaleProduct.images.map((img, index) => (
                      <div key={index} className="relative">
                        <img
                          src={img}
                          alt="Sale product preview"
                          className="w-16 h-16 object-cover rounded border border-gray-200"
                        />
                        <button
                          onClick={() =>
                            setNewSaleProduct({
                              ...newSaleProduct,
                              images: newSaleProduct.images.filter((_, i) => i !== index),
                            })
                          }
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-md"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Adding...
                </>
              ) : (
                <>
                  <Plus size={16} className="mr-2" />
                  Add Sale Product
                </>
              )}
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center">
            <ImageIcon size={18} className="text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Sale Product Inventory</h2>
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {filteredSaleProducts.length} {filteredSaleProducts.length === 1 ? "product" : "products"}
            </span>
          </div>

          {isLoading && !saleProducts.length ? (
            <div className="flex justify-center items-center p-8">
              <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="ml-2 text-gray-600">Loading sale products...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <th className="px-4 sm:px-6 py-3">Title</th>
                    <th className="px-4 sm:px-6 py-3">Price</th>
                    <th className="px-4 sm:px-6 py-3">Sale Price</th>
                    <th className="px-4 sm:px-6 py-3">Qty</th>
                    <th className="px-4 sm:px-6 py-3">Category</th>
                    <th className="px-4 sm:px-6 py-3">Brand</th>
                    <th className="px-4 sm:px-6 py-3">Description</th>
                    <th className="px-4 sm:px-6 py-3">Image</th>
                    <th className="px-4 sm:px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSaleProducts.length > 0 ? (
                    filteredSaleProducts.map((saleProduct) => (
                      <motion.tr
                        key={saleProduct._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{saleProduct.title}</div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">Rs {saleProduct.price?.toFixed(2)}</div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-blue-900 font-bold">Rs {saleProduct.salePrice?.toFixed(2)}</div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{saleProduct.quantity}</div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{saleProduct.category}</div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{saleProduct.brand || "N/A"}</div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="text-sm text-gray-600 line-clamp-2">{saleProduct.description || "N/A"}</div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          {saleProduct.images?.[0] ? (
                            <img
                              src={saleProduct.images[0]}
                              alt={saleProduct.title}
                              className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs">
                              N/A
                            </div>
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditSaleProduct(saleProduct)}
                              className="p-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 hover:text-yellow-700 transition-colors shadow-sm"
                              disabled={isLoading}
                              title="Edit Sale Product"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteSaleProduct(saleProduct._id)}
                              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors shadow-sm"
                              disabled={isLoading}
                              title="Delete Sale Product"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                        {searchTerm ? (
                          <div>
                            <div className="mx-auto w-24 h-24 flex items-center justify-center bg-gray-100 rounded-full mb-4">
                              <Search size={40} className="text-gray-400" />
                            </div>
                            <p>No sale products found matching "{searchTerm}"</p>
                            <button onClick={() => setSearchTerm("")} className="mt-2 text-blue-600 hover:text-blue-800">
                              Clear search
                            </button>
                          </div>
                        ) : (
                          <div>
                            <div className="mx-auto w-24 h-24 flex items-center justify-center bg-gray-100 rounded-full mb-4">
                              <ImageIcon size={40} className="text-gray-400" />
                            </div>
                            <p>No sale products found</p>
                            <p className="text-sm mt-1">Add your first sale product using the form above</p>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {EditSaleProductModal()}
    </div>
  );
};

export default AdminSaleProducts;