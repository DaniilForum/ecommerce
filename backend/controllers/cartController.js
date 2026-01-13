// Controller for Cart
const Cart = require('../models/Cart');

// Add item to cart (or adjust quantity). Accepts positive or negative quantity.
exports.addToCart = async (req, res) => {
    const { productId, quantity } = req.body;
    const qty = Number(quantity) || 0;
    if (!productId || qty === 0) return res.status(400).json({ message: 'productId and non-zero quantity required' });

    try {
        let cart = await Cart.findOne({ userId: req.user.id });
        if (cart) {
            const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId.toString());
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += qty;
                if (cart.items[itemIndex].quantity <= 0) {
                    cart.items.splice(itemIndex, 1);
                }
            } else {
                if (qty > 0) cart.items.push({ productId, quantity: qty });
            }
            await cart.save();
        } else {
            if (qty <= 0) return res.status(400).json({ message: 'Cannot reduce non-existing cart item' });
            const newCart = new Cart({ userId: req.user.id, items: [{ productId, quantity: qty }] });
            cart = await newCart.save();
        }
        res.status(200).json({ message: 'Cart updated', cart });
    } catch (error) {
        res.status(500).json({ message: 'Error adding item to cart', error: error.message });
    }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
    const { productId } = req.body;
    try {
        const cart = await Cart.findOne({ userId: req.user.id });
        if (cart) {
            cart.items = cart.items.filter(item => item.productId.toString() !== productId.toString());
            await cart.save();
            res.status(200).json({ message: 'Item removed from cart', cart });
        } else {
            res.status(404).json({ message: 'Cart not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error removing item from cart', error: error.message });
    }
};

// View cart
exports.viewCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
        if (cart) {
            res.status(200).json(cart);
        } else {
            res.status(200).json({ userId: req.user.id, items: [] });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving cart', error: error.message });
    }
};