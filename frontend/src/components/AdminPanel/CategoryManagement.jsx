import React, { useState, useEffect } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/adminApi';
import './CategoryManagement.css';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { fetch(); }, []);

  const fetch = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data || []);
    } catch (err) { console.error(err); }
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await updateCategory(editingId, form);
      else await createCategory(form);
      setForm({ name: '', description: '' });
      setEditingId(null);
      setShowModal(false);
      fetch();
    } catch (err) { console.error(err); }
  };

  const edit = (c) => {
    setForm({ name: c.name || '', description: c.description || '' });
    setEditingId(c._id);
    setShowModal(true);
  };

  const remove = async (id) => { if (!window.confirm('Delete category?')) return; try { await deleteCategory(id); fetch(); } catch (err) { console.error(err); } };

  return (
    <div className="cm-wrapper">
      <h2>Categories</h2>
      <button onClick={() => { setForm({ name: '', description: '' }); setEditingId(null); setShowModal(true); }} style={{ marginBottom: '20px' }}>Add Category</button>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', width: '600px', maxWidth: '90%', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <h3 style={{ marginTop: 0 }}>{editingId ? 'Edit Category' : 'New Category'}</h3>
            <form onSubmit={submit} className="cm-form" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ width: '100px', fontWeight: 'bold' }}>Name: <span style={{ color: 'red' }}>*</span></label>
                <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <label style={{ width: '100px', fontWeight: 'bold', marginTop: '8px' }}>Desc:</label>
                <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '100px', resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit">{editingId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ul className="cm-list">
        {categories.map(c => (
          <li key={c._id} className="cm-item">
            <div>
              <strong>{c.name}</strong> — {c.description || '—'}
            </div>
            <div className="cm-actions">
              <button onClick={() => edit(c)}>Edit</button>
              <button className="delete" onClick={() => remove(c._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryManagement;
