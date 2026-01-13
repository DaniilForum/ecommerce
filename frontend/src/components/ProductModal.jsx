import React, { useEffect, useRef, useState } from 'react';
import './ProductModal.css';

const ProductModal = ({ product, onClose, onAdd }) => {
    const overlayRef = useRef();
    const [qty, setQty] = useState(1);
    const [showFeedback, setShowFeedback] = useState(false);

    // Close modal on Escape key press
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    useEffect(() => setQty(1), [product]);

    if (!product) return null;

    const decrease = () => setQty(q => Math.max(1, q - 1));
    const increase = () => setQty(q => q + 1);

    // Handle add button click with feedback animation
    const handleAdd = () => {
        onAdd(product, qty);
        setShowFeedback(true);
        setTimeout(() => setShowFeedback(false), 1000);
    };

    return (
        <div className="pm-overlay" ref={overlayRef} onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
        <div className="pm-panel">
            <button className="pm-close" onClick={onClose}>×</button>

            <div className="pm-content">
            <div className="pm-left">
                {product.image ? (
                <img src={product.image} alt={product.name} />
                ) : (
                <div className="pm-placeholder" />
                )}
            </div>

            <div className="pm-right">
                <h2 className="pm-title">{product.name} {product.topSelling && <span className="pm-pill">Top</span>}</h2>
                {product.offer && <div className="pm-offer">{product.offer}</div>}
                <div className="rating pm-rating">
                    <span className="stars">{[0,1,2,3,4].map(i => (
                        <span key={i} className={i < Math.round(product.rating || 0) ? 'star filled' : 'star'}>★</span>
                    ))}</span>
                    <span className="rating-num">{(product.rating || 0).toFixed(1)}</span>
                </div>
                <p className="pm-desc">{product.description || '—'}</p>
                <div className="pm-stock">Stock: <strong>{product.stock ?? 0}</strong></div>

                <div className="pm-actions">
                    <div className="pm-qty">
                        <button onClick={decrease}>&lt;</button>
                        <span className="pm-qty-val">{qty}</span>
                        <button onClick={increase}>&gt;</button>
                    </div>
                    <div className="pm-add-wrapper">
                        <button className="pm-add" onClick={handleAdd}>Add</button>
                        {showFeedback && (
                            <span className="pm-added-msg">Added!</span>
                        )}
                    </div>
                </div>
            </div>
            </div>
        </div>
        </div>
    );
};

export default ProductModal;
