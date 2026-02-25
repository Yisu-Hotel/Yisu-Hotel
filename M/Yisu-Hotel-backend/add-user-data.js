const { User, Coupon, UserCoupon, History, Hotel } = require('./src/models');

async function addUserData() {
  try {
    console.log('🔄 Connecting to database...');
    await require('./src/models').sequelize.authenticate();
    console.log('✅ Connected successfully!');

    // 查找用户
    const user = await User.findOne({ where: { phone: '18595890987' } });
    
    if (!user) {
      console.error('❌ User not found!');
      return;
    }

    console.log(`✅ Found user: ${user.phone}`);

    // 创建优惠券
    await addCoupons(user.id);

    // 创建历史记录
    await addHistory(user.id);

    console.log('✅ All data added successfully!');

  } catch (error) {
    console.error('❌ Error adding user data:', error);
  } finally {
    await require('./src/models').sequelize.close();
    console.log('🔌 Connection closed.');
  }
}

async function addCoupons(userId) {
  console.log('🎫 Adding coupons...');

  // 创建优惠券
  const coupons = [
    {
      title: '新用户立减20元',
      description: '新用户专享，订单满100元可使用',
      discount_type: 'fixed',
      discount_value: 20,
      min_order_amount: 100,
      valid_from: new Date(),
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后过期
      total_count: 100,
      used_count: 0,
      is_new_user_only: true,
      rules: '订单满100元可使用，有效期30天'
    },
    {
      title: '周末优惠15元',
      description: '周末入住专享优惠',
      discount_type: 'fixed',
      discount_value: 15,
      min_order_amount: 80,
      valid_from: new Date(),
      valid_until: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60天后过期
      total_count: 200,
      used_count: 0,
      is_new_user_only: false,
      rules: '周末入住可使用，有效期60天'
    },
    {
      title: '会员专享10元',
      description: '会员专享优惠',
      discount_type: 'fixed',
      discount_value: 10,
      min_order_amount: 50,
      valid_from: new Date(),
      valid_until: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90天后过期
      total_count: 500,
      used_count: 0,
      is_new_user_only: false,
      rules: '会员专享，订单满50元可使用，有效期90天'
    }
  ];

  for (const couponData of coupons) {
    const [coupon] = await Coupon.findOrCreate({
      where: { title: couponData.title },
      defaults: couponData
    });

    // 为用户添加优惠券
    await UserCoupon.findOrCreate({
      where: { user_id: userId, coupon_id: coupon.id },
      defaults: {
        user_id: userId,
        coupon_id: coupon.id,
        status: 'available'
      }
    });
  }

  console.log('✅ Coupons added successfully!');
}

async function addHistory(userId) {
  console.log('📋 Adding history records...');

  // 获取酒店数据
  const hotels = await Hotel.findAll({ limit: 5 });
  
  if (hotels.length === 0) {
    console.error('❌ No hotels found!');
    return;
  }

  // 创建历史记录
  for (let i = 0; i < hotels.length; i++) {
    await History.findOrCreate({
      where: {
        user_id: userId,
        hotel_id: hotels[i].id
      },
      defaults: {
        user_id: userId,
        hotel_id: hotels[i].id,
        viewed_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000) // 不同的查看时间
      }
    });
  }

  console.log('✅ History records added successfully!');
}

addUserData();
