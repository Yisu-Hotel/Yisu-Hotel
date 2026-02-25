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
  const formattedAvailableCoupons = availableCoupons.map(coupon => ({
    coupon_id: coupon.id,
    title: coupon.title,
    description: coupon.description,
    discount_type: coupon.discount_type,
    discount_value: coupon.discount_value,
    min_order_amount: coupon.min_order_amount,
    valid_from: coupon.valid_from,
    valid_until: coupon.valid_until,
    total_count: coupon.total_count,
    used_count: coupon.used_count,
    is_new_user_only: coupon.is_new_user_only,
    rules: coupon.rules
  }));
  
  // 验证user_id是否为有效的UUID格式
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  let formattedUserCoupons = [];
  
  if (uuidRegex.test(user_id)) {
    try {
      // 查询用户已领取的优惠券
      const userCoupons = await UserCoupon.findAll({
        where: {
          user_id
        },
        include: [
          {
            model: Coupon,
            as: 'coupon',
            attributes: ['id', 'title', 'description', 'discount_type', 'discount_value', 'min_order_amount', 'valid_from', 'valid_until', 'total_count', 'used_count', 'is_new_user_only', 'rules']
          }
        ],
        attributes: ['id', 'coupon_id', 'status', 'created_at']
      });
      
      // 格式化用户优惠券数据
      formattedUserCoupons = userCoupons.map(userCoupon => ({
        id: userCoupon.id,
        coupon_id: userCoupon.coupon_id,
        title: userCoupon.coupon.title,
        description: userCoupon.coupon.description,
        discount_type: userCoupon.coupon.discount_type,
        discount_value: userCoupon.coupon.discount_value,
        min_order_amount: userCoupon.coupon.min_order_amount,
        valid_from: userCoupon.coupon.valid_from,
        valid_until: userCoupon.coupon.valid_until,
        total_count: userCoupon.coupon.total_count,
        used_count: userCoupon.coupon.used_count,
        is_new_user_only: userCoupon.coupon.is_new_user_only,
        rules: userCoupon.coupon.rules,
        status: userCoupon.status,
        receive_time: userCoupon.created_at
      }));
    } catch (error) {
      console.error('Error getting user coupons:', error);
      // 发生错误时，只返回可用的优惠券
      formattedUserCoupons = [];
    }
  }
  
  if (type === 'available') {
    return {
      coupons: [
        ...formattedAvailableCoupons.map(coupon => ({ ...coupon, status: 'available' })),
        ...formattedUserCoupons.filter(coupon => coupon.status === 'unused').map(coupon => ({ ...coupon, status: 'available' }))
      ]
    };
  } else if (type === 'used') {
    return {
      coupons: formattedUserCoupons.filter(coupon => coupon.status === 'used').map(coupon => ({ ...coupon, status: 'used' }))
    };
  } else if (type === 'expired') {
    return {
      coupons: formattedUserCoupons.filter(coupon => coupon.status === 'expired').map(coupon => ({ ...coupon, status: 'expired' }))
    };
  } else {
    // 返回所有优惠券
    return {
      coupons: [
        ...formattedAvailableCoupons.map(coupon => ({ ...coupon, status: 'available' })),
        ...formattedUserCoupons.filter(coupon => coupon.status === 'unused').map(coupon => ({ ...coupon, status: 'available' })),
        ...formattedUserCoupons.filter(coupon => coupon.status === 'used').map(coupon => ({ ...coupon, status: 'used' })),
        ...formattedUserCoupons.filter(coupon => coupon.status === 'expired').map(coupon => ({ ...coupon, status: 'expired' }))
      ]
    };
  }
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
    const error = new Error('已经领取过该优惠券');
    error.code = 6002;
    error.httpStatus = 400;
    throw error;
  }
  
  // 领取优惠券
  await UserCoupon.create({
    user_id,
    coupon_id,
    status: 'unused'
  });
  
  // 减少优惠券库存
  await coupon.update({
    used_count: coupon.used_count + 1
  });
  
  return {
    coupon_id: coupon.id
  };
};

module.exports = {
  getCouponListService,
  receiveCouponService
};
