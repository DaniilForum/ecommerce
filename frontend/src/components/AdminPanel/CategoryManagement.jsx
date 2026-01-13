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
      <button className="cm-btn-add" onClick={() => { setForm({ name: '', description: '' }); setEditingId(null); setShowModal(true); }}>Add Category</button>

      {showModal && (
        <div className="cm-modal-overlay">
          <div className="cm-modal-content">
            <h3 className="cm-modal-title">{editingId ? 'Edit Category' : 'New Category'}</h3>
            <form onSubmit={submit} className="cm-modal-form">
              <div className="cm-form-row">
                <label className="cm-label">Name: <span className="cm-required">*</span></label>
                <input className="cm-input" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="cm-form-row align-start">
                <label className="cm-label mt">Desc:</label>
                <textarea className="cm-textarea" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="cm-modal-actions">
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
