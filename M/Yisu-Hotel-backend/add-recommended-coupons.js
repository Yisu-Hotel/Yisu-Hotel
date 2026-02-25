const dotenv = require('dotenv');
dotenv.config();

const { Coupon } = require('./src/models');

// 添加推荐优惠券数据
async function addRecommendedCoupons() {
  try {
    console.log('添加推荐的优惠券数据...');
    
    // 推荐优惠券数据
    const recommendedCoupons = [
      {
        title: '推荐酒店立减40元',
        description: '推荐酒店专享优惠，订单满250元可使用',
        valid_from: '2026-02-20',
        valid_until: '2026-12-31',
        total_count: 1000,
        used_count: 0,
        is_new_user_only: false,
        discount_type: 'fixed',
        discount_value: '40.00',
        min_order_amount: '250.00',
        rules: '适用于推荐酒店预订'
      },
      {
        title: '热门住宿立减25元',
        description: '热门住宿专享优惠，订单满180元可使用',
        valid_from: '2026-02-20',
        valid_until: '2026-12-31',
        total_count: 1500,
        used_count: 0,
        is_new_user_only: false,
        discount_type: 'fixed',
        discount_value: '25.00',
        min_order_amount: '180.00',
        rules: '适用于热门住宿预订'
      },
      {
        title: '精选酒店8折优惠',
        description: '精选酒店专享8折优惠',
        valid_from: '2026-02-20',
        valid_until: '2026-12-31',
        total_count: 800,
        used_count: 0,
        is_new_user_only: false,
        discount_type: 'percentage',
        discount_value: '20.00',
        min_order_amount: '150.00',
        rules: '适用于精选酒店预订'
      },
      {
        title: '限时酒店立减35元',
        description: '限时酒店专享优惠，订单满220元可使用',
        valid_from: '2026-02-20',
        valid_until: '2026-12-31',
        total_count: 1200,
        used_count: 0,
        is_new_user_only: false,
        discount_type: 'fixed',
        discount_value: '35.00',
        min_order_amount: '220.00',
        rules: '适用于限时酒店预订'
      },
      {
        title: '推荐住宿立减20元',
        description: '推荐住宿专享优惠，订单满160元可使用',
        valid_from: '2026-02-20',
        valid_until: '2026-12-31',
        total_count: 2000,
        used_count: 0,
        is_new_user_only: false,
        discount_type: 'fixed',
        discount_value: '20.00',
        min_order_amount: '160.00',
        rules: '适用于推荐住宿预订'
      },
      {
        title: '酒店预订满减50元',
        description: '酒店预订专享优惠，订单满300元可使用',
        valid_from: '2026-02-20',
        valid_until: '2026-12-31',
        total_count: 600,
        used_count: 0,
        is_new_user_only: false,
        discount_type: 'fixed',
        discount_value: '50.00',
        min_order_amount: '300.00',
        rules: '适用于酒店预订'
      },
      {
        title: '住宿套餐立减30元',
        description: '住宿套餐专享优惠，订单满200元可使用',
        valid_from: '2026-02-20',
        valid_until: '2026-12-31',
        total_count: 1000,
        used_count: 0,
        is_new_user_only: false,
        discount_type: 'fixed',
        discount_value: '30.00',
        min_order_amount: '200.00',
        rules: '适用于住宿套餐'
      },
      {
        title: '豪华酒店75折',
        description: '豪华酒店专享75折优惠',
        valid_from: '2026-02-20',
        valid_until: '2026-12-31',
        total_count: 500,
        used_count: 0,
        is_new_user_only: false,
        discount_type: 'percentage',
        discount_value: '25.00',
        min_order_amount: '300.00',
        rules: '适用于豪华酒店预订'
      }
    ];
    
    // 添加优惠券到数据库
    for (const couponData of recommendedCoupons) {
      try {
        const coupon = await Coupon.create(couponData);
        console.log(`成功添加推荐优惠券: ${coupon.title}`);
      } catch (error) {
        console.error(`添加推荐优惠券失败: ${couponData.title}`, error.message);
      }
    }
    
    console.log('\n推荐优惠券添加完成！');
    
  } catch (error) {
    console.error('添加推荐优惠券失败:', error);
  }
}

// 运行添加推荐优惠券函数
addRecommendedCoupons();
