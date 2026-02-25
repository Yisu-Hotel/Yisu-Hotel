const { UserCoupon, Coupon } = require('../models');
const { Op } = require('sequelize');

// 定期检查并更新过期的优惠券状态
const updateExpiredCoupons = async () => {
  try {
    const now = new Date();
    
    console.log('Starting to update expired coupons:', now.toISOString());
    
    // 1. 查找所有已过期但状态仍为 available 的用户优惠券
    const expiredUserCoupons = await UserCoupon.findAll({
      include: [
        {
          model: Coupon,
          as: 'coupon',
          where: {
            valid_until: {
              [Op.lt]: now
            }
          }
        }
      ],
      where: {
        status: 'available'
      }
    });
    
    // 更新过期的用户优惠券状态
    for (const userCoupon of expiredUserCoupons) {
      await userCoupon.update({
        status: 'expired'
      });
      
      console.log('Updated expired user coupon:', {
        couponId: userCoupon.id,
        userId: userCoupon.user_id,
        couponTemplateId: userCoupon.coupon_id
      });
    }
    
    console.log(`Updated ${expiredUserCoupons.length} expired user coupons`);
    
  } catch (error) {
    console.error('Error updating expired coupons:', error);
  }
};

// 启动定时任务
const startCouponTasks = () => {
  // 立即执行一次
  updateExpiredCoupons();
  
  // 每小时执行一次
  setInterval(updateExpiredCoupons, 60 * 60 * 1000);
  
  console.log('Coupon tasks started, will check expired coupons every hour');
};

module.exports = {
  updateExpiredCoupons,
  startCouponTasks
};
