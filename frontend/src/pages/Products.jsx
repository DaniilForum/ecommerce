import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getProducts } from '../api/productApi';
import { getCategories } from '../api/adminApi';
import { addToCart } from '../api/cartApi';
import ProductModal from '../components/ProductModal';
import './Products.css';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantities, setQuantities] = useState({});
    const [categories, setCategories] = useState([]);
    const [selectedCats, setSelectedCats] = useState({});
    const [modalProduct, setModalProduct] = useState(null);
    const [addedFeedback, setAddedFeedback] = useState({});
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search') || '';

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

    const toggleCategory = (id) => {
        setSelectedCats(prev => {
            const copy = { ...prev };
            if (copy[id]) delete copy[id]; else copy[id] = true;
            return copy;
        });
    };

    const updateQuantity = (productId, delta) => {
        setQuantities(prev => {
            const current = prev[productId] || 1;
            const next = Math.max(1, current + delta);
            return { ...prev, [productId]: next };
        });
    };

    // Handle adding to cart with auth check
    const handleAddToCart = async (product, qtyParam) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/login');
            return;
        }
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

    if (loading) return <div className="products-loading">Loading products...</div>;
    if (error) return <div className="products-error">Error: {error}</div>;

    return (
        <div className="products-page">
            <div className="products-header">
                <h2>Product Catalog</h2>
            </div>

            <div className="products-layout">
                    <aside className="products-sidebar">
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
                        {(products || []).filter(p => {
                            // Filter by selected categories
                            const sel = Object.keys(selectedCats || {});
                            const matchesCategory = sel.length === 0 || sel.includes(String(p.category?._id || p.category || ''));
                            
                            // Filter by search terms (comma separated, OR logic)
                            // 1. Prepare search terms: split by comma, trim whitespace, remove empty strings
                            const searchTerms = searchQuery 
                                ? searchQuery.toLowerCase().split(',').map(s => s.trim()).filter(s => s.length > 0) 
                                : [];

                            // 2. Check if product matches ANY of the search terms
                            const matchesSearch = searchTerms.length === 0 || searchTerms.some(term => {
                                // Resolve category name (handle both populated object and ID reference)
                                let catName = '';
                                if (p.category && p.category.name) catName = p.category.name;
                                else {
                                    const c = categories.find(c => c._id === (p.category?._id || p.category));
                                    if (c) catName = c.name;
                                }
                                // Check if term exists in Name, Description, or Category Name
                                return (p.name && p.name.toLowerCase().includes(term)) ||
                                    (p.description && p.description.toLowerCase().includes(term)) ||
                                    (catName && catName.toLowerCase().includes(term));
                            });

                            return matchesCategory && matchesSearch;
                        }).map((p) => (
                        <article key={p._id} className="product-card">
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
                                        <div style={{ display: 'flex', gap: 8, position: 'relative' }}>
                                            {addedFeedback[p._id] && (
                                                <span className="product-added-msg">Added!</span>
                                            )}
                                            <button onClick={() => handleAddToCart(p)}>Add</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </article>
                        ))}
                    </div>
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
        </div>
    );
};

export default Products;