const { User, Coupon, UserCoupon } = require('../src/models');

async function checkCouponData() {
  try {
    console.log('🔄 Connecting to database...');
    await require('../src/models').sequelize.authenticate();
    console.log('✅ Connected successfully!');

    const phone = '18595890987';
    console.log(`\n📱 Checking coupon data for user with phone: ${phone}`);

    // 查找用户
    const user = await User.findOne({ where: { phone } });

    if (!user) {
      console.log('❌ User not found!');
      process.exit(1);
    }

    console.log(`✅ User found: ${user.phone} (${user.nickname}) - ${user.role}`);
    console.log(`   User ID: ${user.id}`);

    // 检查用户优惠券记录
    console.log('\n🎟️ Checking user coupon records...');
    const userCoupons = await UserCoupon.findAll({ where: { user_id: user.id } });

    if (userCoupons.length === 0) {
      console.log('❌ No user coupon records found for this user');
    } else {
      console.log(`✅ Found ${userCoupons.length} user coupon records:`);
      for (const userCoupon of userCoupons) {
        // 单独查询优惠券信息
        const coupon = await Coupon.findByPk(userCoupon.coupon_id, { 
          attributes: ['id', 'title', 'description', 'discount_type', 'discount_value', 'min_order_amount', 'valid_from', 'valid_until'] 
        });
        console.log(`   - Coupon: ${coupon?.title || 'Unknown'}`);
        if (coupon) {
          console.log(`     Discount: ${coupon.discount_type === 'fixed' ? '¥' : ''}${coupon.discount_value}${coupon.discount_type === 'percentage' ? '%' : ''}`);
          console.log(`     Min Order: ¥${coupon.min_order_amount}`);
          console.log(`     Valid from: ${coupon.valid_from}`);
          console.log(`     Valid until: ${coupon.valid_until}`);
        }
        console.log(`     Status: ${userCoupon.status}`);
      }
    }

    // 检查所有可用的优惠券
    console.log('\n🎫 Checking all available coupons...');
    const allCoupons = await Coupon.findAll({ 
      attributes: ['id', 'title', 'description', 'discount_type', 'discount_value', 'min_order_amount', 'valid_from', 'valid_until', 'is_new_user_only'] 
    });
    console.log(`Found ${allCoupons.length} coupons in total:`);
    allCoupons.forEach((coupon, index) => {
      console.log(`   ${index + 1}. ${coupon.title} - ${coupon.discount_type === 'fixed' ? '¥' : ''}${coupon.discount_value}${coupon.discount_type === 'percentage' ? '%' : ''}`);
      console.log(`      Min Order: ¥${coupon.min_order_amount}`);
      console.log(`      New user only: ${coupon.is_new_user_only ? 'Yes' : 'No'}`);
    });

    console.log('\n✅ Check completed!');

  } catch (error) {
    console.error('❌ Error checking coupon data:', error);
    process.exit(1);
  } finally {
    await require('../src/models').sequelize.close();
    console.log('\n🔌 Connection closed.');
  }
}

checkCouponData();
