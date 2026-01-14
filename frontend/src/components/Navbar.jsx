import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProfile } from '../api/authApi';
import './Navbar.css';
import logo from '../assets/eshop_logo.png';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const token = localStorage.getItem('authToken');
  const dropdownRef = useRef();
  const navRef = useRef();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch user profile if token exists on mount or token change
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

  // Close dropdown when clicking outside of it
  useEffect(() => {
    const onDoc = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
      if (navRef.current && !navRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  // Global Scroll Restoration (handles F5/Refresh)
  useEffect(() => {
    // Save position before reload
    const handleBeforeUnload = () => {
      sessionStorage.setItem('scrollPos', window.scrollY.toString());
      sessionStorage.setItem('scrollUrl', window.location.href);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Restore position after reload
    const savedUrl = sessionStorage.getItem('scrollUrl');
    const savedPos = sessionStorage.getItem('scrollPos');

    if (savedUrl === window.location.href && savedPos) {
      const y = parseInt(savedPos, 10);
      // Try to scroll periodically to handle async content loading
      const interval = setInterval(() => {
        if (window.scrollY !== y) window.scrollTo(0, y);
      }, 50);
      // Stop trying after 1 second
      setTimeout(() => { clearInterval(interval); sessionStorage.removeItem('scrollPos'); sessionStorage.removeItem('scrollUrl'); }, 1000);
    }

    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setOpen(false);
    navigate('/');
  };

  // Handle search submission: redirects to products page with query param
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <nav ref={navRef}>
      <div className="nav-left">
        <Link to="/" className="logo-link" onClick={() => setMenuOpen(false)}>
          <img src={logo} alt="Store Logo" className="nav-logo" />
        </Link>
        {/* <Link to="/">Home</Link> */}
        <Link to="/products" onClick={() => setMenuOpen(false)}>Products</Link>
        <form onSubmit={handleSearch} className="nav-search-form" style={{ display: 'flex', flex: 1, minWidth: '100px', maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="nav-search-input"
            style={{ width: '100%' }}
          />
        </form>
      </div>

      <button className="nav-toggle" onClick={() => setMenuOpen(m => !m)} aria-label="Toggle navigation">
        <span className={`hamburger ${menuOpen ? 'open' : ''}`}></span>
      </button>

      <div className={`nav-right ${menuOpen ? 'open' : ''}`}>
        {/* right-side controls: cart then user */}
        {user && <Link to="/cart" onClick={() => setMenuOpen(false)}>Cart</Link>}

        {/* only show Admin link for admin users */}
        {user && user.role === 'admin' && (
          <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin panel</Link>
        )}

        {!user ? (
          <>
            <Link to="/signup" onClick={() => setMenuOpen(false)}>Signup</Link>
            <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
          </>
        ) : (
          <div ref={dropdownRef} className="nav-user-dropdown">
            <button onClick={() => setOpen(s => !s)} className="nav-user-btn">{user.name || user.email || 'User'}</button>
            {open && (
              <div className="nav-dropdown-menu">
                <div className="nav-dropdown-name">{user.name || '—'}</div>
                <div className="nav-dropdown-email">{user.email}</div>
                <div className="nav-dropdown-actions">
                  <button onClick={handleLogout} className="nav-logout-btn">Logout</button>
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
// updated 2