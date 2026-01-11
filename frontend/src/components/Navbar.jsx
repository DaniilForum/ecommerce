import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProfile } from '../api/authApi';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const token = localStorage.getItem('authToken');
  const dropdownRef = useRef();

  useEffect(() => {
    if (!token) { setUser(null); return; }
    let cancelled = false;
    (async () => {
      try {
        const res = await getProfile();
        if (!cancelled) {
          setUser(res.data || null);
          setOpen(false);
        }
      } catch (err) {
        console.warn('Profile fetch failed', err);
        setUser(null);
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  useEffect(() => {
    const onDoc = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setOpen(false);
    navigate('/');
  };

  return (
    <nav>
      <div>
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
      </div>

      <div>
        {/* right-side controls: cart then user */}
        <Link to="/cart">Cart</Link>

        {/* only show Admin link for admin users */}
        {user && user.role === 'admin' && (
          <Link to="/admin">Admin panel</Link>
        )}

        {!user ? (
          <>
            <Link to="/signup">Signup</Link>
            <Link to="/login">Login</Link>
          </>
        ) : (
          <div ref={dropdownRef} style={{ display: 'inline-block', position: 'relative' }}>
            <button onClick={() => setOpen(s => !s)} style={{ marginLeft: 12 }}>{user.name || user.email || 'User'}</button>
            {open && (
              <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: '#fff', boxShadow: '0 6px 18px rgba(0,0,0,0.08)', borderRadius: 8, padding: 12, zIndex: 200 }}>
                <div style={{ marginBottom: 8, fontWeight: 700 }}>{user.name || '—'}</div>
                <div style={{ marginBottom: 8, color: '#555' }}>{user.email}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={handleLogout} style={{ background: '#ff6b6b', color: '#fff', border: 'none', padding: '8px 10px', borderRadius: 6 }}>Logout</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
