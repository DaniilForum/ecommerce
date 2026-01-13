import React, { useState } from 'react';
import './CheckoutModal.css';

const CheckoutModal = ({ onClose, onSuccess, total, isBlocked }) => {
    const [paymentForm, setPaymentForm] = useState({
        cardNumber: '',
        expiry: '',
        cvv: '',
        email: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === 'cardNumber') {
            const digits = value.replace(/\D/g, '').slice(0, 16);
            formattedValue = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
        } else if (name === 'expiry') {
            const digits = value.replace(/\D/g, '').slice(0, 4);
            if (digits.length >= 3) {
                formattedValue = `${digits.slice(0, 2)}/${digits.slice(2)}`;
            } else {
                formattedValue = digits;
            }
        } else if (name === 'cvv') {
            formattedValue = value.replace(/\D/g, '').slice(0, 3);
        }

        setPaymentForm(prev => ({ ...prev, [name]: formattedValue }));
    };

    const validateForm = () => {
        const errs = {};
        const cc = paymentForm.cardNumber.replace(/\s+/g, '');
        if (cc.length !== 16) errs.cardNumber = 'Enter a valid card number (16 digits)';
        if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(paymentForm.expiry)) errs.expiry = 'Expiry must be MM/YY';
        if (paymentForm.cvv.length !== 3) errs.cvv = 'CVV must be 3 digits';
        if (paymentForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paymentForm.email)) errs.email = 'Enter a valid email';
        setFormErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isBlocked) {
            setFormErrors({ submit: 'Your account is blocked. Checkout is not allowed.' });
            return;
        }
        if (submitting) return;
        if (!validateForm()) return;
        setSubmitting(true);
        try {
            // Simulate payment processing
            await new Promise(res => setTimeout(res, 900));
            onSuccess();
        } catch (err) {
            setFormErrors({ submit: 'Payment failed. Try again.' });
            setSubmitting(false);
        }
    };

    return (
        <div className="checkout-modal-overlay" onClick={onClose}>
            <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
                <h3>Checkout</h3>
                <form onSubmit={handleSubmit} className="checkout-form">
                    <label>Card number
                        <input name="cardNumber" value={paymentForm.cardNumber} onChange={handleInputChange} placeholder="1234 5678 9012 3456" />
                        {formErrors.cardNumber && <div className="field-error">{formErrors.cardNumber}</div>}
                    </label>
                    <div className="row">
                        <label>Expiry
                            <input name="expiry" value={paymentForm.expiry} onChange={handleInputChange} placeholder="MM/YY" />
                            {formErrors.expiry && <div className="field-error">{formErrors.expiry}</div>}
                        </label>
                        <label>CVV
                            <input name="cvv" value={paymentForm.cvv} onChange={handleInputChange} placeholder="123" />
                            {formErrors.cvv && <div className="field-error">{formErrors.cvv}</div>}
                        </label>
                    </div>
                    <label>Email (optional)
                        <input name="email" value={paymentForm.email} onChange={handleInputChange} placeholder="your@email.com" />
                        {formErrors.email && <div className="field-error">{formErrors.email}</div>}
                    </label>
                    {formErrors.submit && <div className="field-error">{formErrors.submit}</div>}
                    <div className="modal-actions">
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit" disabled={submitting}>{submitting ? 'Processing...' : `Pay $${total.toFixed(2)}`}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CheckoutModal;