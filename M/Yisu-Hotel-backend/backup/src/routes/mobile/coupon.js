const express = require('express');
const router = express.Router();
const couponController = require('../../controllers/mobile/coupon');
const authMiddleware = require('../../middlewares/mobile/auth');

// 获取优惠券列表
router.get('/list', couponController.getCouponList);

// 领取优惠券
router.post('/receive', authMiddleware, couponController.receiveCoupon);

module.exports = router;
