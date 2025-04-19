import React from "react";
import AdminSidebar from "../components/AdminNav";
import AdminBrandManager from "../components/AdminBrandManager";

const AdminBrandsPage = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-10">
        <h1 className="text-3xl font-bold text-blue-900 mb-8">Manage Brands</h1>
        <div className="max-w-3xl mx-auto">
          <AdminBrandManager />
        </div>
      </main>
    </div>
  );
};

export default AdminBrandsPage;
