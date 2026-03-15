const express = require('express');
const router = express.Router();
const { getGifts, redeemGift, createGift, updateGift, deleteGift } = require('../controllers/giftController');
const { authMiddleware, authorize } = require('../middleware/auth');

// GET all gifts (public for users to see)
router.get('/', getGifts);

// POST redeem a gift (authenticated user)
router.post('/:id/redeem', authMiddleware, redeemGift);

// POST create gift (admin only)
router.post('/', authMiddleware, authorize('admin'), createGift);

// PUT update gift (admin only)
router.put('/:id', authMiddleware, authorize('admin'), updateGift);

// DELETE gift (admin only) - soft delete
router.delete('/:id', authMiddleware, authorize('admin'), deleteGift);

module.exports = router;


