const { Op } = require('sequelize');
const { Booking, Hotel, RoomType, RoomPrice } = require('../../models');

const createBookingService = async (user_id, bookingData) => {
  console.log('createBookingService called with:', { user_id, bookingData });
  
  const { hotel_id, room_type_id, check_in_date, check_out_date, contact_name, contact_phone, special_requests } = bookingData;
  
  // 验证参数
  if (!hotel_id || !room_type_id || !check_in_date || !check_out_date || !contact_name || !contact_phone) {
    const error = new Error('缺少必要参数');
    error.code = 3001;
    error.httpStatus = 400;
    throw error;
  }
  
  // 确保ID是字符串类型
  const hotelIdStr = String(hotel_id);
  const roomTypeIdStr = String(room_type_id);
  
  console.log('Parsed IDs:', { hotelIdStr, roomTypeIdStr });
  
  // 验证日期格式
  const checkIn = new Date(check_in_date);
  const checkOut = new Date(check_out_date);
  
  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
    const error = new Error('日期格式不正确');
    error.code = 3002;
    error.httpStatus = 400;
    throw error;
  }
  
  if (checkIn >= checkOut) {
    const error = new Error('入住日期必须早于退房日期');
    error.code = 3003;
    error.httpStatus = 400;
    throw error;
  }
  
  // 只比较日期部分，不比较时间部分
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkInDate = new Date(checkIn);
  checkInDate.setHours(0, 0, 0, 0);

  if (checkInDate < today) {
    const error = new Error('入住日期不能早于今天');
    error.code = 3004;
    error.httpStatus = 400;
    throw error;
  }
  
  // 验证酒店和房型是否存在
  const hotel = await Hotel.findByPk(hotelIdStr);
  if (!hotel) {
    const error = new Error('酒店不存在');
    error.code = 3005;
    error.httpStatus = 400;
    throw error;
  }
  
  const roomType = await RoomType.findByPk(roomTypeIdStr);
  if (!roomType || roomType.hotel_id !== hotelIdStr) {
    const error = new Error('房型不存在');
    error.code = 3006;
    error.httpStatus = 400;
    throw error;
  }
  
  // 计算总价和天数
  const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  
  // 从RoomPrice模型中获取价格
  let totalPrice = 0;
  for (let i = 0; i < days; i++) {
    const currentDate = new Date(checkIn);
    currentDate.setDate(currentDate.getDate() + i);
    const dateString = currentDate.toISOString().split('T')[0];
    
    const roomPrice = await RoomPrice.findOne({
      where: {
        room_type_id: roomTypeIdStr,
        price_date: dateString
      }
    });
    
    if (roomPrice) {
      totalPrice += parseFloat(roomPrice.price) || 0;
    } else {
      // 如果没有找到当天的价格，使用默认价格
      totalPrice += 300; // 默认价格为300元/晚
    }
  }
  
  // 创建预订
  const booking = await Booking.create({
    user_id,
    hotel_id: hotelIdStr,
    hotel_name: hotel.hotel_name_cn,
    room_type_id: roomTypeIdStr,
    room_type_name: roomType.room_type_name,
    check_in_date: check_in_date.split('T')[0], // 只取日期部分
    check_out_date: check_out_date.split('T')[0], // 只取日期部分
    contact_name,
    contact_phone,
    special_requests,
    total_price: totalPrice,
    status: 'pending'
  });
  
  return {
    booking_id: booking.id,
    hotel_name: hotel.hotel_name_cn,
    room_type: roomType.room_type_name,
    check_in_date: booking.check_in_date,
    check_out_date: booking.check_out_date,
    total_price: totalPrice.toString(),
    status: booking.status,
    status_text: getStatusText(booking.status),
    contact_name: booking.contact_name,
    contact_phone: booking.contact_phone,
    special_requests: booking.special_requests,
    booked_at: booking.created_at
  };
};

const getBookingListService = async (user_id, params) => {
  console.log('getBookingListService called with:', { user_id, params });
  
  const { page = 1, page_size = 10, status } = params;
  
  // 验证user_id是否为有效的UUID格式
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(user_id)) {
    console.log('Invalid user_id format, returning empty list:', user_id);
    // 返回空的预订列表
    return {
      bookings: [],
      total: 0,
      page: parseInt(page),
      page_size: parseInt(page_size)
    };
  }
  
  // 构建查询条件
  const whereCondition = {
    user_id
  };
  
  if (status) {
    whereCondition.status = status;
  }
  
  try {
    // 查询预订列表
    const { count, rows: bookings } = await Booking.findAndCountAll({
      where: whereCondition,
      order: [['booked_at', 'DESC']],
      limit: parseInt(page_size),
      offset: (parseInt(page) - 1) * parseInt(page_size)
    });
    
    // 格式化数据
    const formattedBookings = bookings.map((booking) => {
      return {
        id: booking.id,
        hotel_id: booking.hotel_id,
        hotel_name: booking.hotel_name,
        room_type: booking.room_type_name,
        check_in_date: booking.check_in_date,
        check_out_date: booking.check_out_date,
        total_price: parseFloat(booking.total_price) || 0,
        status: booking.status,
        status_text: getStatusText(booking.status),
        booked_at: booking.booked_at
      };
    });
    
    return {
      bookings: formattedBookings,
      total: count,
      page: parseInt(page),
      page_size: parseInt(page_size)
    };
  } catch (error) {
    console.error('Error getting booking list:', error);
    // 发生错误时返回空列表
    return {
      bookings: [],
      total: 0,
      page: parseInt(page),
      page_size: parseInt(page_size)
    };
  }
};

