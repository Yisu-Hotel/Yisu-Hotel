const { createPaymentService, initiatePaymentService, queryPaymentStatusService, handlePaymentCallbackService, getPaymentMethodsService } = require('../../services/mobile/payment');

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
exports.createPayment = async (req, res) => {
  try {
    const { user_id } = req.user || { user_id: 'test_user' }; // 临时添加测试用户ID
    const data = await createPaymentService(user_id, req.body);
    return res.json({ code: 0, msg: '支付订单创建成功', data });
  } catch (error) {
    return handleError(res, error, 'Create payment error:');
  }
};

// 发起支付
exports.initiatePayment = async (req, res) => {
  try {
    const { user_id } = req.user || { user_id: 'test_user' }; // 临时添加测试用户ID
    const data = await initiatePaymentService(user_id, req.body);
    return res.json({ code: 0, msg: '支付发起成功', data });
  } catch (error) {
    return handleError(res, error, 'Initiate payment error:');
  }
};

// 查询支付状态
exports.queryPaymentStatus = async (req, res) => {
  try {
    const { user_id } = req.user || { user_id: 'test_user' }; // 临时添加测试用户ID
    const { order_id } = req.params;
    const data = await queryPaymentStatusService(user_id, order_id);
    return res.json({ code: 0, msg: '查询成功', data });
  } catch (error) {
    return handleError(res, error, 'Query payment status error:');
  }
};

// 处理支付回调
exports.handlePaymentCallback = async (req, res) => {
  try {
    const data = await handlePaymentCallbackService(req.body);
    return res.json({ code: 0, msg: '回调处理成功', data });
  } catch (error) {
    return handleError(res, error, 'Handle payment callback error:');
  }
};

// 获取可用支付方式
exports.getPaymentMethods = async (req, res) => {
  try {
    const data = await getPaymentMethodsService();
    return res.json({ code: 0, msg: '获取成功', data });
  } catch (error) {
    return handleError(res, error, 'Get payment methods error:');
  }
};
