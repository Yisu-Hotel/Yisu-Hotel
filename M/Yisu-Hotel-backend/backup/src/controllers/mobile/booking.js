const { createBookingService, getBookingListService, getBookingDetailService, cancelBookingService, payBookingService } = require('../../services/mobile/booking');

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

// 创建预订
exports.createBooking = async (req, res) => {
  try {
    const { user_id } = req.user || { user_id: 'test_user' }; // 临时添加测试用户ID
    const { hotel_id, room_type_id, check_in_date, check_out_date, contact_name, contact_phone, special_requests } = req.body;
    
    // 转换参数格式以匹配service层的期望
    const bookingData = {
      hotel_id,
      room_type_id,
      check_in_date: check_in_date || req.body.check_in,
      check_out_date: check_out_date || req.body.check_out,
      contact_name: contact_name || req.body.contact_info?.name || '',
      contact_phone: contact_phone || req.body.contact_info?.phone || '',
      special_requests: special_requests || req.body.special_requests || ''
    };
    
    const data = await createBookingService(user_id, bookingData);
    return res.json({ code: 0, msg: '预订成功', data });
  } catch (error) {
    return handleError(res, error, 'Create booking error:');
  }
};

// 获取预订列表
exports.getBookingList = async (req, res) => {
  try {
    const { user_id } = req.user || { user_id: 'test_user' }; // 临时添加测试用户ID
    const data = await getBookingListService(user_id, req.query);
    return res.json({ code: 0, msg: '获取成功', data });
  } catch (error) {
    return handleError(res, error, 'Get booking list error:');
  }
};

// 获取预订详情
exports.getBookingDetail = async (req, res) => {
  try {
    const { user_id } = req.user || { user_id: 'test_user' }; // 临时添加测试用户ID
    const { id } = req.params;
    const data = await getBookingDetailService(user_id, id);
    return res.json({ code: 0, msg: '获取成功', data });
  } catch (error) {
    return handleError(res, error, 'Get booking detail error:');
  }
};

// 取消预订
exports.cancelBooking = async (req, res) => {
  try {
    const { user_id } = req.user || { user_id: 'test_user' }; // 临时添加测试用户ID
    const { order_id } = req.body;
    const data = await cancelBookingService(user_id, order_id);
    return res.json({ code: 0, msg: '取消成功', data });
  } catch (error) {
    return handleError(res, error, 'Cancel booking error:');
  }
};

// 支付预订
exports.payBooking = async (req, res) => {
  try {
    const { user_id } = req.user || { user_id: 'test_user' }; // 临时添加测试用户ID
    const { order_id, payment_method } = req.body;
    
    // 转换参数格式以匹配service层的期望
    const paymentData = {
      booking_id: order_id,
      payment_method: payment_method || 'wechat',
      transaction_id: `TXN_${Date.now()}`.toString() // 确保交易ID是字符串格式
    };
    
    const data = await payBookingService(user_id, paymentData);
    return res.json({ code: 0, msg: '支付成功', data });
  } catch (error) {
    return handleError(res, error, 'Pay booking error:');
  }
};
