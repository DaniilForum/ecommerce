import React, { useEffect, useState } from 'react';
import { getCart, removeFromCart, addToCart } from '../api/cartApi';
import './Cart.css';

const Cart = () => {
    const [cart, setCart] = useState({ items: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
            {cart.items.map(it => {
                const p = it.productId || {};
                return (
                <div className="cart-item" key={p._id || Math.random()}>
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
