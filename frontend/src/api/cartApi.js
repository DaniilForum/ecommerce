import api from './axiosConfig';

export const addToCart = (productId, quantity = 1) =>
  api.post('/cart/add', { productId, quantity });

export const removeFromCart = (productId) =>
  api.delete('/cart/remove', { data: { productId } });

export const getCart = () =>
  api.get('/cart');
