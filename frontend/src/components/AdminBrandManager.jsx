import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminBrandManager = () => {
  const [brands, setBrands] = useState([]);
  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [preview, setPreview] = useState(null);
  const BASE_URL = "http://localhost:5001";

  const fetchBrands = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/brand`);
      setBrands(res.data);
    } catch (err) {
      alert("Failed to fetch brands");
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    setPreview(URL.createObjectURL(e.target.files[0]));
  };

  const resetForm = () => {
    setTitle("");
    setImage(null);
    setEditId(null);
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("title", title);
    if (image) formData.append("image", image);

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      withCredentials: true,
    };

    try {
      if (editId) {
        await axios.put(`${BASE_URL}/api/brand/${editId}`, formData, config);
      } else {
        await axios.post(`${BASE_URL}/api/brand`, formData, config);
      }
      fetchBrands();
      resetForm();
    } catch (err) {
      alert("Failed to save brand");
    }
    setLoading(false);
  };

  const handleEdit = (brand) => {
    setTitle(brand.title);
    setEditId(brand._id);
    setPreview(brand.image ? `${BASE_URL}${brand.image}` : null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this brand?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/brand/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        withCredentials: true,
      });
      fetchBrands();
    } catch (err) {
      alert("Failed to delete brand");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 mb-8">
        <div>
          <label className="block mb-1 font-semibold text-blue-900">Brand Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <div>
          <label className="block mb-1 font-semibold text-blue-900">Brand Image</label>
          <input type="file" accept="image/*" onChange={handleImageChange} className="w-full" />
          {preview && <img src={preview} alt="Preview" className="h-16 mt-2 rounded shadow border" />}
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="bg-blue-600 text-white font-semibold px-6 py-2 rounded hover:bg-blue-700 transition-all disabled:opacity-60">
            {editId ? "Update" : "Add"} Brand
          </button>
          {editId && (
            <button type="button" onClick={resetForm} className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400 transition-all">Cancel</button>
          )}
        </div>
      </form>
      <div>
        <h3 className="text-xl font-semibold text-blue-900 mb-4">Brand List</h3>
        <div className="divide-y divide-gray-200">
          {brands.map(brand => (
            <div key={brand._id} className="flex items-center gap-4 py-3">
              <img src={brand.image ? `${BASE_URL}${brand.image}` : "/placeholder.jpg"} alt={brand.title} className="h-12 w-12 rounded object-cover border shadow" />
              <span className="flex-1 font-medium text-gray-800">{brand.title}</span>
              <button onClick={() => handleEdit(brand)} className="text-blue-600 hover:underline font-semibold mr-2">Edit</button>
              <button onClick={() => handleDelete(brand._id)} className="text-red-600 hover:underline font-semibold">Delete</button>
            </div>
          ))}
          {brands.length === 0 && <div className="text-gray-500 py-6 text-center">No brands found.</div>}
        </div>
      </div>
    </div>
  );
};

export default AdminBrandManager;