const getBookingDetailService = async (user_id, booking_id) => {
  console.log('getBookingDetailService called with:', { user_id, booking_id });
  
  // 确保预订ID是字符串类型
  const bookingIdStr = String(booking_id);
  
  console.log('Parsed bookingId:', { bookingIdStr });
  
  // 查询预订详情，同时关联酒店信息
  const booking = await Booking.findOne({
    where: {
      id: bookingIdStr,
      user_id
    },
    include: [
      {
        model: Hotel,
        attributes: ['hotel_name_cn', 'phone', 'location_info']
      }
    ]
  });
  
  if (!booking) {
    const error = new Error('预订不存在');
    error.code = 3007;
    error.httpStatus = 404;
    throw error;
  }
  
  // 计算价格明细
  const originalPrice = parseFloat(booking.total_price) || 0;
  const discountAmount = 0; // 暂时设为0，后续可以根据优惠规则计算
  const finalPrice = originalPrice - discountAmount;
  
  // 格式化数据
  return {
    id: booking.id,
    order_number: booking.order_number || `ORD${booking.id.substring(0, 8).toUpperCase()}`,
    hotel_id: booking.hotel_id,
    hotel_name: booking.hotel_name,
    hotel_phone: booking.Hotel?.phone || '',
    hotel_address: booking.Hotel?.location_info?.formatted_address || '',
    room_type: booking.room_type_name,
    check_in_date: booking.check_in_date,
    check_out_date: booking.check_out_date,
    contact_name: booking.contact_name,
    contact_phone: booking.contact_phone,
    special_requests: booking.special_requests,
    price_detail: {
      original_price: originalPrice,
      discount_amount: discountAmount,
      total_price: finalPrice
    },
    status: booking.status,
    status_text: getStatusText(booking.status),
    booked_at: booking.booked_at,
    paid_at: booking.paid_at,
    payment_method: null
  };
};

const cancelBookingService = async (user_id, booking_id) => {
  console.log('cancelBookingService called with:', { user_id, booking_id });
  
  // 确保预订ID是字符串类型
  const bookingIdStr = String(booking_id);
  
  console.log('Parsed bookingId:', { bookingIdStr });
  
  // 查找预订
  const booking = await Booking.findOne({
    where: {
      id: bookingIdStr,
      user_id
    }
  });
  
  if (!booking) {
    const error = new Error('预订不存在');
    error.code = 3007;
    error.httpStatus = 404;
    throw error;
  }
  
  // 检查是否可以取消
  if (booking.status !== 'pending' && booking.status !== 'paid') {
    const error = new Error('该预订状态不可取消');
    error.code = 3008;
    error.httpStatus = 400;
    throw error;
  }
  
  // 更新预订状态
  await booking.update({
    status: 'cancelled'
  });
  
  return {
    booking_id: booking_id,
    status: 'cancelled',
    status_text: getStatusText('cancelled')
  };
};

const payBookingService = async (user_id, paymentData) => {
  console.log('payBookingService called with:', { user_id, paymentData });
  
  const { booking_id, payment_method, transaction_id } = paymentData;
  
  // 验证参数
  if (!booking_id || !payment_method || !transaction_id) {
    const error = new Error('缺少必要参数');
    error.code = 3001;
    error.httpStatus = 400;
    throw error;
  }
  
  // 确保预订ID是字符串类型
  const bookingIdStr = String(booking_id);
  
  console.log('Parsed bookingId:', { bookingIdStr });
  
  // 查找预订
  const booking = await Booking.findOne({
    where: {
      id: bookingIdStr,
      user_id
    }
  });
  
  if (!booking) {
    const error = new Error('预订不存在');
    error.code = 3007;
    error.httpStatus = 404;
    throw error;
  }
  
  // 检查预订状态
  if (booking.status !== 'pending') {
    const error = new Error('该预订状态不可支付');
    error.code = 3009;
    error.httpStatus = 400;
    throw error;
  }
  
  // 开始事务
  const transaction = await Booking.sequelize.transaction();
  
  try {
    // 更新预订状态
    await booking.update({
      status: 'paid'
    }, { transaction });
    
    // 提交事务
    await transaction.commit();
    
    return {
      booking_id: booking.id,
      status: 'paid',
      status_text: getStatusText('paid')
    };
  } catch (error) {
    // 回滚事务
    await transaction.rollback();
    throw error;
  }
};

// 获取状态文本
function getStatusText(status) {
  const statusMap = {
    pending: '待支付',
    paid: '已支付',
    completed: '已完成',
    cancelled: '已取消'
  };
  return statusMap[status] || status;
}

module.exports = {
  createBookingService,
  getBookingListService,
  getBookingDetailService,
  cancelBookingService,
  payBookingService
};