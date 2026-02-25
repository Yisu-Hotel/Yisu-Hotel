const express = require('express');
const router = express.Router();
const couponController = require('../../controllers/mobile/coupon');
const authMiddleware = require('../../middlewares/mobile/auth');

// 获取优惠券列表
router.get('/list', authMiddleware, couponController.getCouponList);

// 领取优惠券
router.post('/receive', authMiddleware, couponController.receiveCoupon);

// 使用优惠券
router.post('/use', authMiddleware, couponController.useCoupon);

// 测试优惠券流程 (开发环境使用)
router.get('/test-flow', couponController.testCouponFlow);

module.exports = router;
