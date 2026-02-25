const dotenv = require('dotenv');
dotenv.config();

const { Coupon } = require('./src/models');

// 添加优惠券数据
async function addCoupons() {
  try {
    console.log('添加新的优惠券数据...');
    
    // 新的优惠券数据
    const newCoupons = [
      {
        title: '酒店预订立减30元',
        description: '酒店预订专享优惠，订单满200元可使用',
        valid_from: '2026-02-20',
        valid_until: '2026-06-30',
        total_count: 500,
        used_count: 0,
        is_new_user_only: false,
        discount_type: 'fixed',
        discount_value: '30.00',
        min_order_amount: '200.00',
        rules: '适用于所有酒店预订'
      },
      {
        title: '住宿优惠20元',
        description: '住宿专享优惠，订单满150元可使用',
        valid_from: '2026-02-20',
        valid_until: '2026-07-31',
        total_count: 800,
        used_count: 0,
        is_new_user_only: false,
        discount_type: 'fixed',
        discount_value: '20.00',
        min_order_amount: '150.00',
        rules: '适用于所有住宿预订'
      },
      {
        title: '入住立减15元',
        description: '入住专享优惠，订单满100元可使用',
        valid_from: '2026-02-20',
        valid_until: '2026-08-31',
        total_count: 1000,
        used_count: 0,
        is_new_user_only: false,
        discount_type: 'fixed',
        discount_value: '15.00',
        min_order_amount: '100.00',
        rules: '适用于所有入住订单'
      },
      {
        title: '预订酒店85折',
        description: '预订酒店专享85折优惠',
        valid_from: '2026-02-20',
        valid_until: '2026-09-30',
        total_count: 600,
        used_count: 0,
        is_new_user_only: false,
        discount_type: 'percentage',
        discount_value: '15.00',
        min_order_amount: '100.00',
        rules: '适用于所有酒店预订'
      },
      {
        title: '酒店房费立减25元',
        description: '酒店房费专享优惠，订单满180元可使用',
        valid_from: '2026-02-20',
        valid_until: '2026-10-31',
        total_count: 700,
        used_count: 0,
        is_new_user_only: false,
        discount_type: 'fixed',
        discount_value: '25.00',
        min_order_amount: '180.00',
        rules: '适用于所有酒店房费'
      }
    ];
    
    // 添加优惠券到数据库
    for (const couponData of newCoupons) {
      try {
        const coupon = await Coupon.create(couponData);
        console.log(`成功添加优惠券: ${coupon.title}`);
      } catch (error) {
        console.error(`添加优惠券失败: ${couponData.title}`, error.message);
      }
    }
    
    console.log('\n优惠券添加完成！');
    
  } catch (error) {
    console.error('添加优惠券失败:', error);
  }
}

// 运行添加优惠券函数
addCoupons();
