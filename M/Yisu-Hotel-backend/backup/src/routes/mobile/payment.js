const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/mobile/payment');
const authMiddleware = require('../../middlewares/mobile/auth');

// 创建支付订单
router.post('/create', authMiddleware, paymentController.createPayment);

// 发起支付
router.post('/pay', authMiddleware, paymentController.initiatePayment);

// 查询支付状态
router.get('/status/:order_id', authMiddleware, paymentController.queryPaymentStatus);

// 处理支付回调
router.post('/callback', paymentController.handlePaymentCallback);

// 获取可用支付方式
router.get('/methods', paymentController.getPaymentMethods);

module.exports = router;
