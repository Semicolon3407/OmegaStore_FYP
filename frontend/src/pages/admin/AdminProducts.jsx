import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Search,
  Image as ImageIcon,
  Loader2,
  Tag,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import AdminSidebar from "../../components/AdminNav";

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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const API_URL = "http://localhost:5001/api/products";

  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await axios.get(API_URL, getAuthConfig());
      setProducts(response.data.products || []);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to fetch products.";
      setError(errorMsg);
      if (err.response?.status === 401) {
        toast.info("Session expired, please login");
        navigate("/sign-in");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      toast.info("Access denied. Admins only.");
      navigate("/sign-in");
    } else {
      fetchProducts();
    }
  }, [navigate, location.pathname]);

  const handleImageChange = async (e, isEditing = false) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post("http://localhost:5001/api/upload", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      const imageUrl = res.data.imageUrl;
      setNewProduct((prev) => ({
        ...prev,
        images: [...prev.images, imageUrl],
      }));
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Error uploading image.";
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (
      !newProduct.title ||
      !newProduct.price ||
      !newProduct.quantity ||
      !newProduct.category ||
      !newProduct.images.length
    ) {
      setError("Title, price, quantity, category, and at least one image are required!");
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      setIsLoading(true);
      await axios.post(API_URL, newProduct, getAuthConfig());
      setNewProduct(initialProductState);
      setSuccess("Product added successfully!");
      setError("");
      await fetchProducts();
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to add product.";
      setError(errorMsg);
      toast.error(errorMsg);
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
    if (
      !newProduct.title ||
      !newProduct.price ||
      !newProduct.quantity ||
      !newProduct.category ||
      !newProduct.images.length
    ) {
      setError("Title, price, quantity, category, and at least one image are required!");
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      setIsLoading(true);
      const productData = { ...newProduct, _id: newProduct.id };
      await axios.put(`${API_URL}/${newProduct.id}`, productData, getAuthConfig());
      setIsEditing(false);
      setNewProduct(initialProductState);
      setSelectedProduct(null);
      setSuccess("Product updated successfully!");
      setError("");
      await fetchProducts();
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to update product.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    try {
      setIsLoading(true);
      await axios.delete(`${API_URL}/${productToDelete}`, getAuthConfig());
      setSuccess("Product deleted successfully!");
      setError("");
      await fetchProducts();
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to delete product.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      (product.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (product.category?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (product.brand?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  if (isLoading && !products.length) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center p-4 md:p-6">
          <div className="text-center">
            <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
            <p className="text-gray-600 text-lg">Loading products...</p>
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
            Manage Products
          </h1>
          <p className="text-gray-600 text-base">
            Add, edit, or remove products from your inventory.
          </p>
        </motion.div>

        {/* Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border-l-4 border-red-500"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg border-l-4 border-green-500"
          >
            {success}
          </motion.div>
        )}

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search products by title, category, or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:opacity-50"
              disabled={isLoading}
            />
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </motion.div>

        {/* Add Product Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200"
        >
          <div className="flex items-center gap-2 mb-4">
            <Plus size={24} className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Add New Product</h2>
          </div>
          <form onSubmit={handleAddProduct}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-1 font-medium">
                  Product Title
                </label>
                <input
                  type="text"
                  value={newProduct.title}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, title: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:opacity-50"
                  placeholder="e.g., iPhone 16 Pro"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-medium">
                  Price (Rs)
                </label>
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, price: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:opacity-50"
                  placeholder="e.g., 150000"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-medium">
                  Quantity
                </label>
                <input
                  type="number"
                  value={newProduct.quantity}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, quantity: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:opacity-50"
                  placeholder="e.g., 100"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-medium">
                  Category
                </label>
                <input
                  type="text"
                  value={newProduct.category}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, category: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:opacity-50"
                  placeholder="e.g., Smartphones"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Brand</label>
                <input
                  type="text"
                  value={newProduct.brand}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, brand: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:opacity-50"
                  placeholder="e.g., Apple"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Color</label>
                <input
                  type="text"
                  value={newProduct.color}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, color: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:opacity-50"
                  placeholder="e.g., Black Titanium"
                  disabled={isLoading}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-gray-700 mb-1 font-medium">
                  Description
                </label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, description: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:opacity-50"
                  placeholder="e.g., The latest iPhone with A18 Pro chip..."
                  disabled={isLoading}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-gray-700 mb-1 font-medium">
                  Product Images
                </label>
                <input
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="w-full p-2 border border-gray-300 rounded-lg disabled:opacity-50"
                  disabled={isLoading}
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
                        type="button"
                        onClick={() =>
                          setNewProduct({
                            ...newProduct,
                            images: newProduct.images.filter((_, i) => i !== index),
                          })
                        }
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                        disabled={isLoading}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newProduct.isOnSale}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, isOnSale: e.target.checked })
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                    disabled={isLoading}
                  />
                  <label className="text-gray-700 font-medium">On Sale</label>
                </div>
                {newProduct.isOnSale && (
                  <div className="flex-1">
                    <label className="block text-gray-700 mb-1 font-medium">
                      Discount Percentage (%)
                    </label>
                    <input
                      type="number"
                      value={newProduct.discountPercentage}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          discountPercentage: e.target.value,
                        })
                      }
                      min="0"
                      max="100"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:opacity-50"
                      placeholder="e.g., 10"
                      disabled={isLoading}
                    />
                  </div>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              <Plus size={20} className="mr-2" />
              Add Product
            </button>
          </form>
        </motion.div>

        {/* Products Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-lg shadow-md border border-gray-200 overflow-x-auto"
        >
          <div className="p-4 bg-gray-100 flex items-center gap-2">
            <Tag size={20} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Product List</h2>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "product" : "products"}
            </span>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-gray-700 font-medium">Image</th>
                <th className="px-4 py-3 text-gray-700 font-medium">Title</th>
                <th className="px-4 py-3 text-gray-700 font-medium">Price</th>
                <th className="px-4 py-3 text-gray-700 font-medium">Quantity</th>
                <th className="px-4 py-3 text-gray-700 font-medium">Category</th>
                <th className="px-4 py-3 text-gray-700 font-medium">Brand</th>
                <th className="px-4 py-3 text-gray-700 font-medium">Sale</th>
                <th className="px-4 py-3 text-gray-700 font-medium">Discount</th>
                <th className="px-4 py-3 text-gray-700 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product, index) => (
                    <motion.tr
                      key={product._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        <img
                          src={product.images?.[0] || "/placeholder.jpg"}
                          alt={product.title}
                          className="w-12 h-12 object-cover rounded border border-gray-200"
                        />
                      </td>
                      <td className="px-4 py-3 text-gray-800">{product.title}</td>
                      <td className="px-4 py-3 text-gray-800">
                        {product.isOnSale && product.discountPercentage > 0 ? (
                          <>
                            <span className="line-through text-gray-500 mr-2">
                              Rs {Number(product.price).toLocaleString()}
                            </span>
                            Rs{" "}
                            {(
                              product.price *
                              (1 - product.discountPercentage / 100)
                            ).toLocaleString()}
                          </>
                        ) : (
                          `Rs ${Number(product.price).toLocaleString()}`
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-800">{product.quantity}</td>
                      <td className="px-4 py-3 text-gray-800">{product.category}</td>
                      <td className="px-4 py-3 text-gray-800">
                        {product.brand || "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.isOnSale
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {product.isOnSale ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-800">
                        {product.isOnSale ? `${product.discountPercentage}%` : "-"}
                      </td>
                      <td className="px-4 py-3 flex gap-3">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-orange-500 hover:text-orange-600 transition-colors"
                          title="Edit Product"
                          disabled={isLoading}
                        >
                          <Edit2 size={20} />
                        </button>
                        <button
                          onClick={() => {
                            setProductToDelete(product._id);
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-red-500 hover:text-red-600 transition-colors"
                          title="Delete Product"
                          disabled={isLoading}
                        >
                          <Trash2 size={20} />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-gray-200"
                  >
                    <td
                      colSpan="9"
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center">
                        {searchTerm ? (
                          <>
                            <Search size={48} className="text-blue-600 mb-2" />
                            <p>No products found matching "{searchTerm}"</p>
                            <button
                              onClick={() => setSearchTerm("")}
                              className="mt-2 text-blue-500 hover:text-blue-600"
                            >
                              Clear search
                            </button>
                          </>
                        ) : (
                          <>
                            <Tag size={48} className="text-blue-600 mb-2" />
                            <p>No products found</p>
                            <p className="text-sm mt-1">
                              Add a product using the form above
                            </p>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </motion.div>

        {/* Edit Product Modal */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="bg-white rounded-lg shadow-md p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setNewProduct(initialProductState);
                    setSelectedProduct(null);
                  }}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                  title="Close"
                >
                  <X size={24} />
                </button>
                <div className="flex items-center gap-2 mb-4">
                  <Edit2 size={24} className="text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-800">
                    Edit Product
                  </h2>
                </div>
                {error && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm border-l-4 border-red-500">
                    {error}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-1 font-medium">
                      Product Title
                    </label>
                    <input
                      type="text"
                      value={newProduct.title}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, title: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:opacity-50"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1 font-medium">
                      Price (Rs)
                    </label>
                    <input
                      type="number"
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, price: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:opacity-50"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1 font-medium">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={newProduct.quantity}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, quantity: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:opacity-50"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1 font-medium">
                      Category
                    </label>
                    <input
                      type="text"
                      value={newProduct.category}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, category: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:opacity-50"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1 font-medium">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={newProduct.brand}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, brand: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:opacity-50"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1 font-medium">
                      Color
                    </label>
                    <input
                      type="text"
                      value={newProduct.color}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, color: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:opacity-50"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-gray-700 mb-1 font-medium">
                      Description
                    </label>
                    <textarea
                      value={newProduct.description}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          description: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:opacity-50"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-gray-700 mb-1 font-medium">
                      Product Images
                    </label>
                    <input
                      type="file"
                      onChange={(e) => handleImageChange(e, true)}
                      accept="image/*"
                      className="w-full p-2 border border-gray-300 rounded-lg disabled:opacity-50"
                      disabled={isLoading}
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
                            type="button"
                            onClick={() =>
                              setNewProduct({
                                ...newProduct,
                                images: newProduct.images.filter(
                                  (_, i) => i !== index
                                ),
                              })
                            }
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                            disabled={isLoading}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newProduct.isOnSale}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            isOnSale: e.target.checked,
                          })
                        }
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                        disabled={isLoading}
                      />
                      <label className="text-gray-700 font-medium">On Sale</label>
                    </div>
                    {newProduct.isOnSale && (
                      <div className="flex-1">
                        <label className="block text-gray-700 mb-1 font-medium">
                          Discount Percentage (%)
                        </label>
                        <input
                          type="number"
                          value={newProduct.discountPercentage}
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              discountPercentage: e.target.value,
                            })
                          }
                          min="0"
                          max="100"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:opacity-50"
                          disabled={isLoading}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-6 flex gap-4">
                  <button
                    onClick={handleUpdateProduct}
                    disabled={isLoading}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                  >
                    <Save size={20} className="mr-2" />
                    Update Product
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setNewProduct(initialProductState);
                      setSelectedProduct(null);
                    }}
                    disabled={isLoading}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
                  Are you sure you want to delete this product? This action cannot
                  be undone.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={handleDeleteProduct}
                    disabled={isLoading}
                    className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    disabled={isLoading}
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

export default AdminProducts;