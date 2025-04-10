import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Save, X, Search, Image as ImageIcon } from "lucide-react";
import axios from "axios";
import Navbar from "../../components/AdminNav";

const initialProductState = {
  title: "",
  price: "",
  quantity: "",
  category: "",
  brand: "",
  color: "",
  description: "",
  images: [],
  isOnSale: false,
  discountPercentage: 0,
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState(initialProductState);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const API_URL = "http://localhost:5001/api/products";

  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(API_URL, getAuthConfig());
      setProducts(response.data.products || []);
      setError("");
    } catch (err) {
      console.error("Fetch products error:", err);
      setError("Failed to fetch products: " + (err.response?.data?.message || "Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = async (e, isEditing = false) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "your_upload_preset"); // Replace with actual Cloudinary preset

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/de9o7sdbs/image/upload",
        formData
      );
      const imageUrl = res.data.secure_url;
      setNewProduct((prev) => ({
        ...prev,
        images: [...prev.images, imageUrl],
      }));
    } catch (error) {
      console.error("Image upload error:", error);
      setError("Error uploading image: " + (error.response?.data?.message || "Please try again."));
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.price || !newProduct.quantity || !newProduct.category) {
      setError("Title, price, quantity, and category are required!");
      return;
    }

    try {
      setIsLoading(true);
      await axios.post(API_URL, newProduct, getAuthConfig());
      setNewProduct(initialProductState);
      setSuccess("Product added successfully!");
      setError("");
      await fetchProducts();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Add product error:", err);
      setError("Failed to add product: " + (err.response?.data?.message || "Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    const editProduct = {
      id: product._id,
      title: product.title || "",
      price: product.price || "",
      quantity: product.quantity || "",
      category: product.category || "",
      brand: product.brand || "",
      color: product.color || "",
      description: product.description || "",
      images: product.images || [],
      isOnSale: product.isOnSale || false,
      discountPercentage: product.discountPercentage || 0,
    };
    setSelectedProduct(product);
    setNewProduct(editProduct);
    setIsEditing(true);
    setError("");
  };

  const handleUpdateProduct = async () => {
    if (!newProduct.title || !newProduct.price || !newProduct.quantity || !newProduct.category) {
      setError("Title, price, quantity, and category are required!");
      return;
    }

    try {
      setIsLoading(true);
      const productData = { ...newProduct, _id: newProduct.id };
      await axios.put(`${API_URL}/${newProduct.id}`, productData, getAuthConfig());
      setIsEditing(false);
      setNewProduct(initialProductState);
      setSuccess("Product updated successfully!");
      setError("");
      await fetchProducts();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Update product error:", err);
      setError("Failed to update product: " + (err.response?.data?.message || "Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      setIsLoading(true);
      await axios.delete(`${API_URL}/${id}`, getAuthConfig());
      setSuccess("Product deleted successfully!");
      setError("");
      await fetchProducts();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Delete product error:", err);
      setError("Failed to delete product: " + (err.response?.data?.message || "Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter((product) =>
    (product.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (product.category?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (product.brand?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const EditProductModal = () => {
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
            <h2 className="text-xl font-semibold text-gray-900">Edit Product</h2>
            <button
              onClick={() => {
                setIsEditing(false);
                setNewProduct(initialProductState);
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
                value={newProduct.title}
                onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs)</label>
              <input
                type="number"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                value={newProduct.quantity}
                onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <input
                type="text"
                value={newProduct.brand}
                onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <input
                type="text"
                value={newProduct.color}
                onChange={(e) => setNewProduct({ ...newProduct, color: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
              <input
                type="file"
                onChange={(e) => handleImageChange(e, true)}
                accept="image/*"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {newProduct.images.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img}
                      alt="Product preview"
                      className="w-16 h-16 object-cover rounded border border-gray-200"
                    />
                    <button
                      onClick={() =>
                        setNewProduct({
                          ...newProduct,
                          images: newProduct.images.filter((_, i) => i !== index),
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">On Sale</label>
              <input
                type="checkbox"
                checked={newProduct.isOnSale}
                onChange={(e) => setNewProduct({ ...newProduct, isOnSale: e.target.checked })}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
            {newProduct.isOnSale && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Percentage (%)</label>
                <input
                  type="number"
                  value={newProduct.discountPercentage}
                  onChange={(e) => setNewProduct({ ...newProduct, discountPercentage: e.target.value })}
                  min="0"
                  max="100"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setIsEditing(false);
                setNewProduct(initialProductState);
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateProduct}
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
                  Update Product
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  if (isLoading && !products.length) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <svg
              className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Manage Products</h1>
          <p className="text-gray-600">Add, edit, or remove products from your inventory.</p>
        </motion.div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md text-sm border-l-4 border-green-500">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md text-sm border-l-4 border-red-500">
            {error}
          </div>
        )}

        {/* Add Product Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-md mb-12"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Add New Product</h2>
          <form onSubmit={handleAddProduct} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Title</label>
                <input
                  type="text"
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs)</label>
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter price"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  value={newProduct.quantity}
                  onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter quantity"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter category"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <input
                  type="text"
                  value={newProduct.brand}
                  onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter brand"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <input
                  type="text"
                  value={newProduct.color}
                  onChange={(e) => setNewProduct({ ...newProduct, color: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter color"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                placeholder="Enter product description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
              <div className="flex items-center">
                <label className="w-full p-2.5 border border-gray-300 rounded-lg cursor-pointer flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                  <ImageIcon size={20} className="mr-2 text-gray-500" />
                  <span className="text-gray-700">Upload Image</span>
                  <input
                    type="file"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </label>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {newProduct.images.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img}
                      alt="Product preview"
                      className="w-16 h-16 object-cover rounded border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setNewProduct({
                          ...newProduct,
                          images: newProduct.images.filter((_, i) => i !== index),
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
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">On Sale</label>
                <input
                  type="checkbox"
                  checked={newProduct.isOnSale}
                  onChange={(e) => setNewProduct({ ...newProduct, isOnSale: e.target.checked })}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              {newProduct.isOnSale && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Percentage (%)</label>
                  <input
                    type="number"
                    value={newProduct.discountPercentage}
                    onChange={(e) => setNewProduct({ ...newProduct, discountPercentage: e.target.value })}
                    min="0"
                    max="100"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter discount percentage"
                  />
                </div>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
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
                  <Plus size={18} className="mr-2" />
                  Add Product
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Product List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-md"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Product List</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                placeholder="Search products..."
              />
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No products found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4 text-sm font-semibold text-gray-700">Image</th>
                    <th className="p-4 text-sm font-semibold text-gray-700">Title</th>
                    <th className="p-4 text-sm font-semibold text-gray-700">Price</th>
                    <th className="p-4 text-sm font-semibold text-gray-700">Quantity</th>
                    <th className="p-4 text-sm font-semibold text-gray-700">Category</th>
                    <th className="p-4 text-sm font-semibold text-gray-700">Brand</th>
                    <th className="p-4 text-sm font-semibold text-gray-700">Sale</th>
                    <th className="p-4 text-sm font-semibold text-gray-700">Discount</th>
                    <th className="p-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-4">
                        <img
                          src={product.images?.[0] || "/placeholder.jpg"}
                          alt={product.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                      </td>
                      <td className="p-4 text-sm text-gray-900">{product.title}</td>
                      <td className="p-4 text-sm text-gray-900">
                        {product.isOnSale && product.discountPercentage > 0
                          ? (
                            <>
                              <span className="line-through text-gray-500 mr-2">
                                Rs {product.price.toLocaleString()}
                              </span>
                              Rs {(product.price * (1 - product.discountPercentage / 100)).toLocaleString()}
                            </>
                          )
                          : `Rs ${product.price.toLocaleString()}`}
                      </td>
                      <td className="p-4 text-sm text-gray-900">{product.quantity}</td>
                      <td className="p-4 text-sm text-gray-900">{product.category}</td>
                      <td className="p-4 text-sm text-gray-900">{product.brand || "N/A"}</td>
                      <td className="p-4 text-sm text-gray-900">
                        {product.isOnSale ? (
                          <span className="text-green-600 font-medium">Yes</span>
                        ) : (
                          "No"
                        )}
                      </td>
                      <td className="p-4 text-sm text-gray-900">
                        {product.isOnSale ? `${product.discountPercentage}%` : "-"}
                      </td>
                      <td className="p-4 flex space-x-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        <EditProductModal />
      </div>
    </div>
  );
};

export default AdminProducts;