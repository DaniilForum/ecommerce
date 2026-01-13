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

  const randomizeStock = async () => {
    if (!window.confirm('Randomize stock for all products?')) return;
    try {
      const res = await getProducts();
      const all = res.data || [];
      for (const p of all) {
        const newStock = Math.floor(Math.random() * 21); // Random 0-20
        const payload = {
          name: p.name,
          price: p.price,
          category: p.category?._id || p.category,
          description: p.description,
          image: p.image,
          stock: newStock
        };
        await updateProduct(p._id, payload);
      }
      fetch();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="pm-wrapper">
      <h2>Products</h2>

      <button onClick={() => { setForm({ name: '', price: '', category: '', description: '', image: '', stock: '' }); setEditingId(null); setShowForm(true); }} style={{ marginBottom: '20px' }}>Add Product</button>
      <button onClick={randomizeStock} style={{ marginBottom: '20px', marginLeft: '10px', backgroundColor: '#e67e22' }}>Randomize Stock (temporary button)</button>

      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', width: '700px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <h3 style={{ marginTop: 0 }}>{editingId ? 'Edit Product' : 'New Product'}</h3>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '100px', fontWeight: 'bold' }}>Name: <span style={{ color: 'red' }}>*</span></label>
                <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '100px', fontWeight: 'bold' }}>Price: <span style={{ color: 'red' }}>*</span></label>
                <input placeholder="Price" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '100px', fontWeight: 'bold' }}>Category: <span style={{ color: 'red' }}>*</span></label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}>
                  <option value="">Select category</option>
                  {categories
                    .slice() // copy the array
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(c => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))
                  }
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '100px', fontWeight: 'bold' }}>Stock:</label>
                <input placeholder="Stock (optional)" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '100px', fontWeight: 'bold' }}>Image:</label>
                <input placeholder="Image URL (optional)" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <label style={{ width: '100px', fontWeight: 'bold', marginTop: '8px' }}>Desc:</label>
                <textarea placeholder="Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '100px', resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit">{editingId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
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
