import React from 'react';
import './ProductCard.css';

const ProductCard = ({
    product,
    quantities = {},
    updateQuantity = () => {},
    cartItems = {},
    addedFeedback = {},
    isBlocked = false,
    onAdd = () => {},
    onDetails = () => {}
    }) => {
    const p = product || {};
    const inCart = cartItems[p._id] || 0;
    const maxAvailable = Math.max(0, (p.stock || 0) - inCart);
    const displayQty = quantities[p._id] ?? (maxAvailable > 0 ? 1 : 0);

    return (
        <article className="product-card">
        <div className="product-media">
            {p.image ? (
            <img src={p.image} alt={p.name} className="product-image" />
            ) : (
            <div className="product-placeholder" />
            )}
            {(() => {
            const stockBadge = p.stock === 0 ? 'out' : (p.stock > 0 && p.stock <= 5 ? 'low' : null);
            if (stockBadge === 'out') return <span className="badge out">Out</span>;
            if (stockBadge === 'low') return <span className="badge low">Low</span>;
            if (p.topSelling) return <span className="badge top">Top</span>;
            return null;
            })()}
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

            <div className="product-footer product-footer-col">
            <div className="product-footer-row">
                <div className="price">${p.price}</div>
                <button onClick={() => onDetails(p)}>Details</button>
            </div>
            <div className="product-footer-row">
                                <div className="prod-qty-selector">
                                        <button
                                            className="prod-qty-btn"
                                            onClick={() => updateQuantity(p._id, -1, maxAvailable)}
                                            disabled={displayQty <= (maxAvailable > 0 ? 1 : 0)}
                                        >&lt;</button>

                                        <input
                                            type="number"
                                            className="prod-qty-input"
                                            value={displayQty}
                                            min={maxAvailable > 0 ? 1 : 0}
                                            max={maxAvailable}
                                            onChange={(e) => {
                                                const raw = parseInt(e.target.value || '0', 10);
                                                const min = maxAvailable > 0 ? 1 : 0;
                                                let next = Number.isNaN(raw) ? min : raw;
                                                if (next > maxAvailable) next = maxAvailable;
                                                if (next < min) next = min;
                                                const current = quantities[p._id] ?? min;
                                                updateQuantity(p._id, next - current, maxAvailable);
                                            }}
                                        />

                                        <button
                                            className="prod-qty-btn"
                                            onClick={() => updateQuantity(p._id, 1, maxAvailable)}
                                            disabled={displayQty >= maxAvailable}
                                        >&gt;</button>
                                </div>
                <div className="product-add-wrapper">
                {addedFeedback[p._id] && (
                    <span className="product-added-msg">Added!</span>
                )}
                {(() => {
                    const disabled = isBlocked || maxAvailable <= 0;
                    const title = isBlocked ? 'Your account is blocked' : (maxAvailable <= 0 ? 'No more stock available' : '');
                    const qtyToUse = quantities[p._id] ?? (maxAvailable > 0 ? 1 : 0);
                    return (
                    <button onClick={() => onAdd(p, qtyToUse)} disabled={disabled} title={title}>Add</button>
                    );
                })()}
                </div>
            </div>
            </div>
        </div>
        </article>
    );
};

export default ProductCard;
