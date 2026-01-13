const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const {
  getAllUsers,
  deleteUser,
  blockUser,
  unblockUser,
} = require('../controllers/userController');

const router = express.Router();

// Admin routes - protected by auth and admin middleware
router.get('/users', authMiddleware, adminMiddleware, getAllUsers);
router.delete('/users/:id', authMiddleware, adminMiddleware, deleteUser);
router.put('/users/:id/block', authMiddleware, adminMiddleware, blockUser);
router.put('/users/:id/unblock', authMiddleware, adminMiddleware, unblockUser);

module.exports = router;
