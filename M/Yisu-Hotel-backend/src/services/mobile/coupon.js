const { Coupon, UserCoupon } = require('../../models');
const { Op } = require('sequelize');

// 获取优惠券列表
const getCouponListService = async (user_id, type = 'all') => {
  const now = new Date();
  
  // 查询所有可用的优惠券
  const availableCoupons = await Coupon.findAll({
    where: {
      valid_from: {
        [Op.lte]: now
      },
      valid_until: {
        [Op.gte]: now
      },
      total_count: {
        [Op.gt]: 0
      }
    },
    attributes: ['id', 'title', 'description', 'discount_type', 'discount_value', 'min_order_amount', 'valid_from', 'valid_until', 'total_count', 'used_count', 'is_new_user_only', 'rules']
  });
  
  // 格式化可用优惠券数据
  // 首先构建用户优惠券状态映射
  const userCouponStatusMap = new Map();
  
  // 只有当user_id是有效的UUID格式时，才查询用户优惠券
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (uuidRegex.test(user_id)) {
    try {
      const userCoupons = await UserCoupon.findAll({
        where: {
          user_id
        },
        attributes: ['coupon_id', 'status']
      });
      
      // 构建优惠券ID到状态的映射
      userCoupons.forEach(userCoupon => {
        userCouponStatusMap.set(userCoupon.coupon_id, userCoupon.status);
      });
    } catch (error) {
      console.error('Error getting user coupons for status map:', error);
    }
  }
  
  // 格式化可用优惠券数据，添加userStatus字段
  const formattedAvailableCoupons = availableCoupons.map(coupon => {
    // 获取用户对该优惠券的状态
    const userStatus = userCouponStatusMap.get(coupon.id);
    
    let userStatusText = 'unclaimed'; // 默认未领取
    
    if (userStatus === 'available') {
      userStatusText = 'claimed'; // 已领取（未使用）
    } else if (userStatus === 'used') {
      userStatusText = 'used'; // 已使用
    } else if (userStatus === 'expired') {
      userStatusText = 'expired'; // 已过期
    }
    
    return {
      id: coupon.id,
      coupon_id: coupon.id,
      title: coupon.title,
      description: coupon.description,
      value: coupon.discount_value,
      min_spend: coupon.min_order_amount,
      expire_date: coupon.valid_until,
      status: 'available',
      userStatus: userStatusText
    };
  });
  
  // 处理用户优惠券
  let formattedUserCoupons = [];
  
  try {
    // 验证user_id是否为有效的UUID格式
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    // 只有当user_id是有效的UUID格式时，才查询用户优惠券
    // 这样可以避免数据库错误（因为数据库中的user_id字段是UUID类型）
    if (uuidRegex.test(user_id)) {
      const userCoupons = await UserCoupon.findAll({
        where: {
          user_id
        },
        include: [
          {
            model: Coupon,
            as: 'coupon'
          }
        ],
        attributes: ['id', 'coupon_id', 'status', 'created_at']
      });
      
      // 格式化用户优惠券数据，将模型状态映射为前端需要的状态
      formattedUserCoupons = userCoupons.map(userCoupon => {
        let status = userCoupon.status;
        // 将模型中的状态映射为前端需要的状态
        if (status === 'available') {
          status = 'unused'; // 未使用
        }
        
        return {
          id: userCoupon.id,
          coupon_id: userCoupon.coupon_id,
          title: userCoupon.coupon.title,
          description: userCoupon.coupon.description,
          value: userCoupon.coupon.discount_value,
          min_spend: userCoupon.coupon.min_order_amount,
          expire_date: userCoupon.coupon.valid_until,
          status: status,
          used_date: status === 'used' ? userCoupon.created_at : null,
          receive_time: userCoupon.created_at
        };
      });
    } else {
      // 当user_id不是有效的UUID格式时（比如'test_user'），跳过查询用户优惠券的步骤
      console.log('User ID is not a valid UUID format, skipping user coupon query');
      formattedUserCoupons = [];
    }
  } catch (error) {
    console.error('Error getting user coupons:', error);
    // 发生错误时，只返回可用的优惠券
    formattedUserCoupons = [];
  }
  
  // 准备返回数据
  const returnData = {
    coupons: [],
    pushCoupons: {
      limited: [],
      bank: [],
      selected: []
    }
  };
  
  // 根据type参数返回不同状态的优惠券
  if (type === 'available') {
    // 返回未使用的优惠券
    returnData.coupons = formattedUserCoupons.filter(coupon => coupon.status === 'unused');
  } else if (type === 'used') {
    // 返回已使用的优惠券
    returnData.coupons = formattedUserCoupons.filter(coupon => coupon.status === 'used');
  } else if (type === 'expired') {
    // 返回已过期的优惠券
    returnData.coupons = formattedUserCoupons.filter(coupon => coupon.status === 'expired');
  } else {
    // 返回所有状态的优惠券
    returnData.coupons = formattedUserCoupons;
  }
  
  // 添加推送优惠券数据
  // 将可用优惠券分配到不同的推送类别
  formattedAvailableCoupons.forEach(coupon => {
    // 添加到领好券
    returnData.pushCoupons.selected.push({
      id: coupon.id,
      name: coupon.title,
      value: coupon.value,
      discount: coupon.value,
      description: coupon.description,
      expire_date: coupon.expire_date,
      limit: `满${coupon.min_spend}可用`,
      remain: '100%',
      userStatus: coupon.userStatus
    });
  });
  
  return returnData;
};

