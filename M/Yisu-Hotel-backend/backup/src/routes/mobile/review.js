const express = require('express');
const router = express.Router();
const reviewController = require('../../controllers/mobile/review');
const authMiddleware = require('../../middlewares/mobile/auth');

// 获取酒店评价列表
router.get('/hotel/:hotel_id', reviewController.getHotelReviews);

// 提交酒店评价
router.post('/submit', authMiddleware, reviewController.submitHotelReview);

// 获取用户评价列表
router.get('/user', authMiddleware, reviewController.getUserReviews);

module.exports = router;