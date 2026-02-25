const express = require('express');
const router = express.Router();
const promotionController = require('../../controllers/mobile/promotion');
const authMiddleware = require('../../middlewares/mobile/auth');

// 获取新人优惠
router.get('/new-user', authMiddleware, promotionController.getNewUserPromotion);

// 获取优惠券列表
router.get('/list', authMiddleware, promotionController.getPromotionList);

module.exports = router;
