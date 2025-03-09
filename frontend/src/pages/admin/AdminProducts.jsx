import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2 } from "lucide-react";

const AdminProducts = () => {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Macbook Pro",
      price: 199.99,
      stock: 50,
      category: "Laptop",
      image: "", 
    },
    {
      id: 2,
      name: "I phone 16",
      price: 89.99,
      stock: 30,
      category: "Mobile",
      image: "", 
    },
    {
      id: 3,
      name: "Minimalist Table",
      price: 299.99,
      stock: 20,
      category: "Furniture",
      image: "", 
    },
  ]);

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    image: "", 
  });
  const [editingProduct, setEditingProduct] = useState(null);

  const handleInputChange = (e, isEditing = false) => {
    const { name, value } = e.target;
    if (isEditing) {
      setEditingProduct({ ...editingProduct, [name]: value });
    } else {
      setNewProduct({ ...newProduct, [name]: value });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const addProduct = (e) => {
    e.preventDefault();
    setProducts([
      ...products,
      {
        ...newProduct,
        id: products.length + 1,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
      },
    ]);
    setNewProduct({ name: "", price: "", stock: "", category: "", image: "" });
  };

  const startEditing = (product) => {
    setEditingProduct(product);
  };

  const saveEdit = () => {
    setProducts(
      products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...editingProduct,
              price: parseFloat(editingProduct.price),
              stock: parseInt(editingProduct.stock),
            }
          : p
      )
    );
    setEditingProduct(null);
  };

  const deleteProduct = (id) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Products</h1>

      {/* Add Product Form */}
      <form
        onSubmit={addProduct}
        className="mb-8 bg-white p-6 rounded-lg shadow-md"
      >
        <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            name="name"
            value={newProduct.name}
            onChange={handleInputChange}
            placeholder="Product Name"
            className="border p-2 rounded"
            required
          />
          <input
            type="number"
            name="price"
            value={newProduct.price}
            onChange={handleInputChange}
            placeholder="Price"
            className="border p-2 rounded"
            required
          />
          <input
            type="number"
            name="stock"
            value={newProduct.stock}
            onChange={handleInputChange}
            placeholder="Stock"
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            name="category"
            value={newProduct.category}
            onChange={handleInputChange}
            placeholder="Category"
            className="border p-2 rounded"
            required
          />
          <input
            type="file"
            name="image"
            onChange={handleImageChange}
            className="border p-2 rounded"
          />
        </div>
        <button
          type="submit"
          className="mt-4 bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
        >
          Add Product
        </button>
      </form>

      {/* Product List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingProduct && editingProduct.id === product.id ? (
                    <input
                      type="text"
                      name="name"
                      value={editingProduct.name}
                      onChange={(e) => handleInputChange(e, true)}
                      className="border p-1 rounded"
                    />
                  ) : (
                    product.name
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingProduct && editingProduct.id === product.id ? (
                    <input
                      type="number"
                      name="price"
                      value={editingProduct.price}
                      onChange={(e) => handleInputChange(e, true)}
                      className="border p-1 rounded w-24"
                    />
                  ) : (
                    `Rs${product.price.toFixed(2)}`
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingProduct && editingProduct.id === product.id ? (
                    <input
                      type="number"
                      name="stock"
                      value={editingProduct.stock}
                      onChange={(e) => handleInputChange(e, true)}
                      className="border p-1 rounded w-20"
                    />
                  ) : (
                    product.stock
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingProduct && editingProduct.id === product.id ? (
                    <input
                      type="text"
                      name="category"
                      value={editingProduct.category}
                      onChange={(e) => handleInputChange(e, true)}
                      className="border p-1 rounded"
                    />
                  ) : (
                    product.category
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {editingProduct && editingProduct.id === product.id ? (
                    <button
                      onClick={saveEdit}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => startEditing(product)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <Edit2 size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Editing */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Edit Product</h2>
            <div className="grid grid-cols-1 gap-4">
              <input
                type="text"
                name="name"
                value={editingProduct.name}
                onChange={(e) => handleInputChange(e, true)}
                className="border p-2 rounded"
                placeholder="Product Name"
                required
              />
              <input
                type="number"
                name="price"
                value={editingProduct.price}
                onChange={(e) => handleInputChange(e, true)}
                className="border p-2 rounded"
                placeholder="Price"
                required
              />
              <input
                type="number"
                name="stock"
                value={editingProduct.stock}
                onChange={(e) => handleInputChange(e, true)}
                className="border p-2 rounded"
                placeholder="Stock"
                required
              />
              <input
                type="text"
                name="category"
                value={editingProduct.category}
                onChange={(e) => handleInputChange(e, true)}
                className="border p-2 rounded"
                placeholder="Category"
                required
              />
              <input
                type="file"
                onChange={handleImageChange}
                className="border p-2 rounded"
              />
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={saveEdit}
                className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
              >
                Save
              </button>
              <button
                onClick={() => setEditingProduct(null)}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
