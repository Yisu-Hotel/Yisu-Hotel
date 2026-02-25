const { User, Coupon, UserCoupon, Booking, Hotel, RoomType } = require('../../models');
const { getCouponListService, useCouponService } = require('../../services/mobile/coupon');

async function compareCouponList() {
  try {
    console.log('🔄 Connecting to database...');
    const sequelize = require('../../models').sequelize;
    await sequelize.authenticate();
    console.log('✅ Connected successfully!');

    // 1. 准备测试用户
    const phone = '15928077855';
    let user = await User.findOne({ where: { phone } });
    if (!user) {
      user = await User.create({
        phone,
        nickname: '对比测试用户',
        role: 'mobile'
      });
    }
    const userId = user.id;
    console.log(`✅ Test User: ${userId} (${phone})`);

    // 2. 准备一张测试优惠券
    const now = new Date();
    const validUntil = new Date();
    validUntil.setDate(now.getDate() + 30);

    const [coupon] = await Coupon.findOrCreate({
      where: { title: '对比测试满减券' },
      defaults: {
        title: '对比测试满减券',
        description: '用于测试 /list 变化',
        discount_type: 'fixed',
        discount_value: 50.00,
        min_order_amount: 200.00,
        valid_from: now,
        valid_until: validUntil,
        total_count: 100,
        used_count: 0
      }
    });
    console.log(`✅ Coupon: ${coupon.title} (ID: ${coupon.id})`);

    // 3. 确保用户拥有一张该优惠券
    const [userCoupon] = await UserCoupon.findOrCreate({
      where: {
        user_id: userId,
        coupon_id: coupon.id,
        status: 'available'
      },
      defaults: {
        user_id: userId,
        coupon_id: coupon.id,
        status: 'available'
      }
    });
    console.log(`✅ User Coupon assigned (ID: ${userCoupon.id})`);

    // 4. 获取使用前的 /list 接口数据
    console.log('\n=========================================');
    console.log('📊 STEP 1: /list 接口原始数据 (使用前)');
    console.log('=========================================');
    const listBefore = await getCouponListService(userId, 'all');
    console.log(JSON.stringify(listBefore, null, 2));

    // 5. 准备订单并执行 /use
    let hotel = await Hotel.findOne();
    if (!hotel) {
        hotel = await Hotel.create({
            hotel_name_cn: '测试酒店',
            hotel_name_en: 'Test Hotel',
            star_rating: 5,
            opening_date: '2020-01-01',
            status: 'published',
            created_by: userId
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

    const booking = await Booking.create({
      user_id: userId,
      hotel_id: hotel.id,
      hotel_name: hotel.hotel_name_cn,
      room_type_id: roomType.id,
      room_type_name: roomType.room_type_name,
      check_in_date: now,
      check_out_date: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      total_price: 300.00,
      original_total_price: 300.00,
      status: 'pending',
      contact_name: 'Tester',
      contact_phone: phone,
      booked_at: now
    });

    console.log(`\n🚀 Executing /use for UserCoupon: ${userCoupon.id}...`);
    await useCouponService(userId, userCoupon.id, booking.id);
    console.log('✅ Coupon used successfully!');

    // 6. 获取使用后的 /list 接口数据
    console.log('\n=========================================');
    console.log('📊 STEP 2: /list 接口原始数据 (使用后)');
    console.log('=========================================');
    const listAfter = await getCouponListService(userId, 'all');
    console.log(JSON.stringify(listAfter, null, 2));

    // 7. 简要对比说明
    console.log('\n=========================================');
    console.log('📝 变化对比摘要');
    console.log('=========================================');
    const beforeItem = listBefore.coupons.find(c => c.id === userCoupon.id);
    const afterItem = listAfter.coupons.find(c => c.id === userCoupon.id);
    
    console.log(`优惠券 ID: ${userCoupon.id}`);
    console.log(`使用前状态 (status): ${beforeItem ? beforeItem.status : '未找到'}`);
    console.log(`使用后状态 (status): ${afterItem ? afterItem.status : '未找到'}`);
    if (afterItem && afterItem.used_date) {
        console.log(`使用后 used_date: ${afterItem.used_date}`);
    }

  } catch (error) {
    console.error('❌ Error during comparison test:', error);
  } finally {
    await require('../../models').sequelize.close();
    console.log('\n🔌 Connection closed.');
  }
}

compareCouponList();
