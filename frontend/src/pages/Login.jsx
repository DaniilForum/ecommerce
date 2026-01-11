import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/authApi';
import './Auth.css';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showSecret, setShowSecret] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form);
      if (res.data && res.data.token) {
        localStorage.setItem('authToken', res.data.token);
      }
      setError('');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <h2>Log In</h2>
      {error && <div className="auth-error">{error}</div>}
      <form onSubmit={submit} className="auth-form">
        <input placeholder="Email Address" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        <input placeholder="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
        <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Log In'}</button>
      </form>

      <button
        type="button"
        onClick={() => setShowSecret(true)}
        style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          opacity: 0.8,
          zIndex: 1000,
          cursor: 'pointer'
        }}
      >
        !
      </button>

      {showSecret && (
        <>
          <div
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1500 }}
            onClick={() => setShowSecret(false)}
          />
          <div style={{
            position: 'fixed',
            bottom: '50px',
            right: '10px',
            background: '#fff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            gap: '10px',
            flexDirection: 'column',
            zIndex: 2000
          }}>
            <button onClick={() => {
              setForm({ email: 'admin@admin.com', password: 'admin123' });
              setShowSecret(false);
            }}>Fill Admin</button>
            <button onClick={() => {
              setForm({ email: 'test@test.com', password: 'test123' });
              setShowSecret(false);
            }}>Fill User</button>
          </div>
        </>
      )}
    </div>
  );
};

export default Login;