// 领取优惠券
const receiveCouponService = async (user_id, coupon_id) => {
  const now = new Date();
  
  // 检查优惠券是否存在且可用
  const coupon = await Coupon.findOne({
    where: {
      id: coupon_id,
      valid_from: {
        [Op.lte]: now
      },
      valid_until: {
        [Op.gte]: now
      },
      total_count: {
        [Op.gt]: 0
      }
    }
  });
  
  if (!coupon) {
    const error = new Error('优惠券不存在或已过期');
    error.code = 6001;
    error.httpStatus = 404;
    throw error;
  }
  
  // 检查用户是否已经领取过该优惠券
  const existingUserCoupon = await UserCoupon.findOne({
    where: {
      user_id,
      coupon_id
    }
  });
  
  if (existingUserCoupon) {
    // 若用户已领取该优惠券且状态非过期，返回 "该优惠券已领取，不可重复领取"
    if (existingUserCoupon.status !== 'expired') {
      const error = new Error('该优惠券已领取，不可重复领取');
      error.code = 6002;
      error.httpStatus = 400;
      throw error;
    }
  }
  
  // 领取优惠券
  await UserCoupon.create({
    user_id,
    coupon_id,
    status: 'available'
  });
  
  // 减少优惠券库存
  await coupon.update({
    used_count: coupon.used_count + 1
  });
  
  return {
    coupon_id: coupon.id
  };
};

// 使用优惠券
const useCouponService = async (user_id, coupon_id, booking_id) => {
  console.log('useCouponService called:', { user_id, coupon_id, booking_id });
  
  // 开始事务
  const transaction = await require('../../models').sequelize.transaction();
  const { Coupon, Booking } = require('../../models');
  
  try {
    // 1. 验证优惠券是否存在且状态为 unused
    const userCoupon = await UserCoupon.findOne({
      where: {
        id: coupon_id,
        user_id
      },
      include: [
        {
          model: Coupon,
          as: 'coupon'
        }
      ],
      transaction
    });
    
    if (!userCoupon) {
      console.error('Coupon not found or not belongs to user:', { user_id, coupon_id });
      const error = new Error('优惠券不存在或不属于当前用户');
      error.code = 400;
      error.httpStatus = 400;
      throw error;
    }
    
    // 验证优惠券状态为 available (未使用)
    if (userCoupon.status !== 'available') {
      console.error('Coupon status异常:', { couponId: coupon_id, status: userCoupon.status });
      const error = new Error('优惠券状态异常，不可使用');
      error.code = 400;
      error.httpStatus = 400;
      throw error;
    }
    
    // 2. 验证订单是否存在且状态为 pending
    const booking = await Booking.findOne({
      where: {
        id: booking_id
      },
      transaction
    });
    
    if (!booking) {
      console.error('Booking not found:', { booking_id });
      const error = new Error('订单不存在');
      error.code = 400;
      error.httpStatus = 400;
      throw error;
    }
    
    // 验证订单状态为 pending_payment
    if (booking.status !== 'pending' && booking.status !== 'pending_payment') {
      console.error('Booking status异常:', { bookingId: booking_id, status: booking.status });
      const error = new Error('订单状态异常，不可使用优惠券');
      error.code = 400;
      error.httpStatus = 400;
      throw error;
    }
    
    // 3. 更新优惠券状态为 used，并记录关联的订单ID
    await userCoupon.update({
      status: 'used',
      booking_id,
      used_at: new Date()
    }, { transaction });
    
    // 4. 更新Coupon表，增加已使用次数计数
    await userCoupon.coupon.update({
      used_count: userCoupon.coupon.used_count + 1
    }, { transaction });
    
    // 5. 更新订单的优惠信息
    // 计算优惠金额
    let discountAmount = 0;
    const couponTemplate = userCoupon.coupon;
    
    if (couponTemplate.discount_type === 'fixed') {
      // 固定金额优惠
      discountAmount = couponTemplate.discount_value;
      // 确保优惠金额不超过订单金额
      if (discountAmount > booking.total_price) {
        discountAmount = booking.total_price;
      }
    } else if (couponTemplate.discount_type === 'percentage') {
      // 百分比优惠
      discountAmount = booking.total_price * (couponTemplate.discount_value / 100);
    }
    
    // 重新计算实付总额
    const newTotalPrice = booking.total_price - discountAmount;
    
    // 更新订单信息
    await booking.update({
      discount_amount: discountAmount,
      total_price: newTotalPrice,
      coupon_id: userCoupon.coupon_id // 记录优惠券模板ID
    }, { transaction });
    
    // 提交事务
    await transaction.commit();
    
    const result = {
      coupon_id: userCoupon.id,
      status: 'used',
      booking_id,
      discount_amount: discountAmount,
      total_price: newTotalPrice
    };
    
    console.log('Coupon used successfully:', {
      ...result,
      userId: user_id,
      couponTemplateId: userCoupon.coupon_id,
      couponTitle: userCoupon.coupon.title
    });
    
    return result;
    
  } catch (error) {
    // 回滚事务
    await transaction.rollback();
    console.error('Error using coupon:', { user_id, coupon_id, booking_id, error: error.message });
    throw error;
  }
};

module.exports = {
  getCouponListService,
  receiveCouponService,
  useCouponService
};
