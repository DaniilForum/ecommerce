import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProducts } from '../api/productApi';
import { addToCart, getCart } from '../api/cartApi';
import { getProfile } from '../api/authApi';
import ProductModal from '../components/ProductModal';
import ProductCard from '../components/ProductCard';
import './Home.css';
import './Products.css';
import logo from '../assets/eshop_logo.png';

const Home = () => {
  const [popular, setPopular] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [cartItems, setCartItems] = useState({});
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

  // Handles the scrolling logic for the popular products carousel
  const scrollPopular = (direction) => {
    if (popularRef.current) {
      const { current } = popularRef;
      const scrollAmount = 300;
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const updateQuantity = (productId, delta, max = Infinity) => {
    setQuantities(prev => {
      const minQty = max > 0 ? 1 : 0;
      const current = prev[productId] ?? minQty;
      const next = Math.max(minQty, Math.min(max, current + delta));
      return { ...prev, [productId]: next };
    });
  };

  const handleAddToCart = async (product, qtyParam) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const profile = await getProfile();
      if (profile?.data?.isBlocked) {
        setIsBlocked(true);
        window.alert('Your account is blocked. You cannot add items to cart.');
        return;
      }
    } catch (err) {
      console.warn('Failed checking profile', err);
    }

    let currentCartMap = { ...cartItems };
    try {
      const fresh = await getCart();
      if (fresh?.data?.items) {
        const map = {};
        fresh.data.items.forEach(it => {
          const id = it.productId?._id ?? it.productId;
          map[id] = it.quantity;
        });
        currentCartMap = map;
        setCartItems(map);
      }
    } catch (err) {
      // ignore fetch error and fall back to local state
      console.warn('Failed to refresh cart before validation', err);
    }

    const inCart = currentCartMap[product._id] || 0;
    const maxAvailable = Math.max(0, (product.stock || 0) - inCart);
    const qty = typeof qtyParam === 'number' ? qtyParam : (quantities[product._id] ?? (maxAvailable > 0 ? 1 : 0));

    if (qty <= 0) {
      window.alert('No more items available to add.');
      return;
    }

    if (qty > maxAvailable) {
      window.alert(`Cannot add ${qty} items. Only ${maxAvailable} available (considering items already in cart).`);
      return;
    }
    try {
      await addToCart(product._id, qty);
      setAddedFeedback(prev => ({ ...prev, [product._id]: true }));
      // Remove feedback message after 1 second
      // refresh cart counts after successful add
      try {
        const cart = await getCart();
        if (cart?.data?.items) {
          const map = {};
          cart.data.items.forEach(it => {
            const id = it.productId?._id ?? it.productId;
            map[id] = it.quantity;
          });
          setCartItems(map);
          // update display quantity for this product based on new availability
          const newInCart = map[product._id] || 0;
          const newMax = Math.max(0, (product.stock || 0) - newInCart);
          setQuantities(prev => ({
            ...prev,
            [product._id]: newMax > 0 ? Math.min(prev[product._id] ?? 1, newMax) : 0
          }));
        }
      } catch (err) {
        console.warn('Failed to refresh cart', err);
      }
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
          // 1. Top Selling (Carousel) — exclude out-of-stock
          const topSelling = products.filter(p => p.topSelling && ((p.stock ?? 0) > 0));
          setPopular(topSelling);

          // 2. New Arrivals (Top 5 by updatedAt) — exclude out-of-stock
          const available = products.filter(p => (p.stock ?? 0) > 0);
          const sortedByDate = [...available].sort((a, b) => {
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
    // also fetch cart contents (products and amount in cart)
    const fetchCart = async () => {
      try {
        const cart = await getCart();
        if (cart?.data?.items) {
          const map = {};
          cart.data.items.forEach(it => {
            const id = it.productId?._id ?? it.productId;
            map[id] = it.quantity;
          });
          setCartItems(map);
        }
      } catch (err) {
        console.warn('Failed to fetch cart', err);
      }
    };
    fetchCart();
  }, []);

  

  // Checks if the user is blocked on component mount
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
          <img src={logo} alt="E-Shop Logo" className="home-logo" />
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
                  <ProductCard
                    product={p}
                    quantities={quantities}
                    updateQuantity={updateQuantity}
                    cartItems={cartItems}
                    addedFeedback={addedFeedback}
                    isBlocked={isBlocked}
                    onAdd={handleAddToCart}
                    onDetails={(prod) => setModalProduct(prod)}
                  />
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
            {newArrivals.map(p => (
              <ProductCard
                key={p._id}
                product={p}
                quantities={quantities}
                updateQuantity={updateQuantity}
                cartItems={cartItems}
                addedFeedback={addedFeedback}
                isBlocked={isBlocked}
                onAdd={handleAddToCart}
                onDetails={(prod) => setModalProduct(prod)}
              />
            ))}
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

      {modalProduct && (() => {
        const inCart = cartItems[modalProduct._id] || 0;
        const maxAvailable = Math.max(0, (modalProduct.stock || 0) - inCart);
        return (
          <ProductModal
            product={modalProduct}
            cartQty={inCart}
            maxAvailable={maxAvailable}
            onClose={() => setModalProduct(null)}
            onAdd={async (product, qty) => {
              await handleAddToCart({ ...product, _id: product._id }, qty);
            }}
          />
        );
      })()}
    </>
  );
};

export default Home;
