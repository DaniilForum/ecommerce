import React, { useEffect, useState } from 'react';
import { getCart, removeFromCart, addToCart } from '../api/cartApi';
import './Cart.css';

const Cart = () => {
    const [cart, setCart] = useState({ items: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selected, setSelected] = useState(new Set());

    // Fetch cart data from API
    const fetch = async () => {
    setLoading(true);
    try {
        const res = await getCart();
        setCart(res.data || { items: [] });
    } catch (err) {
        setError(err.message || 'Error fetching cart');
    } finally {
        setLoading(false);
    }
    };

    useEffect(() => { fetch(); }, []);

    const handleRemove = async (productId) => {
        try {
        await removeFromCart(productId);
        setSelected(prev => {
            const next = new Set(prev);
            next.delete(productId);
            return next;
        });
        fetch();
        } catch (err) { console.error(err); alert('Error removing item'); }
    };

    const handleIncrease = async (productId) => {
        try {
        await addToCart(productId, 1);
        fetch();
        } catch (err) { console.error(err); alert('Error updating quantity'); }
    };

    const handleDecrease = async (productId) => {
        try {
        await addToCart(productId, -1);
        fetch();
        } catch (err) { console.error(err); alert('Error updating quantity'); }
    };

    const toggleSelect = (id) => {
        const newSet = new Set(selected);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelected(newSet);
    };

    const toggleSelectAll = () => {
        if (selected.size === cart.items.length) setSelected(new Set());
        else setSelected(new Set(cart.items.map(it => (it.productId || {})._id).filter(Boolean)));
    };

    const bulkRemove = async () => {
        if (selected.size === 0) return;
        if (!window.confirm(`Remove ${selected.size} items?`)) return;
        try {
            for (const id of selected) {
                await removeFromCart(id);
            }
            setSelected(new Set());
            fetch();
        } catch (err) { console.error(err); alert('Error removing items'); }
    };

    const bulkUpdate = async (delta) => {
        if (selected.size === 0) return;
        try {
            for (const id of selected) {
                await addToCart(id, delta);
            }
            fetch();
        } catch (err) { console.error(err); alert('Error updating quantities'); }
    };

    // Calculate total price of items in cart
    const total = cart.items.reduce((sum, it) => {
        const p = it.productId || {};
        const price = (p.price || 0);
        const qty = it.quantity || 0;
        return sum + price * qty;
    }, 0);

    if (loading) return <div className="cart-loading">Loading the cart...</div>;
    if (error) return <div className="cart-error">Error: {error}</div>;

    return (
        <div className="cart-page">
        <h2>Your cart:</h2>
        {cart.items.length === 0 ? (
            <div className="cart-empty">Cart is empty</div>
        ) : (
            <div className="cart-list">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px', background: '#fff', borderRadius: '8px', marginBottom: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    <input type="checkbox"
                        checked={cart.items.length > 0 && selected.size === cart.items.length}
                        onChange={toggleSelectAll}
                    />
                    Select All
                </label>
                <div className="ci-controls">
                    <button onClick={() => bulkUpdate(-1)} disabled={selected.size === 0}>-</button>
                    <button onClick={() => bulkUpdate(1)} disabled={selected.size === 0}>+</button>
                    <button className="remove" onClick={bulkRemove} disabled={selected.size === 0}>Remove</button>
                </div>
            </div>
            {cart.items.map(it => {
                const p = it.productId || {};
                return (
                <div className="cart-item" key={p._id || Math.random()}>
                    <div style={{ display: 'flex', alignItems: 'center', paddingRight: '10px' }}><input type="checkbox" checked={selected.has(p._id)} onChange={() => toggleSelect(p._id)} /></div>
                    <div className="ci-media">
                    {p.image ? <img src={p.image} alt={p.name} /> : <div className="ci-placeholder" />}
                    </div>
                    <div className="ci-body">
                    <div className="ci-title">{p.name}</div>
                    <div className="ci-price">${p.price} × {it.quantity}</div>
                    <div className="ci-controls">
                        <button onClick={() => handleDecrease(p._id)}>-</button>
                        <button onClick={() => handleIncrease(p._id)}>+</button>
                        <button className="remove" onClick={() => handleRemove(p._id)}>Remove</button>
                    </div>
                    </div>
                </div>
                );
            })}

            <div className="cart-summary">
                <div>Total:</div>
                <div className="cart-total">${total.toFixed(2)}</div>
            </div>
            </div>
        )}
        </div>
    );
};

export default Cart;
