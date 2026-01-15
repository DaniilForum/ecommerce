import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getProducts } from '../api/productApi';
import { getCategories } from '../api/adminApi';
import { addToCart, getCart } from '../api/cartApi';
import { getProfile } from '../api/authApi';
import ProductModal from '../components/ProductModal';
import ProductCard from '../components/ProductCard';
import './Products.css';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantities, setQuantities] = useState({});
    const [cartItems, setCartItems] = useState({});
    const [categories, setCategories] = useState([]);
    const [selectedCats, setSelectedCats] = useState({});
    const [modalProduct, setModalProduct] = useState(null);
    const [addedFeedback, setAddedFeedback] = useState({});
    const [isBlocked, setIsBlocked] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search') || '';
    // Filter & Sort states
    const [sortBy, setSortBy] = useState('default');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [minRating, setMinRating] = useState(0);

    // Fetch products and categories on component mount
    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await getProducts();
                setProducts(data);
            } catch (err) {
                setError(err.message || 'Error fetching products');
                // fetch categories for filter
                try {
                    const cats = await getCategories();
                    // Sort categories alphabetically
                    const list = (cats.data || []).slice().sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                    setCategories(list);
                } catch (err) {
                    console.warn('Failed fetching categories', err);
                }
            }

            try {
                const cats = await getCategories();
                // Sort categories alphabetically
                const list = (cats.data || []).slice().sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                setCategories(list);
            } catch (err) {
                console.warn('Failed fetching categories', err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    // Category filter changer
    const toggleCategory = (id) => {
        setSelectedCats(prev => {
            const copy = { ...prev };
            if (copy[id]) delete copy[id]; else copy[id] = true;
            return copy;
        });
    };

    const updateQuantity = (productId, delta, max = Infinity) => {
        setQuantities(prev => {
            const minQty = max > 0 ? 1 : 0;
            const current = prev[productId] ?? minQty;
            const next = Math.max(minQty, Math.min(max, current + delta));
            return { ...prev, [productId]: next };
        });
    };

    // Handle adding to cart with auth and block check
    const handleAddToCart = async (product, qtyParam) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/login');
            return;
        }
        // check blocked status
        try {
            const profile = await getProfile();
            const blocked = profile?.data?.isBlocked;
            if (blocked) {
                window.alert('Your account is blocked. You cannot add items to cart.');
                setIsBlocked(true);
                return;
            }
        } catch (err) {
            console.warn('Failed checking profile', err);
        }

        // refresh cart from server to avoid stale counts
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
            // refresh cart
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
            } catch (err) { console.warn('Failed to refresh cart', err); }
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

    // Filter & Sort Logic
    const filteredProducts = (products || []).filter(p => {
        // 1. Category Filter
        const sel = Object.keys(selectedCats || {});
        const matchesCategory = sel.length === 0 || sel.includes(String(p.category?._id || p.category || ''));
        
        // 2. Search Filter
        const searchTerms = searchQuery 
            ? searchQuery.toLowerCase().split(',').map(s => s.trim()).filter(s => s.length > 0) 
            : [];
        const matchesSearch = searchTerms.length === 0 || searchTerms.some(term => {
            let catName = '';
            if (p.category && p.category.name) catName = p.category.name;
            else {
                const c = categories.find(c => c._id === (p.category?._id || p.category));
                if (c) catName = c.name;
            }
            return (p.name && p.name.toLowerCase().includes(term)) ||
                (p.description && p.description.toLowerCase().includes(term)) ||
                (catName && catName.toLowerCase().includes(term));
        });

        // 3. Price Range Filter
        const matchesMinPrice = minPrice === '' || p.price >= Number(minPrice);
        const matchesMaxPrice = maxPrice === '' || p.price <= Number(maxPrice);

        // 4. Rating Filter
        const matchesRating = !minRating || (p.rating || 0) >= minRating;

        return matchesCategory && matchesSearch && matchesMinPrice && matchesMaxPrice && matchesRating;
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortBy === 'priceLow') return a.price - b.price;
        if (sortBy === 'priceHigh') return b.price - a.price;
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'newest') return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
        return 0;
    });

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) return setIsBlocked(false);
            try {
                const profile = await getProfile();
                setIsBlocked(!!profile?.data?.isBlocked);
            } catch (err) {
                console.warn('Failed to get profile', err);
            }
        };
        fetchProfile();
        // fetch cart
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

    if (loading) return <div className="products-loading">Loading products...</div>;
    if (error) return <div className="products-error">Error: {error}</div>;

    return (
        <div className="products-page">
            {isBlocked && <div className="products-blocked-notice">Your account is blocked. Adding to cart is disabled.</div>}

            <div className="products-header">
                <h2>Product Catalog</h2>
            </div>

            <div className="products-layout">
                    <aside className="products-sidebar">
                        <div className="filter-group">
                            <h4>Sort By</h4>
                            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="filter-select">
                                <option value="default">Default</option>
                                <option value="priceLow">Price: Low to High</option>
                                <option value="priceHigh">Price: High to Low</option>
                                <option value="rating">Top Rated</option>
                                <option value="newest">Newest Arrivals</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <h4>Price Range</h4>
                            <div className="price-inputs">
                                <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} min="0" />
                                <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} min="0" />
                            </div>
                        </div>

                        <div className="filter-group">
                            <h4>Min Rating</h4>
                            <select value={minRating} onChange={e => setMinRating(Number(e.target.value))} className="filter-select">
                                <option value={0}>Any Rating</option>
                                <option value={4}>4 Stars & Up</option>
                                <option value={3}>3 Stars & Up</option>
                                <option value={2}>2 Stars & Up</option>
                            </select>
                        </div>

                        <h4>Categories</h4>
                        <div className="cats-list">
                            {categories.map(c => (
                                <label key={c._id} className="cat-row">
                                    <input type="checkbox" checked={!!selectedCats[c._id]} onChange={() => toggleCategory(c._id)} />
                                    <span>{c.name}</span>
                                </label>
                            ))}
                        </div>
                    </aside>

                    <div className="products-grid">
                        {sortedProducts.map((p) => (
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
            ); })()}
        </div>
    );
};

export default Products;