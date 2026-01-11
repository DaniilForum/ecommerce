import React, { useState, useEffect } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/adminApi';
import './CategoryManagement.css';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState(null);

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
      fetch();
    } catch (err) { console.error(err); }
  };

  const edit = (c) => { setForm({ name: c.name || '', description: c.description || '' }); setEditingId(c._id); };
  const remove = async (id) => { if (!window.confirm('Delete category?')) return; try { await deleteCategory(id); fetch(); } catch (err) { console.error(err); } };

  return (
    <div className="cm-wrapper">
      <h2>Categories</h2>
      <form onSubmit={submit} className="cm-form">
        <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <div>
          <button type="submit">{editingId ? 'Update' : 'Create'}</button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ name: '', description: '' }); }}>Cancel</button>}
        </div>
      </form>

      <ul className="cm-list">
        {categories.map(c => (
          <li key={c._id} className="cm-item">
            <div>
              <strong>{c.name}</strong> — {c.description || '—'}
            </div>
            <div className="cm-actions">
              <button onClick={() => edit(c)}>Edit</button>
              <button onClick={() => remove(c._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryManagement;
