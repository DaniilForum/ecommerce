import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProducts } from '../api/productApi';
import { addToCart } from '../api/cartApi';
import { getProfile } from '../api/authApi';
import ProductModal from '../components/ProductModal';
import './Home.css';
import './Products.css';
import logo from '../assets/eshop_logo.png';

const Home = () => {
  const [popular, setPopular] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [modalProduct, setModalProduct] = useState(null);
  const [addedFeedback, setAddedFeedback] = useState({});
  const [isBlocked, setIsBlocked] = useState(false);
  const navigate = useNavigate();
  const popularRef = useRef(null);

  // Triplicate items to create a seamless infinite loop illusion
  // Set 1: Buffer left, Set 2: Main view, Set 3: Buffer right
  const displayPopular = popular.length > 0 ? [...popular, ...popular, ...popular] : [];

  // Initialize scroll position to the start of the middle set
  useEffect(() => {
    if (popular.length > 0 && popularRef.current) {
      const scrollWidth = popularRef.current.scrollWidth;
      const oneSetWidth = scrollWidth / 3;
      popularRef.current.scrollLeft = oneSetWidth;
    }
  }, [popular]);

  const scrollPopular = (direction) => {
    if (popularRef.current) {
      const { current } = popularRef;
      const oneSetWidth = current.scrollWidth / 3;
      const firstItem = current.querySelector('.carousel-item');
      if (!firstItem) return;
      
      // Scroll by one item width + gap (20px)
      const scrollAmount = firstItem.offsetWidth + 20;

      if (direction === 'left') {
        // If near start of middle set, jump to start of last set before scrolling
        if (current.scrollLeft <= oneSetWidth + 10) {
          current.scrollLeft += oneSetWidth;
        }
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        // If near end of middle set, jump to end of first set before scrolling
        if (current.scrollLeft >= 2 * oneSetWidth - 10) {
          current.scrollLeft -= oneSetWidth;
        }
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  // Auto-scroll carousel every 5 seconds
  useEffect(() => {
    if (popular.length === 0) return;
    const interval = setInterval(() => {
      scrollPopular('right');
    }, 5000);
    return () => clearInterval(interval);
  }, [popular]);

  const updateQuantity = (productId, delta) => {
    setQuantities(prev => {
      const current = prev[productId] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [productId]: next };
    });
  };

  // Handle adding product to cart: checks auth and shows feedback
  const handleAddToCart = async (product, qtyParam) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    // check if blocked
    try {
      const profile = await getProfile();
      if (profile?.data?.isBlocked) {
        setIsBlocked(true);
        window.alert('Your account is blocked. You cannot add items to cart.');
        return;
      }
    } catch (err) {
      console.warn('Failed to check profile', err);
    }

    const qty = typeof qtyParam === 'number' ? qtyParam : (quantities[product._id] || 1);
    try {
      await addToCart(product._id, qty);
      setAddedFeedback(prev => ({ ...prev, [product._id]: true }));
      // Remove feedback message after 1 second
      setTimeout(() => {
        setAddedFeedback(prev => {
          const next = { ...prev };
          delete next[product._id];
          return next;
        });
      }, 1000);
    } catch (err) {
      console.error(err);
      if (err?.response?.status === 403) window.alert('Action forbidden: your account is blocked');
      else window.alert('Error adding item to cart');
    }
  };

  // Fetch data for Home page sections (Popular & New Arrivals)
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const products = await getProducts();
        if (products && Array.isArray(products)) {
          // 1. Top Selling (Carousel)
          const topSelling = products.filter(p => p.topSelling);
          setPopular(topSelling);

          // 2. New Arrivals (Top 5 by updatedAt)
          const sortedByDate = [...products].sort((a, b) => {
            return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
          });
          setNewArrivals(sortedByDate.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to load home products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const ProductCard = ({ product: p }) => (
    <article className="product-card">
      <div className="product-media">
        {p.image ? (
          <img src={p.image} alt={p.name} className="product-image" />
        ) : (
          <div className="product-placeholder" />
        )}
        {p.stock === 0 && <span className="badge out">Out</span>}
        {p.stock > 0 && p.stock <= 5 && <span className="badge low">Low</span>}
        {p.topSelling && <span className="badge top">Top</span>}
        {p.offer && <span className="badge offer">{p.offer}</span>}
      </div>

      <div className="product-meta">
        <div className="product-body">
          <h3 className="product-title">{p.name}</h3>
          <div className="rating">
            <span className="stars">{[0,1,2,3,4].map(i => (
                <span key={i} className={i < Math.round(p.rating || 0) ? 'star filled' : 'star'}>★</span>
            ))}</span>
            <span className="rating-num">{(p.rating || 0).toFixed(1)}</span>
          </div>
          <p className="product-desc">{p.description || '—'}</p>
        </div>

        <div className="product-footer" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="price">${p.price}</div>
            <button onClick={() => setModalProduct(p)}>Details</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="prod-qty-selector">
              <button className="prod-qty-btn" onClick={() => updateQuantity(p._id, -1)}>&lt;</button>
              <span className="prod-qty-val">{quantities[p._id] || 1}</span>
              <button className="prod-qty-btn" onClick={() => updateQuantity(p._id, 1)}>&gt;</button>
            </div>
            <div style={{ display: 'flex', gap: 8, position: 'relative' }}>
              {addedFeedback[p._id] && (
                <span className="product-added-msg">Added!</span>
              )}
              <button onClick={() => handleAddToCart(p)} disabled={isBlocked} title={isBlocked ? 'Your account is blocked' : ''}>Add</button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return setIsBlocked(false);
      try {
        const profile = await getProfile();
        setIsBlocked(!!profile?.data?.isBlocked);
      } catch (err) {
        console.warn('Failed to fetch profile', err);
      }
    };
    fetchProfile();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <div className="home-hero">
        <div className="home-hero-content">
          {isBlocked && <div className="home-blocked-notice">Your account is blocked. Adding to cart is disabled.</div>}
          <img src={logo} alt="E-Shop Logo" style={
            { height: '350px', marginTop: '-120px', marginBottom: '-95px' }
            } />
          <h1>Welcome to E-Shop</h1>
          <p>Your premium destination for quality products and seamless shopping experience</p>
          <div className="home-cta-buttons">
            <Link to="/products">Show Products</Link>
          </div>
        </div>
      </div>

      <div className="home-container">
      {/* Popular Products (Carousel) */}
      <section className="home-section">
        <h2>Popular This Month</h2>
        {loading ? <div className="home-loading">Loading...</div> : (
          <div className="carousel-wrapper">
            <button className="carousel-arrow left" onClick={() => scrollPopular('left')}>&lt;</button>
            <div className="carousel-track" ref={popularRef}>
              {displayPopular.map((p, index) => (
                <div key={`${p._id}-${index}`} className="carousel-item">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
            <button className="carousel-arrow right" onClick={() => scrollPopular('right')}>&gt;</button>
          </div>
        )}
      </section>

      {/* New Arrivals (Top 5) */}
      <section className="home-section">
        <h2>New Arrivals</h2>
        {loading ? <div className="home-loading">Loading...</div> : (
          <div className="home-products-grid new-arrivals">
            {newArrivals.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>

      {/* Why Choose Us */}
      <section className="home-section">
        <h2>Why Choose Us?</h2>
        <div className="home-features">
          <div className="home-feature-card">
            <h3>🛍️ Wide Selection</h3>
            <p>Browse through our extensive catalog of products across multiple categories.</p>
          </div>
          <div className="home-feature-card">
            <h3>🔒 Secure Payment</h3>
            <p>Your transactions are protected with industry-leading security standards.</p>
          </div>
          <div className="home-feature-card">
            <h3>⚡ Fast Delivery</h3>
            <p>Quick and reliable shipping to get your orders to you on time.</p>
          </div>
        </div>
      </section>
      </div>

      {modalProduct && (
        <ProductModal
          product={modalProduct}
          onClose={() => setModalProduct(null)}
          onAdd={async (product, qty) => {
            await handleAddToCart({ ...product, _id: product._id }, qty);
          }}
        />
      )}
    </>
  );
};

export default Home;
