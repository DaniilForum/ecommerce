import React, { useState } from 'react';
import ProductManagement from './ProductManagement';
import CategoryManagement from './CategoryManagement';
import UserManagement from './UserManagement';
import './AdminPanel.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('products');

  return (
    <div className="admin-panel-wrapper">
      <header className="admin-panel-header">
        <h1>Admin Panel</h1>
        <div className="admin-tabs">
          <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>Products</button>
          <button className={activeTab === 'categories' ? 'active' : ''} onClick={() => setActiveTab('categories')}>Categories</button>
          <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>Users</button>
        </div>
      </header>

      <section className="admin-content">
        {activeTab === 'products' && <ProductManagement />}
        {activeTab === 'categories' && <CategoryManagement />}
        {activeTab === 'users' && <UserManagement />}
      </section>
    </div>
  );
};

export default AdminPanel;
