import React, { useState, useEffect } from 'react';
import { getProducts, deleteProduct, createProduct, updateProduct, getCategories } from '../../api/adminApi';
import './ProductManagement.css';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', category: '', description: '', image: '', stock: '', rating: 0, topSelling: false, offer: '' });
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
        rating: Number(form.rating),
      };

      if (editingId) {
        // Admin rights required
        await updateProduct(editingId, payload);
      } else {
        // Admin rights required
        await createProduct(payload);
      }
      setForm({ name: '', price: '', category: '', description: '', image: '', stock: '', rating: 0, topSelling: false, offer: '' });
      setEditingId(null);
      setShowForm(false);
      fetch();
    } catch (err) {
      console.error(err);
    }
  };

  const edit = (p) => {
    setForm({
      name: p.name || '',
      price: p.price || '',
      category: p.category?._id || p.category || '',
      description: p.description || '',
      image: p.image || '',
      stock: p.stock ?? 0,
      rating: p.rating || 0,
      topSelling: p.topSelling || false,
      offer: p.offer || ''
    });
    setEditingId(p._id);
    setShowForm(true);
  };

  const remove = async (id) => {
    if (!window.confirm('Delete product?')) return;
    try {
      // Admin rights required
      await deleteProduct(id);
      fetch();
    } catch (err) { console.error(err); }
  };

  const randomizeStock = async () => {
    if (!window.confirm('Overwrite all products with random data (stock, rating, offer, topSelling)?')) return;
    try {
      const res = await getProducts();
      const all = res.data || [];
      const offers = ['10% OFF', 'Sale', 'Best Value', 'Limited Time', 'Hot Deal'];

      for (const p of all) {
        try {
          const newStock = Math.floor(Math.random() * 21);
          const newRating = parseFloat((1 + Math.random() * 4).toFixed(1));
          const newTopSelling = Math.random() < 0.3;
          const newOffer = offers[Math.floor(Math.random() * offers.length)];

          // Handle missing category: if null, pick a random one from existing categories
          let catId = p.category?._id || p.category;
          if (!catId && categories.length > 0) {
            catId = categories[Math.floor(Math.random() * categories.length)]._id;
          }

          const payload = {
            name: p.name,
            price: p.price,
            category: catId || undefined,
            description: p.description,
            image: p.image,
            stock: newStock,
            rating: newRating,
            topSelling: newTopSelling,
            offer: newOffer
          };
          // Admin rights required
          await updateProduct(p._id, payload);
        } catch (innerErr) {
          console.error(`Failed to update product ${p.name} (ID: ${p._id}):`, innerErr);
        }
      }
      fetch();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="pm-wrapper">
      <h2>Products</h2>

      <button className="pm-btn-add" onClick={() => { setForm({ name: '', price: '', category: '', description: '', image: '', stock: '', rating: 0, topSelling: false, offer: '' }); setEditingId(null); setShowForm(true); }}>Add Product</button>
      <button className="pm-btn-random" onClick={randomizeStock}>Randomize All Data</button>

      {showForm && (
        <div className="pm-modal-overlay">
          <div className="pm-modal-content">
            <h3 className="pm-modal-title">{editingId ? 'Edit Product' : 'New Product'}</h3>
            <form onSubmit={submit} className="pm-modal-form">
              <div className="pm-form-row">
                <label className="pm-label">Name: <span className="pm-required">*</span></label>
                <input className="pm-input" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="pm-form-row">
                <label className="pm-label">Price: <span className="pm-required">*</span></label>
                <input className="pm-input" placeholder="Price" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
              </div>
              <div className="pm-form-row">
                <label className="pm-label">Category: <span className="pm-required">*</span></label>
                <select className="pm-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
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
              <div className="pm-form-row">
                <label className="pm-label">Stock:</label>
                <input className="pm-input" placeholder="Stock (optional)" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
              </div>
              <div className="pm-form-row">
                <label className="pm-label">Image:</label>
                <input className="pm-input" placeholder="Image URL (optional)" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} />
              </div>
              <div className="pm-form-row">
                <label className="pm-label">Rating:</label>
                <input className="pm-input" type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })} />
              </div>
              <div className="pm-form-row">
                <label className="pm-label">Offer:</label>
                <input className="pm-input" placeholder="e.g. 10% OFF" value={form.offer} onChange={e => setForm({ ...form, offer: e.target.value })} />
              </div>
              <div className="pm-form-row">
                <label className="pm-label">Top Selling:</label>
                <input type="checkbox" checked={form.topSelling} onChange={e => setForm({ ...form, topSelling: e.target.checked })} style={{ width: '20px', height: '20px' }} />
              </div>
              <div className="pm-form-row align-start">
                <label className="pm-label mt">Desc:</label>
                <textarea className="pm-textarea" placeholder="Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="pm-modal-actions">
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
