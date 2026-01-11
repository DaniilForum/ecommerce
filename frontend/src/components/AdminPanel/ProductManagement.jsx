import React, { useState, useEffect } from 'react';
import { getProducts, deleteProduct, createProduct, updateProduct, getCategories } from '../../api/adminApi';
import './ProductManagement.css';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', category: '', description: '', image: '', stock: '' });
  const [editingId, setEditingId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data || []);
      try {
        const catRes = await getCategories();
        setCategories(catRes.data || []);
      } catch (err) {
        console.error('Error fetching categories', err);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: form.stock === '' ? 0 : Number(form.stock),
      };

      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await createProduct(payload);
      }
      setForm({ name: '', price: '', category: '', description: '', image: '', stock: '' });
      setEditingId(null);
      setShowForm(false);
      fetch();
    } catch (err) {
      console.error(err);
    }
  };

  const edit = (p) => {
    setForm({ name: p.name || '', price: p.price || '', category: p.category?._id || '', description: p.description || '', image: p.image || '', stock: p.stock || '' });
    setEditingId(p._id);
    setShowForm(true);
  };

  const remove = async (id) => {
    if (!window.confirm('Delete product?')) return;
    try {
      await deleteProduct(id);
      fetch();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="pm-wrapper">
      <h2>Products</h2>

      <div style={{ marginBottom: 12 }}>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: '', price: '', category: '', description: '', image: '', stock: '' }); }}>
          {showForm ? 'Close' : 'Add product'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} style={{ marginBottom: 16 }}>
          <div className="pm-form">
            <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <input placeholder="Price" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
              <option value="">Select category</option>
              {categories.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <input placeholder="Stock (optional)" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
            <input placeholder="Image URL (optional)" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} />
            <input placeholder="Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div style={{ marginTop: 8 }}>
            <button type="submit">{editingId ? 'Update' : 'Create'}</button>
            {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ name: '', price: '', category: '', description: '', image: '', stock: '' }); setShowForm(false); }}>Cancel</button>}
          </div>
        </form>
      )}

      <ul className="pm-list">
        {products.map(p => (
          <li key={p._id} className="pm-item">
            <div>
              <strong>{p.name}</strong> — ${p.price} — stock: {p.stock || 0}
            </div>
            <div className="pm-actions">
              <button onClick={() => edit(p)}>Edit</button>
              <button className="delete" onClick={() => remove(p._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductManagement;
