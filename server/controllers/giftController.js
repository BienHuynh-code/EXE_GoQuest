const Gift = require('../models/Gift');
const User = require('../models/User');
const Task = require('../models/Task');
const VerificationCode = require('../models/VerificationCode');

// @desc    Get all gifts
// @route   GET /api/gifts
exports.getGifts = async (req, res) => {
    try {
        const gifts = await Gift.find({ isActive: true }).sort({ pointsRequired: 1 });
        res.json(gifts);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi lấy danh sách quà tặng' });
    }
};

// @desc    Redeem a gift
// @route   POST /api/gifts/:id/redeem
exports.redeemGift = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) return res.status(400).json({ message: 'Vui lòng nhập mã xác nhận từ nhân viên' });

        const gift = await Gift.findById(req.params.id);
        if (!gift || !gift.isActive) return res.status(404).json({ message: 'Không tìm thấy quà tặng' });

        if (gift.stock === 0) return res.status(400).json({ message: 'Quà tặng này đã hết hàng' });

        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

        const totalPts = await user.calculatePoints();

        if (totalPts < gift.pointsRequired) {
            return res.status(400).json({ 
                message: `Bạn không đủ điểm. Cần ${gift.pointsRequired} điểm, bạn đang có ${totalPts} điểm.` 
            });
        }

        // Validate verification code
        const validCode = await VerificationCode.findOne({ 
            code, 
            expiresAt: { $gt: new Date() } 
        });
        if (!validCode) {
            return res.status(400).json({ message: 'Mã xác nhận không đúng hoặc đã hết hạn. Vui lòng liên hệ nhân viên.' });
        }

        // Deduct stock if limited
        if (gift.stock > 0) {
            gift.stock = gift.stock - 1;
            await gift.save();
        }

        // Record redemption
        if (!user.redeemedGifts) user.redeemedGifts = [];
        user.redeemedGifts.push({
            giftId: gift._id,
            giftTitle: gift.title,
            pointsSpent: gift.pointsRequired,
            redeemedAt: new Date()
        });
        await user.save();

        res.json({ 
            message: `🎁 Chúc mừng! Bạn đã đổi thành công "${gift.title}"!`,
            pointsSpent: gift.pointsRequired,
            remainingPoints: totalPts - gift.pointsRequired
        });
    } catch (err) {
        console.error('Redeem gift error:', err);
        res.status(500).json({ message: 'Lỗi đổi quà tặng' });
    }
};

// @desc    Create gift (admin only)
// @route   POST /api/gifts
exports.createGift = async (req, res) => {
    try {
        const { title, description, pointsRequired, img, icon, stock } = req.body;
        
        // Validation
        if (!title || !pointsRequired) {
            return res.status(400).json({ message: 'Tiêu đề và số điểm là bắt buộc' });
        }

        const gift = new Gift({ title, description, pointsRequired, img, icon, stock });
        await gift.save();
        res.status(201).json(gift);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi tạo quà tặng' });
    }
};

// @desc    Update gift (admin only)
// @route   PUT /api/gifts/:id
exports.updateGift = async (req, res) => {
    try {
        const gift = await Gift.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!gift) return res.status(404).json({ message: 'Không tìm thấy quà tặng' });
        res.json(gift);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi cập nhật quà tặng' });
    }
};

// @desc    Delete gift (admin only) - soft delete
// @route   DELETE /api/gifts/:id
exports.deleteGift = async (req, res) => {
    try {
        const gift = await Gift.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!gift) return res.status(404).json({ message: 'Không tìm thấy quà tặng' });
        res.json({ message: 'Đã xóa quà tặng thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi xóa quà tặng' });
    }
};
