import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../api/productApi';
import { addToCart } from '../api/cartApi';
import ProductModal from '../components/ProductModal';
import './Home.css';
import './Products.css';

const Home = () => {
  const [popular, setPopular] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [modalProduct, setModalProduct] = useState(null);
  const [addedFeedback, setAddedFeedback] = useState({});

  const updateQuantity = (productId, delta) => {
    setQuantities(prev => {
      const current = prev[productId] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [productId]: next };
    });
  };

  const handleAddToCart = async (product, qtyParam) => {
    const qty = typeof qtyParam === 'number' ? qtyParam : (quantities[product._id] || 1);
    try {
      await addToCart(product._id, qty);
      setAddedFeedback(prev => ({ ...prev, [product._id]: true }));
      setTimeout(() => {
        setAddedFeedback(prev => {
          const next = { ...prev };
          delete next[product._id];
          return next;
        });
      }, 1000);
    } catch (err) {
      console.error(err);
      window.alert('Error adding item to cart');
    }
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const products = await getProducts();
        if (products && Array.isArray(products)) {
          // 1. Top 3 Popular (Random selection for now)
          const shuffled = [...products].sort(() => 0.5 - Math.random());
          setPopular(shuffled.slice(0, 3));

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
      </div>

      <div className="product-meta">
        <div className="product-body">
          <h3 className="product-title">{p.name}</h3>
          <p className="product-desc">{p.description ? p.description.slice(0, 140) : '—'}</p>
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
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => handleAddToCart(p)}>Add</button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );

  return (
    <>
      {/* Hero Section */}
      <div className="home-hero">
        <div className="home-hero-content">
          <h1>Welcome to E-Shop</h1>
          <p>Your premium destination for quality products and seamless shopping experience</p>
          <div className="home-cta-buttons">
            <Link to="/products">Show Products</Link>
          </div>
        </div>
      </div>

      <div className="home-container">
      {/* Popular Products (Random 3) */}
      <section className="home-section">
        <h2>Popular This Month</h2>
        {loading ? <div className="home-loading">Loading...</div> : (
          <div className="home-products-grid">
            {popular.map(p => <ProductCard key={p._id} product={p} />)}
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
            setModalProduct(null);
          }}
        />
      )}
    </>
  );
};

export default Home;
