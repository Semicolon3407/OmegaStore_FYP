import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import Navbar from "../../components/AdminNav";
import axios from "axios";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    title: "", // Update to title
    price: "",
    quantity: "", // Update to quantity
    category: "",
    brand: "",
    color: "",
    description: "",
    images: [], // Change image to images (array)
  });
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/products");
      if (Array.isArray(response.data.products)) {
        setProducts(response.data.products);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  };

  const handleInputChange = (e, isEditing = false) => {
    const { name, value } = e.target;
    if (isEditing) {
      setEditingProduct({ ...editingProduct, [name]: value });
    } else {
      setNewProduct({ ...newProduct, [name]: value });
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "your_upload_preset");

      try {
        const res = await axios.post(`https://api.cloudinary.com/v1_1/de9o7sdbs/image/upload`, formData);
        setNewProduct({ ...newProduct, images: [...newProduct.images, res.data.secure_url] });
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  const addProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5001/api/products", newProduct);
      setProducts([...products, response.data.product]);
      setNewProduct({
        title: "",
        price: "",
        quantity: "",
        category: "",
        brand: "",
        color: "",
        description: "",
        images: [],
      });
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const startEditing = (product) => {
    setEditingProduct(product);
  };

  const saveEdit = async () => {
    try {
      const response = await axios.put(`http://localhost:5001/api/products/${editingProduct._id}`, editingProduct);
      setProducts(products.map(p => p._id === editingProduct._id ? response.data.product : p));
      setEditingProduct(null);
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const deleteProduct = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/api/products/${id}`);
      setProducts(products.filter(p => p._id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Manage Products</h1>

        <form onSubmit={addProduct} className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input type="text" name="title" value={newProduct.title} onChange={handleInputChange} placeholder="Product Title" className="border p-2 rounded" required />
            <input type="number" name="price" value={newProduct.price} onChange={handleInputChange} placeholder="Price" className="border p-2 rounded" required />
            <input type="number" name="quantity" value={newProduct.quantity} onChange={handleInputChange} placeholder="Quantity" className="border p-2 rounded" required />
            <input type="text" name="category" value={newProduct.category} onChange={handleInputChange} placeholder="Category" className="border p-2 rounded" required />
            <input type="text" name="brand" value={newProduct.brand} onChange={handleInputChange} placeholder="Brand" className="border p-2 rounded" required />
            <input type="text" name="color" value={newProduct.color} onChange={handleInputChange} placeholder="Color" className="border p-2 rounded" required />
            <textarea name="description" value={newProduct.description} onChange={handleInputChange} placeholder="Description" className="border p-2 rounded" required></textarea>
            <input type="file" name="image" onChange={handleImageChange} className="border p-2 rounded" />
          </div>
          <button type="submit" className="mt-4 bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">Add Product</button>
        </form>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th>Title</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Color</th>
                <th>Description</th>
                <th>Images</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((product) => (
                  <tr key={product._id}>
                    <td>{product.title}</td>
                    <td>Rs {product.price.toFixed(2)}</td>
                    <td>{product.quantity}</td>
                    <td>{product.category}</td>
                    <td>{product.brand}</td>
                    <td>{product.color}</td>
                    <td>{product.description}</td>
                    <td>{product.images && product.images.length > 0 && <img src={product.images[0]} alt={product.title} className="w-20 h-20 object-cover rounded" />}</td>
                    <td>
                      <button onClick={() => startEditing(product)} className="text-indigo-600 hover:text-indigo-900 mr-4"><Edit2 size={18} /></button>
                      <button onClick={() => deleteProduct(product._id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="9" className="text-center text-gray-500">No products available.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
