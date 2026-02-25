const { User, Coupon, UserCoupon } = require('../src/models');

async function addUserCoupons() {
  try {
    console.log('🔄 Connecting to database...');
    await require('../src/models').sequelize.authenticate();
    console.log('✅ Connected successfully!');

    const phone = '18595890987';
    console.log(`\n📱 Adding coupons for user with phone: ${phone}`);

    // 查找用户
    const user = await User.findOne({ where: { phone } });

    if (!user) {
      console.log('❌ User not found!');
      process.exit(1);
    }

    console.log(`✅ User found: ${user.phone} (${user.nickname}) - ${user.role}`);
    console.log(`   User ID: ${user.id}`);

    // 获取所有优惠券
    const coupons = await Coupon.findAll();
    console.log(`\nFound ${coupons.length} coupons`);

    // 为用户添加优惠券记录
    console.log('\n🎟️ Adding user coupon records...');
    const addedCoupons = [];

    for (const coupon of coupons) {
      try {
        const [userCoupon, created] = await UserCoupon.findOrCreate({
          where: {
            user_id: user.id,
            coupon_id: coupon.id
          },
          defaults: {
            user_id: user.id,
            coupon_id: coupon.id,
            status: 'available'
          }
        });

        if (created) {
          console.log(`✓ Added coupon: ${coupon.title}`);
          addedCoupons.push(userCoupon);
        } else {
          console.log(`⚠️  User already has coupon: ${coupon.title}`);
        }
      } catch (error) {
        console.error(`❌ Error adding coupon ${coupon.title}:`, error.message);
      }
    }

    console.log('\n✅ All coupons added successfully!');
    console.log(`   Added ${addedCoupons.length} new coupon records`);

  } catch (error) {
    console.error('❌ Error adding user coupons:', error);
    process.exit(1);
  } finally {
    await require('../src/models').sequelize.close();
    console.log('\n🔌 Connection closed.');
  }
}

addUserCoupons();
