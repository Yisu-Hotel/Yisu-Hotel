const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/mobile/payment');
const authMiddleware = require('../../middlewares/mobile/auth');

// 错误处理函数
const handleError = (res, error, logLabel) => {
  if (error && error.code) {
    return res.status(error.httpStatus || 400).json({
      code: error.code,
      msg: error.message,
      data: null
    });
  }
  console.error(logLabel, error);
  return res.status(500).json({
    code: 500,
    msg: '服务器错误',
    data: null
  });
};

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

// 兼容前端API请求路径 - 获取支付信息
router.get('/:booking_id/info', authMiddleware, (req, res) => {
  try {
    const { booking_id } = req.params;
    const { user_id } = req.user || { user_id: 'test_user' };
    
    // 返回模拟的支付信息，与前端预期一致
    return res.json({
      code: 0,
      msg: '查询成功',
      data: {
        orderTitle: '酒店预订',
        totalAmount: 299.00,
        discount: '立减2-30元',
        paymentMethods: [
          {
            id: 'alipay',
            name: '支付宝',
            icon: 'https://img.icons8.com/color/96/alipay.png',
            checked: false
          },
          {
            id: 'wechat',
            name: '微信支付',
            icon: 'https://img.icons8.com/color/96/wechat-pay.png',
            checked: false
          }
        ],
        financialServices: []
      }
    });
  } catch (error) {
    return handleError(res, error, 'Get payment info error:');
  }
});

// 兼容前端API请求路径 - 选择支付方式
router.post('/:booking_id/select-method', authMiddleware, (req, res) => {
  try {
    return res.json({
      code: 0,
      msg: '选择支付方式成功',
      data: {
        success: true
      }
    });
  } catch (error) {
    return handleError(res, error, 'Select payment method error:');
  }
});

// 兼容前端API请求路径 - 创建支付订单
router.post('/:booking_id/create', authMiddleware, (req, res) => {
  try {
    const { booking_id } = req.params;
    const { payment_method } = req.body;
    const { user_id } = req.user || { user_id: 'test_user' };
    
    // 模拟创建支付订单
    const order_id = `PAY${Date.now()}`;
    
    return res.json({
      code: 0,
      msg: '创建支付订单成功',
      data: {
        order_id,
        payUrl: `/mobile/payment/pay?order_id=${order_id}&payment_method=${payment_method}`,
        amount: 299.00
      }
    });
  } catch (error) {
    return handleError(res, error, 'Create payment order error:');
  }
});

module.exports = router;
