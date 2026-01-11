import api from './axiosConfig';

// Products
export const createProduct = (productData) =>
  api.post('/products', productData);

export const updateProduct = (id, productData) =>
  api.put(`/products/${id}`, productData);

export const deleteProduct = (id) =>
  api.delete(`/products/${id}`);

export const getProducts = () =>
  api.get('/products');

export const getProductById = (id) =>
  api.get(`/products/${id}`);

// Categories
export const createCategory = (categoryData) =>
  api.post('/categories', categoryData);

export const updateCategory = (id, categoryData) =>
  api.put(`/categories/${id}`, categoryData);

export const deleteCategory = (id) =>
  api.delete(`/categories/${id}`);

export const getCategories = () =>
  api.get('/categories');

// Users (Admin)
export const getAllUsers = () =>
  api.get('/admin/users');

export const deleteUser = (id) =>
  api.delete(`/admin/users/${id}`);

export const blockUser = (id) =>
  api.put(`/admin/users/${id}/block`);

export const unblockUser = (id) =>
  api.put(`/admin/users/${id}/unblock`);
