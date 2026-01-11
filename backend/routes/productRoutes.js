const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProductById,
} = require('../controllers/productController');

const router = express.Router();

// Admin routes - protected by auth and admin middleware
router.post('/', authMiddleware, adminMiddleware, createProduct);
router.put('/:id', authMiddleware, adminMiddleware, updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProduct);

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

module.exports = router;
