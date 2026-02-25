const { getCouponListService, receiveCouponService, useCouponService } = require('../../services/mobile/coupon');

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

// 获取优惠券列表
exports.getCouponList = async (req, res) => {
  try {
    const { user_id } = req.user || { user_id: 'test_user' }; // 临时添加测试用户ID
    const { type = 'all' } = req.query;
    const data = await getCouponListService(user_id, type);
    return res.json({ code: 0, msg: '查询成功', data });
  } catch (error) {
    return handleError(res, error, 'Get coupon list error:');
  }
};

// 领取优惠券
exports.receiveCoupon = async (req, res) => {
  try {
    const { user_id } = req.user || { user_id: 'test_user' }; // 临时添加测试用户ID
    const { coupon_id } = req.body;
    const data = await receiveCouponService(user_id, coupon_id);
    return res.json({ code: 0, msg: '领取成功', data });
  } catch (error) {
    return handleError(res, error, 'Receive coupon error:');
  }
};

// 使用优惠券
exports.useCoupon = async (req, res) => {
  try {
    const { user_id } = req.user || { user_id: 'test_user' }; // 临时添加测试用户ID
    const { coupon_id, booking_id } = req.body;
    const data = await useCouponService(user_id, coupon_id, booking_id);
    return res.json({ code: 0, msg: '优惠券使用成功', data });
  } catch (error) {
    return handleError(res, error, 'Use coupon error:');
  }
};

// 测试优惠券流程
exports.testCouponFlow = async (req, res) => {
  try {
    const { User, Coupon, UserCoupon, Booking, Hotel, RoomType } = require('../../models');
    const { getCouponListService, useCouponService } = require('../../services/mobile/coupon');

    // 1. 查找或创建测试用户
    let user = await User.findOne({ where: { phone: '18595890987' } });
    if (!user) {
      user = await User.create({
        phone: '18595890987',
        nickname: '测试用户',
        role: 'mobile'
      });
    }

    // 2. 创建示例优惠券
    const now = new Date();
    const validUntil = new Date();
    validUntil.setDate(now.getDate() + 30);

    const couponData = [
      {
        title: `测试满减券-${Date.now()}`,
        description: '全场通用',
        discount_type: 'fixed',
        discount_value: 20.00,
        min_order_amount: 100.00,
        valid_from: now,
        valid_until: validUntil,
        total_count: 100,
        used_count: 0
      }
    ];

    const coupons = [];
    for (const data of couponData) {
      const coupon = await Coupon.create(data);
      coupons.push(coupon);
    }

    // 3. 为用户领取优惠券
    const userCoupon = await UserCoupon.create({
      user_id: user.id,
      coupon_id: coupons[0].id,
      status: 'available'
    });

    // 4. 获取列表测试
    const listData = await getCouponListService(user.id, 'available');

    // 5. 创建测试酒店和房型 (如果不存在)
    let hotel = await Hotel.findOne();
    if (!hotel) {
      hotel = await Hotel.create({
        hotel_name_cn: '测试酒店',
        hotel_name_en: 'Test Hotel',
        star_rating: 5,
        opening_date: '2020-01-01',
        phone: '123456789',
        description: '测试描述',
        status: 'published',
        created_by: user.id
      });
    }

    let roomType = await RoomType.findOne({ where: { hotel_id: hotel.id } });
    if (!roomType) {
      roomType = await RoomType.create({
        hotel_id: hotel.id,
        room_type_name: '测试房型',
        bed_type: 'king',
        area: 30
      });
    }

    // 6. 创建测试订单
    const booking = await Booking.create({
      user_id: user.id,
      hotel_id: hotel.id,
      hotel_name: hotel.hotel_name_cn,
      room_type_id: roomType.id,
      room_type_name: roomType.room_type_name,
      check_in_date: now,
      check_out_date: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      total_price: 200.00,
      original_total_price: 200.00,
      status: 'pending',
      contact_name: 'Test',
      contact_phone: user.phone,
      booked_at: now
    });

    // 7. 使用优惠券测试
    const useResult = await useCouponService(user.id, userCoupon.id, booking.id);

    return res.json({
      code: 0,
      msg: '测试流程完成',
      data: {
        user: { id: user.id, phone: user.phone },
        coupon: { id: coupons[0].id, title: coupons[0].title },
        listResult: { count: listData.coupons.length },
        useResult
      }
    });
  } catch (error) {
    return handleError(res, error, 'Test flow error:');
  }
};
