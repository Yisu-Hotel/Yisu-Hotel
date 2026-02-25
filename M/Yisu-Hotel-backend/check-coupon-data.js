const dotenv = require('dotenv');
dotenv.config();

const sequelize = require('./src/config/database');
const Coupon = require('./src/models/entities/Coupon');
const UserCoupon = require('./src/models/entities/UserCoupon');

async function checkCouponData() {
  try {
    console.log('连接数据库...');
    await sequelize.authenticate();
    
    console.log('查询优惠券数据...');
    const coupons = await Coupon.findAll({
      attributes: ['id', 'title', 'description', 'valid_from', 'valid_until', 'total_count', 'used_count', 'is_new_user_only']
    });
    
    console.log('优惠券数据:');
    coupons.forEach(coupon => {
      console.log({
        id: coupon.id,
        title: coupon.title,
        description: coupon.description,
        valid_from: coupon.valid_from,
        valid_until: coupon.valid_until,
        total_count: coupon.total_count,
        used_count: coupon.used_count,
        is_new_user_only: coupon.is_new_user_only
      });
    });
    
    console.log(`共查询到 ${coupons.length} 条优惠券数据`);
    
    console.log('\n查询用户优惠券数据...');
    const userCoupons = await UserCoupon.findAll({
      include: [
        {
          model: Coupon,
          as: 'coupon',
          attributes: ['title']
        }
      ],
      attributes: ['user_id', 'coupon_id', 'status']
    });
    
    console.log('用户优惠券数据:');
    userCoupons.forEach(userCoupon => {
      console.log({
        user_id: userCoupon.user_id,
        coupon_id: userCoupon.coupon_id,
        coupon_title: userCoupon.coupon?.title,
        status: userCoupon.status
      });
    });
    
    console.log(`共查询到 ${userCoupons.length} 条用户优惠券数据`);
    
  } catch (error) {
    console.error('查询优惠券数据失败:', error);
  } finally {
    await sequelize.close();
  }
}

checkCouponData();
