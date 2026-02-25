const { User, Coupon, UserCoupon, Booking, Hotel, RoomType } = require('../src/models');
const { getCouponListService, useCouponService } = require('../src/services/mobile/coupon');

async function testCouponFlow() {
  try {
    console.log('🔄 Connecting to database...');
    const sequelize = require('../src/models').sequelize;
    await sequelize.authenticate();
    console.log('✅ Connected successfully!');

    // 1. 查找或创建测试用户
    let user = await User.findOne({ where: { phone: '15928077855' } });
    if (!user) {
      user = await User.create({
        phone: '15928077855',
        nickname: '测试用户',
        role: 'mobile'
      });
    }
    console.log(`✅ User: ${user.id} (${user.phone})`);

    // 2. 创建示例优惠券
    const now = new Date();
    const validUntil = new Date();
    validUntil.setDate(now.getDate() + 30);

    const couponData = [
      {
        title: '测试满减券 - 满100减20',
        description: '全场通用',
        discount_type: 'fixed',
        discount_value: 20.00,
        min_order_amount: 100.00,
        valid_from: now,
        valid_until: validUntil,
        total_count: 100,
        used_count: 0
      },
      {
        title: '测试折扣券 - 8折',
        description: '全场通用',
        discount_type: 'percentage',
        discount_value: 80.00, // 假设 80 表示 80% (即 8 折) 或 20 表示减 20%
        min_order_amount: 0.00,
        valid_from: now,
        valid_until: validUntil,
        total_count: 50,
        used_count: 0
      }
    ];

    const coupons = [];
    for (const data of couponData) {
      const [coupon] = await Coupon.findOrCreate({
        where: { title: data.title },
        defaults: data
      });
      coupons.push(coupon);
      console.log(`✅ Coupon created/found: ${coupon.title} (ID: ${coupon.id})`);
    }

    // 3. 为用户领取优惠券
    const userCoupons = [];
    for (const coupon of coupons) {
      const [userCoupon] = await UserCoupon.findOrCreate({
        where: {
          user_id: user.id,
          coupon_id: coupon.id,
          status: 'available'
        },
        defaults: {
          user_id: user.id,
          coupon_id: coupon.id,
          status: 'available'
        }
      });
      userCoupons.push(userCoupon);
      console.log(`✅ User Coupon assigned: ${coupon.title} (UserCoupon ID: ${userCoupon.id})`);
    }

    // 4. 测试 /list 接口 (通过 Service 直接测试)
    console.log('\n--- Testing /list endpoint logic ---');
    const couponList = await getCouponListService(user.id, 'available');
    console.log('Available coupons count:', couponList.coupons.length);
    console.log('First coupon details:', JSON.stringify(couponList.coupons[0], null, 2));

    // 5. 创建一个测试订单以便测试 /use
    console.log('\n--- Preparing for /use test ---');
    // 获取或创建一个现有的酒店和房型
    let hotel = await Hotel.findOne();
    if (!hotel) {
      hotel = await Hotel.create({
        hotel_name_cn: '测试酒店',
        hotel_name_en: 'Test Hotel',
        star_rating: 5,
        opening_date: '2020-01-01',
        phone: '123456789',
        description: '测试描述',
        status: 'published',
        created_by: user.id
      });
      console.log(`✅ Test hotel created: ${hotel.id}`);
    }

    let roomType = await RoomType.findOne({ where: { hotel_id: hotel.id } });
    if (!roomType) {
      roomType = await RoomType.create({
        hotel_id: hotel.id,
        room_type_name: '测试房型',
        bed_type: 'king',
        area: 30
      });
      console.log(`✅ Test room type created: ${roomType.id}`);
    }

    const booking = await Booking.create({
      user_id: user.id,
      hotel_id: hotel.id,
      hotel_name: hotel.hotel_name_cn,
      room_type_id: roomType.id,
      room_type_name: roomType.room_type_name,
      check_in_date: now,
      check_out_date: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      total_price: 200.00,
      original_total_price: 200.00,
      status: 'pending',
      contact_name: 'Test',
      contact_phone: user.phone,
      booked_at: now
    });
    console.log(`✅ Test booking created: ${booking.id} (Total: ${booking.total_price})`);

    // 6. 测试 /use 接口 (使用第一个优惠券)
    console.log('\n--- Testing /use endpoint logic ---');
    const testCoupon = userCoupons[0];
    const useResult = await useCouponService(user.id, testCoupon.id, booking.id);
    console.log('Use coupon result:', JSON.stringify(useResult, null, 2));

    // 7. 验证订单状态和价格
    const updatedBooking = await Booking.findByPk(booking.id);
    console.log('\n--- Final Verification ---');
    console.log(`Original Price: 200.00`);
    console.log(`Discount Amount: ${updatedBooking.discount_amount}`);
    console.log(`New Total Price: ${updatedBooking.total_price}`);
    console.log(`Booking Status: ${updatedBooking.status}`);

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await require('../src/models').sequelize.close();
    console.log('\n🔌 Connection closed.');
  }
}

testCouponFlow();
