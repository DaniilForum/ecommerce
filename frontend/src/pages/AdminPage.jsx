import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminPanel from '../components/AdminPanel/AdminPanel';
import ProductManagement from '../components/AdminPanel/ProductManagement';
import CategoryManagement from '../components/AdminPanel/CategoryManagement';
import UserManagement from '../components/AdminPanel/UserManagement';

const AdminPage = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminPanel />}>
        {/* nested routes could be added if needed */}
      </Route>
      <Route path="products" element={<ProductManagement />} />
      <Route path="categories" element={<CategoryManagement />} />
      <Route path="users" element={<UserManagement />} />
    </Routes>
  );
};

export default AdminPage;
