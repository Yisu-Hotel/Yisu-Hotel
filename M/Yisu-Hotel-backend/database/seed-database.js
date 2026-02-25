const { 
  User, 
  Hotel, 
  Facility, 
  Service, 
  HotelFacility, 
  HotelService, 
  HotelPolicy, 
  RoomType, 
  RoomFacility, 
  RoomService, 
  RoomPrice, 
  RoomTag, 
  RoomPolicy, 
  AuditLog, 
  HotelHistory, 
  UserProfile, 
  Favorite, 
  Booking, 
  Coupon, 
  UserCoupon, 
  VerificationCode, 
  UserThirdPartyAuth, 
  Banner, 
  City,
  HotelReview 
} = require('../src/models');

async function seedDatabase() {
  try {
    console.log('🔄 Connecting to database...');
    await require('../src/models').sequelize.authenticate();
    console.log('✅ Connected successfully!');

    console.log('\n🌱 Seeding database with sample data...');

    await seedUsers();
    await seedCities();
    await seedFacilities();
    await seedServices();
    await seedHotels();
    await seedRoomTypes();
    await seedBookings();
    await seedCoupons();
    await seedUserCoupons();
    await seedBanners();
    await seedVerificationCodes();
    await seedUserThirdPartyAuths();
    await seedFavorites();
    await seedAuditLogs();
    await seedHotelHistories();
    await seedHotelFacilities();
    await seedHotelServices();
    await seedHotelPolicies();
    await seedUserProfiles();
    await seedHotelReviews();

    console.log('\n✅ All sample data seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await require('../src/models').sequelize.close();
    console.log('\n🔌 Connection closed.');
  }
}

async function seedUsers() {
  console.log('\n📝 Seeding users...');
  const users = await User.findOrCreate({
    where: { phone: '13800138000' },
    defaults: {
      phone: '13800138000',
      password: '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgFLflJq9K6Y1u', // password123
      role: 'admin',
      nickname: '管理员',
      login_count: 10
    }
  });

  await User.findOrCreate({
    where: { phone: '13800138001' },
    defaults: {
      phone: '13800138001',
      password: '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgFLflJq9K6Y1u',
      role: 'merchant',
      nickname: '商户1',
      login_count: 5
    }
  });

  await User.findOrCreate({
    where: { phone: '13800138002' },
    defaults: {
      phone: '13800138002',
      password: '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgFLflJq9K6Y1u',
      role: 'mobile',
      nickname: '用户1',
      login_count: 3
    }
  });

  await User.findOrCreate({
    where: { phone: '13800138003' },
    defaults: {
      phone: '13800138003',
      password: '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgFLflJq9K6Y1u',
      role: 'mobile',
      nickname: '用户2',
      login_count: 2
    }
  });

  console.log('✓ Users seeded');
}

async function seedCities() {
  console.log('\n🏙️ Seeding cities...');
  
  const cities = [
    { id: 'beijing', city_name: '北京市', province: '北京市', latitude: 39.9042, longitude: 116.4074, sort: 1 },
    { id: 'shanghai', city_name: '上海市', province: '上海市', latitude: 31.2304, longitude: 121.4737, sort: 2 },
    { id: 'guangzhou', city_name: '广州市', province: '广东省', latitude: 23.1291, longitude: 113.2644, sort: 3 },
    { id: 'shenzhen', city_name: '深圳市', province: '广东省', latitude: 22.5431, longitude: 114.0579, sort: 4 },
    { id: 'hangzhou', city_name: '杭州市', province: '浙江省', latitude: 30.2741, longitude: 120.1551, sort: 5 }
  ];

  for (const city of cities) {
    await City.findOrCreate({
      where: { id: city.id },
      defaults: city
    });
  }

  console.log('✓ Cities seeded');
}

async function seedFacilities() {
  console.log('\n🛠️ Seeding facilities...');
  
  const facilities = [
    { id: 'wifi', name: '免费WiFi', category: '房间设施' },
    { id: 'parking', name: '免费停车场', category: '公共设施' },
    { id: 'air_conditioner', name: '空调', category: '房间设施' },
    { id: 'tv', name: '电视', category: '房间设施' },
    { id: 'minibar', name: '迷你吧', category: '房间设施' },
    { id: 'bathtub', name: '浴缸', category: '房间设施' },
    { id: 'workdesk', name: '办公桌', category: '房间设施' },
    { id: 'sofa', name: '沙发', category: '房间设施' },
    { id: 'gym', name: '健身房', category: '公共设施' },
    { id: 'swimming_pool', name: '游泳池', category: '公共设施' },
    { id: 'restaurant', name: '餐厅', category: '公共设施' },
    { id: 'breakfast', name: '早餐', category: '餐饮服务' }
  ];

  for (const facility of facilities) {
    await Facility.findOrCreate({
      where: { id: facility.id },
      defaults: facility
    });
  }

  console.log('✓ Facilities seeded');
}

async function seedServices() {
  console.log('\n🛎️ Seeding services...');
  
  const services = [
    { id: 'reception', name: '24小时前台', category: '前台服务' },
    { id: 'luggage', name: '行李寄存', category: '前台服务' },
    { id: 'laundry', name: '洗衣服务', category: '客房服务' },
    { id: 'taxi', name: '叫车服务', category: '前台服务' },
    { id: 'concierge', name: '礼宾服务', category: '前台服务' },
    { id: 'airport_transfer', name: '机场接送', category: '接送服务' },
    { id: 'room_service', name: '24小时客房服务', category: '客房服务' },
    { id: 'butler', name: '管家服务', category: '客房服务' }
  ];

  for (const service of services) {
    await Service.findOrCreate({
      where: { id: service.id },
      defaults: service
    });
  }

  console.log('✓ Services seeded');
}

async function seedHotels() {
  console.log('\n🏨 Seeding hotels...');
  
  const users = await User.findAll({ where: { role: ['merchant', 'admin'] } });
  
  const hotels = [
    {
      hotel_name_cn: '易宿酒店',
      hotel_name_en: 'Yisu Hotel',
      star_rating: 4,
      rating: 4.8,
      review_count: 120,
      description: '易宿酒店位于北京市朝阳区核心地段，交通便利，周边配套设施齐全。酒店拥有舒适的客房和完善的服务设施，是商务出行和休闲旅游的理想选择。',
      phone: '010-12345678',
      opening_date: '2020-01-01',
      nearby_info: '距离地铁站500米，周边有商场、餐厅',
      main_image_url: [
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20hotel%20exterior%20building%20architecture&image_size=landscape_4_3',
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hotel%20lobby%20interior%20modern%20design&image_size=landscape_4_3',
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hotel%20room%20interior%20comfortable%20bed&image_size=landscape_4_3'
      ],
      tags: ['亲子友好', '免费停车场', '含早餐'],
      location_info: {
        formatted_address: '北京市朝阳区阜通东大街6号',
        country: '中国',
        province: '北京市',
        city: '北京市',
        district: '朝阳区',
        street: '阜通东大街',
        number: '6号',
        location: '116.482086,39.990496'
      },
      status: 'approved',
      created_by: users[0].id
    },
    {
      hotel_name_cn: '阳光酒店',
      hotel_name_en: 'Sunshine Hotel',
      star_rating: 3,
      rating: 4.2,
      review_count: 85,
      description: '阳光酒店位于上海市浦东新区，环境优美，服务周到。',
      phone: '021-87654321',
      opening_date: '2019-06-15',
      nearby_info: '靠近陆家嘴金融中心',
      main_image_url: [
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=shanghai%20hotel%20modern%20exterior&image_size=landscape_4_3'
      ],
      tags: ['商务', '交通便利'],
      location_info: {
        formatted_address: '上海市浦东新区世纪大道100号',
        country: '中国',
        province: '上海市',
        city: '上海市',
        district: '浦东新区',
        street: '世纪大道',
        number: '100号',
        location: '121.5058,31.2397'
      },
      status: 'published',
      created_by: users[1]?.id || users[0].id
    },
    {
      hotel_name_cn: '海景酒店',
      hotel_name_en: 'Seaview Hotel',
      star_rating: 5,
      rating: 4.9,
      review_count: 200,
      description: '海景酒店位于深圳市南山区，面朝大海，风景优美。',
      phone: '0755-12345678',
      opening_date: '2021-03-01',
      nearby_info: '距离海滩100米',
      main_image_url: [
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=seaview%20hotel%20exterior%20ocean%20view&image_size=landscape_4_3'
      ],
      tags: ['海景', '豪华', '度假'],
      location_info: {
        formatted_address: '深圳市南山区滨海大道200号',
        country: '中国',
        province: '广东省',
        city: '深圳市',
        district: '南山区',
        street: '滨海大道',
        number: '200号',
        location: '113.9456,22.5432'
      },
      status: 'approved',
      created_by: users[0].id
    }
  ];

  for (const hotel of hotels) {
    await Hotel.findOrCreate({
      where: { hotel_name_cn: hotel.hotel_name_cn },
      defaults: hotel
    });
  }

  console.log('✓ Hotels seeded');
}

async function seedRoomTypes() {
  console.log('\n🛏️ Seeding room types...');
  
  const hotels = await Hotel.findAll();
  const roomTypesData = [
    {
      hotel_id: hotels[0].id,
      room_type_name: '大床房',
      bed_type: 'king',
      area: 35,
      description: '豪华大床房，配备舒适的大床，适合情侣或独自出行。房间宽敞明亮，装修现代，设施齐全。',
      room_image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=deluxe%20king%20bedroom%20hotel%20room&image_size=landscape_4_3'
    },
    {
      hotel_id: hotels[0].id,
      room_type_name: '双床房',
      bed_type: 'twin',
      area: 40,
      description: '舒适双床房，配备两张单人床，适合朋友或商务出行。房间布局合理，采光良好。',
      room_image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=twin%20beds%20hotel%20room%20comfortable&image_size=landscape_4_3'
    },
    {
      hotel_id: hotels[0].id,
      room_type_name: '套房',
      bed_type: 'king',
      area: 60,
      description: '豪华套房，配备独立客厅和卧室，适合家庭或商务接待。空间宽敞，设施豪华。',
      room_image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20hotel%20suite%20living%20room&image_size=landscape_4_3'
    },
    {
      hotel_id: hotels[1].id,
      room_type_name: '标准间',
      bed_type: 'queen',
      area: 30,
      description: '标准间，性价比高，适合商务出差。',
      room_image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=standard%20hotel%20room%20budget&image_size=landscape_4_3'
    }
  ];

  const roomTypes = [];
  for (const roomTypeData of roomTypesData) {
    const [roomType] = await RoomType.findOrCreate({
      where: { hotel_id: roomTypeData.hotel_id, room_type_name: roomTypeData.room_type_name },
      defaults: roomTypeData
    });
    roomTypes.push(roomType);
  }

  await seedRoomFacilities(roomTypes);
  await seedRoomServices(roomTypes);
  await seedRoomPrices(roomTypes);
  await seedRoomTags(roomTypes);
  await seedRoomPolicies(roomTypes);

  console.log('✓ Room types seeded');
}

async function seedRoomFacilities(roomTypes) {
  console.log('\n🛏️ Seeding room facilities...');
  
  const facilities = await Facility.findAll();
  
  const roomFacilitiesData = [
    { room_type_id: roomTypes[0].id, facility_id: 'wifi' },
    { room_type_id: roomTypes[0].id, facility_id: 'air_conditioner' },
    { room_type_id: roomTypes[0].id, facility_id: 'tv' },
    { room_type_id: roomTypes[0].id, facility_id: 'minibar' },
    { room_type_id: roomTypes[0].id, facility_id: 'bathtub' },
    { room_type_id: roomTypes[0].id, facility_id: 'workdesk' },
    { room_type_id: roomTypes[1].id, facility_id: 'wifi' },
    { room_type_id: roomTypes[1].id, facility_id: 'air_conditioner' },
    { room_type_id: roomTypes[1].id, facility_id: 'tv' },
    { room_type_id: roomTypes[1].id, facility_id: 'minibar' },
    { room_type_id: roomTypes[1].id, facility_id: 'workdesk' },
    { room_type_id: roomTypes[2].id, facility_id: 'wifi' },
    { room_type_id: roomTypes[2].id, facility_id: 'air_conditioner' },
    { room_type_id: roomTypes[2].id, facility_id: 'tv' },
    { room_type_id: roomTypes[2].id, facility_id: 'minibar' },
    { room_type_id: roomTypes[2].id, facility_id: 'bathtub' },
    { room_type_id: roomTypes[2].id, facility_id: 'workdesk' },
    { room_type_id: roomTypes[2].id, facility_id: 'sofa' }
  ];

  for (const rf of roomFacilitiesData) {
    await RoomFacility.findOrCreate({
      where: { room_type_id: rf.room_type_id, facility_id: rf.facility_id },
      defaults: rf
    });
  }

  console.log('✓ Room facilities seeded');
}

async function seedRoomServices(roomTypes) {
  console.log('\n🛎️ Seeding room services...');
  
  const services = await Service.findAll();
  
  const roomServicesData = [
    { room_type_id: roomTypes[0].id, service_id: 'airport_transfer' },
    { room_type_id: roomTypes[0].id, service_id: 'laundry' },
    { room_type_id: roomTypes[0].id, service_id: 'room_service' },
    { room_type_id: roomTypes[1].id, service_id: 'laundry' },
    { room_type_id: roomTypes[1].id, service_id: 'room_service' },
    { room_type_id: roomTypes[2].id, service_id: 'airport_transfer' },
    { room_type_id: roomTypes[2].id, service_id: 'laundry' },
    { room_type_id: roomTypes[2].id, service_id: 'room_service' },
    { room_type_id: roomTypes[2].id, service_id: 'butler' }
  ];

  for (const rs of roomServicesData) {
    await RoomService.findOrCreate({
      where: { room_type_id: rs.room_type_id, service_id: rs.service_id },
      defaults: rs
    });
  }

  console.log('✓ Room services seeded');
}

async function seedRoomPrices(roomTypes) {
  console.log('\n💰 Seeding room prices...');
  
  const prices = [
    { room_type_id: roomTypes[0].id, price_date: '2026-02-01', price: 299.00 },
    { room_type_id: roomTypes[0].id, price_date: '2026-02-02', price: 299.00 },
    { room_type_id: roomTypes[0].id, price_date: '2026-02-03', price: 399.00 },
    { room_type_id: roomTypes[1].id, price_date: '2026-02-01', price: 329.00 },
    { room_type_id: roomTypes[1].id, price_date: '2026-02-02', price: 329.00 },
    { room_type_id: roomTypes[1].id, price_date: '2026-02-03', price: 429.00 },
    { room_type_id: roomTypes[2].id, price_date: '2026-02-01', price: 599.00 },
    { room_type_id: roomTypes[2].id, price_date: '2026-02-02', price: 599.00 },
    { room_type_id: roomTypes[2].id, price_date: '2026-02-03', price: 699.00 },
    { room_type_id: roomTypes[3].id, price_date: '2026-02-01', price: 259.00 },
    { room_type_id: roomTypes[3].id, price_date: '2026-02-02', price: 259.00 },
    { room_type_id: roomTypes[3].id, price_date: '2026-02-03', price: 359.00 }
  ];

  for (const price of prices) {
    await RoomPrice.findOrCreate({
      where: { room_type_id: price.room_type_id, price_date: price.price_date },
      defaults: price
    });
  }

  console.log('✓ Room prices seeded');
}

async function seedRoomTags(roomTypes) {
  console.log('\n🏷️ Seeding room tags...');
  
  const tags = [
    { room_type_id: roomTypes[0].id, tag_name: '受欢迎' },
    { room_type_id: roomTypes[0].id, tag_name: '豪华' },
    { room_type_id: roomTypes[0].id, tag_name: '性价比高' },
    { room_type_id: roomTypes[1].id, tag_name: '舒适' },
    { room_type_id: roomTypes[1].id, tag_name: '商务' },
    { room_type_id: roomTypes[2].id, tag_name: '豪华' },
    { room_type_id: roomTypes[2].id, tag_name: '家庭' },
    { room_type_id: roomTypes[2].id, tag_name: '商务' },
    { room_type_id: roomTypes[3].id, tag_name: '标准' },
    { room_type_id: roomTypes[3].id, tag_name: '经济' }
  ];

  for (const tag of tags) {
    await RoomTag.findOrCreate({
      where: { room_type_id: tag.room_type_id, tag_name: tag.tag_name },
      defaults: tag
    });
  }

  console.log('✓ Room tags seeded');
}

async function seedRoomPolicies(roomTypes) {
  console.log('\n📋 Seeding room policies...');
  
  const policies = [
    {
      room_type_id: roomTypes[0].id,
      cancellation_policy: '入住前48小时可免费取消',
      payment_policy: '支持现金、信用卡、移动支付',
      children_policy: '12岁以下儿童可免费入住',
      pets_policy: '不允许携带宠物'
    },
    {
      room_type_id: roomTypes[1].id,
      cancellation_policy: '入住前48小时可免费取消',
      payment_policy: '支持现金、信用卡、移动支付',
      children_policy: '12岁以下儿童可免费入住',
      pets_policy: '不允许携带宠物'
    },
    {
      room_type_id: roomTypes[2].id,
      cancellation_policy: '入住前48小时可免费取消',
      payment_policy: '支持现金、信用卡、移动支付',
      children_policy: '12岁以下儿童可免费入住',
      pets_policy: '不允许携带宠物'
    },
    {
      room_type_id: roomTypes[3].id,
      cancellation_policy: '入住前24小时可免费取消',
      payment_policy: '支持现金、信用卡、移动支付',
      children_policy: '6岁以下儿童免费',
      pets_policy: '不允许携带宠物'
    }
  ];

  for (const policy of policies) {
    await RoomPolicy.findOrCreate({
      where: { room_type_id: policy.room_type_id },
      defaults: policy
    });
  }

  console.log('✓ Room policies seeded');
}

async function seedBookings() {
  console.log('\n📅 Seeding bookings...');
  
  const users = await User.findAll({ where: { role: 'mobile' } });
  const hotels = await Hotel.findAll();
  const roomTypes = await RoomType.findAll();
  const bookings = [
    {
      user_id: users[0].id,
      hotel_id: hotels[0].id,
      hotel_name: hotels[0].hotel_name_cn,
      room_type_id: roomTypes[0].id,
      room_type_name: roomTypes[0].room_type_name,
      check_in_date: '2026-02-01',
      check_out_date: '2026-02-03',
      total_price: 1198.00,
      original_total_price: 1298.00,
      discount_amount: 100.00,
      currency: 'CNY',
      status: 'paid',
      contact_name: '张三',
      contact_phone: '13800138001',
      special_requests: '需要无烟房',
      booking_token: 'token_001',
      order_number: 'ORD20260201001',
      location_info: hotels[0].location_info,
      booked_at: new Date(),
      paid_at: new Date()
    },
    {
      user_id: users[1].id,
      hotel_id: hotels[1].id,
      hotel_name: hotels[1].hotel_name_cn,
      room_type_id: roomTypes[1].id,
      room_type_name: roomTypes[1].room_type_name,
      check_in_date: '2026-02-05',
      check_out_date: '2026-02-07',
      total_price: 858.00,
      original_total_price: 858.00,
      discount_amount: null,
      currency: 'CNY',
      status: 'completed',
      contact_name: '李四',
      contact_phone: '13800138002',
      special_requests: null,
      booking_token: 'token_002',
      order_number: 'ORD20260205002',
      location_info: hotels[1].location_info,
      booked_at: new Date(),
      paid_at: new Date()
    }
  ];

  for (const booking of bookings) {
    await Booking.findOrCreate({
      where: { order_number: booking.order_number },
      defaults: booking
    });
  }

  console.log('✓ Bookings seeded');
}

async function seedCoupons() {
  console.log('\n🎟️ Seeding coupons...');
  
  const coupons = [
    {
      title: '新用户优惠券',
      description: '新用户专享优惠',
      discount_type: 'fixed',
      discount_value: 100.00,
      min_order_amount: 200.00,
      valid_from: '2024-01-01',
      valid_until: '2024-12-31',
      total_count: 1000,
      used_count: 150,
      is_new_user_only: true,
      rules: '仅限新用户首次使用'
    },
    {
      title: '节日优惠券',
      description: '春节期间专享优惠',
      discount_type: 'fixed',
      discount_value: 50.00,
      min_order_amount: 300.00,
      valid_from: '2024-01-01',
      valid_until: '2024-02-15',
      total_count: 500,
      used_count: 200,
      is_new_user_only: false,
      rules: '春节期间有效'
    },
    {
      title: '折扣优惠券',
      description: '全场8折优惠',
      discount_type: 'percentage',
      discount_value: 20.00,
      min_order_amount: 500.00,
      valid_from: '2024-01-01',
      valid_until: '2024-12-31',
      total_count: 2000,
      used_count: 800,
      is_new_user_only: false,
      rules: '全场通用'
    }
  ];

  for (const coupon of coupons) {
    await Coupon.findOrCreate({
      where: { title: coupon.title },
      defaults: coupon
    });
  }

  console.log('✓ Coupons seeded');
}

async function seedUserCoupons() {
  console.log('\n👤 Seeding user coupons...');
  
  const users = await User.findAll({ where: { role: 'mobile' } });
  const coupons = await Coupon.findAll();
  const bookings = await Booking.findAll();
  
  const userCoupons = [
    {
      user_id: users[0].id,
      coupon_id: coupons[0].id,
      booking_id: bookings[0].id,
      status: 'used',
      used_at: new Date()
    },
    {
      user_id: users[0].id,
      coupon_id: coupons[1].id,
      booking_id: bookings[1].id,
      status: 'used',
      used_at: new Date()
    },
    {
      user_id: users[0].id,
      coupon_id: coupons[2].id,
      booking_id: null,
      status: 'available',
      used_at: null
    },
    {
      user_id: users[1].id,
      coupon_id: coupons[0].id,
      booking_id: null,
      status: 'available',
      used_at: null
    }
  ];

  for (const userCoupon of userCoupons) {
    await UserCoupon.findOrCreate({
      where: { user_id: userCoupon.user_id, coupon_id: userCoupon.coupon_id },
      defaults: userCoupon
    });
  }

  console.log('✓ User coupons seeded');
}

async function seedBanners() {
  console.log('\n🖼️ Seeding banners...');
  
  const hotels = await Hotel.findAll();
  
  const banners = [
    {
      id: 'banner_001',
      image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hotel%20promotion%20banner%20spring%20festival&image_size=landscape_4_3',
      title: '春节特惠，低至 8 折',
      description: '精选酒店春节促销',
      target_type: 'hotel',
      target_id: hotels[0].id,
      sort: 1,
      start_time: new Date('2026-01-01T00:00:00Z'),
      end_time: new Date('2026-02-28T23:59:59Z'),
      is_active: true
    },
    {
      id: 'banner_002',
      image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=new%20user%20hotel%20discount%20banner&image_size=landscape_4_3',
      title: '新用户专享优惠',
      description: '首次预订立减 50 元',
      target_type: 'promotion',
      target_id: 'promo_001',
      sort: 2,
      start_time: new Date('2026-01-01T00:00:00Z'),
      end_time: new Date('2026-12-31T23:59:59Z'),
      is_active: true
    },
    {
      id: 'banner_003',
      image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=summer%20hotel%20promotion%20banner&image_size=landscape_4_3',
      title: '夏季特惠',
      description: '夏季酒店促销',
      target_type: 'url',
      url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hotel%20promotion%20page&image_size=landscape_4_3',
      sort: 3,
      start_time: new Date('2026-06-01T00:00:00Z'),
      end_time: new Date('2026-08-31T23:59:59Z'),
      is_active: true
    }
  ];

  for (const banner of banners) {
    await Banner.findOrCreate({
      where: { id: banner.id },
      defaults: banner
    });
  }

  console.log('✓ Banners seeded');
}

async function seedVerificationCodes() {
  console.log('\n🔢 Seeding verification codes...');
  
  const users = await User.findAll({ where: { role: 'mobile' } });
  
  const verificationCodes = [
    {
      phone: users[0].phone,
      code: '123456',
      type: 'register',
      expires_at: new Date(Date.now() + 5 * 60 * 1000),
      used: false
    },
    {
      phone: users[1].phone,
      code: '789012',
      type: 'login',
      expires_at: new Date(Date.now() + 5 * 60 * 1000),
      used: false
    }
  ];

  for (const vc of verificationCodes) {
    await VerificationCode.findOrCreate({
      where: { phone: vc.phone, code: vc.code },
      defaults: vc
    });
  }

  console.log('✓ Verification codes seeded');
}

async function seedUserThirdPartyAuths() {
  console.log('\n🔐 Seeding user third party auths...');
  
  const users = await User.findAll({ where: { role: 'mobile' } });
  
  const auths = [
    {
      user_id: users[0].id,
      provider: 'wechat',
      open_id: 'wx_openid_001',
      nickname: '微信用户1',
      avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20avatar%20male%20default&image_size=square'
    },
    {
      user_id: users[1].id,
      provider: 'alipay',
      open_id: 'ali_openid_001',
      nickname: '支付宝用户1',
      avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20avatar%20female%20default&image_size=square'
    }
  ];

  for (const auth of auths) {
    await UserThirdPartyAuth.findOrCreate({
      where: { provider: auth.provider, open_id: auth.open_id },
      defaults: auth
    });
  }

  console.log('✓ User third party auths seeded');
}

async function seedFavorites() {
  console.log('\n❤️ Seeding favorites...');
  
  const users = await User.findAll({ where: { role: 'mobile' } });
  const hotels = await Hotel.findAll();
  const favorites = [
    {
      user_id: users[0].id,
      hotel_id: hotels[0].id
    },
    {
      user_id: users[0].id,
      hotel_id: hotels[1].id
    },
    {
      user_id: users[1].id,
      hotel_id: hotels[0].id
    }
  ];

  for (const favorite of favorites) {
    await Favorite.findOrCreate({
      where: { user_id: favorite.user_id, hotel_id: favorite.hotel_id },
      defaults: favorite
    });
  }

  console.log('✓ Favorites seeded');
}

async function seedAuditLogs() {
  console.log('\n📝 Seeding audit logs...');
  
  const hotels = await Hotel.findAll();
  const users = await User.findAll({ where: { role: 'admin' } });
  
  const auditLogs = [
    {
      hotel_id: hotels[0].id,
      auditor_id: users[0].id,
      result: 'approved',
      reject_reason: null
    },
    {
      hotel_id: hotels[1].id,
      auditor_id: users[0].id,
      result: 'rejected',
      reject_reason: '酒店信息不完整'
    }
  ];

  for (const auditLog of auditLogs) {
    await AuditLog.findOrCreate({
      where: { hotel_id: auditLog.hotel_id, auditor_id: auditLog.auditor_id },
      defaults: auditLog
    });
  }

  console.log('✓ Audit logs seeded');
}

async function seedHotelHistories() {
  console.log('\n📜 Seeding hotel histories...');
  
  const hotels = await Hotel.findAll();
  const users = await User.findAll({ where: { role: 'merchant' } });
  
  const histories = [
    {
      hotel_id: hotels[0].id,
      version: 1,
      modified_by: users[0].id,
      changes: {
        hotel_name_cn: { old: '旧酒店名', new: '易宿酒店' },
        description: { old: '旧描述', new: hotels[0].description }
      }
    },
    {
      hotel_id: hotels[1].id,
      version: 1,
      modified_by: users[0].id,
      changes: {
        star_rating: { old: 4, new: 3 }
      }
    }
  ];

  for (const history of histories) {
    await HotelHistory.findOrCreate({
      where: { hotel_id: history.hotel_id, version: history.version },
      defaults: history
    });
  }

  console.log('✓ Hotel histories seeded');
}

async function seedHotelFacilities() {
  console.log('\n🛠️ Seeding hotel facilities...');
  
  const hotels = await Hotel.findAll();
  const facilities = await Facility.findAll();
  
  const hotelFacilitiesData = [
    { hotel_id: hotels[0].id, facility_id: 'wifi' },
    { hotel_id: hotels[0].id, facility_id: 'parking' },
    { hotel_id: hotels[0].id, facility_id: 'gym' },
    { hotel_id: hotels[0].id, facility_id: 'swimming_pool' },
    { hotel_id: hotels[0].id, facility_id: 'restaurant' },
    { hotel_id: hotels[0].id, facility_id: 'breakfast' },
    { hotel_id: hotels[1].id, facility_id: 'wifi' },
    { hotel_id: hotels[1].id, facility_id: 'parking' },
    { hotel_id: hotels[2].id, facility_id: 'wifi' },
    { hotel_id: hotels[2].id, facility_id: 'gym' },
    { hotel_id: hotels[2].id, facility_id: 'swimming_pool' }
  ];

  for (const hf of hotelFacilitiesData) {
    await HotelFacility.findOrCreate({
      where: { hotel_id: hf.hotel_id, facility_id: hf.facility_id },
      defaults: hf
    });
  }

  console.log('✓ Hotel facilities seeded');
}

async function seedHotelServices() {
  console.log('\n🛎️ Seeding hotel services...');
  
  const hotels = await Hotel.findAll();
  const services = await Service.findAll();
  
  const hotelServicesData = [
    { hotel_id: hotels[0].id, service_id: 'reception' },
    { hotel_id: hotels[0].id, service_id: 'luggage' },
    { hotel_id: hotels[0].id, service_id: 'laundry' },
    { hotel_id: hotels[0].id, service_id: 'taxi' },
    { hotel_id: hotels[0].id, service_id: 'concierge' },
    { hotel_id: hotels[1].id, service_id: 'reception' },
    { hotel_id: hotels[1].id, service_id: 'luggage' },
    { hotel_id: hotels[2].id, service_id: 'reception' },
    { hotel_id: hotels[2].id, service_id: 'luggage' }
  ];

  for (const hs of hotelServicesData) {
    await HotelService.findOrCreate({
      where: { hotel_id: hs.hotel_id, service_id: hs.service_id },
      defaults: hs
    });
  }

  console.log('✓ Hotel services seeded');
}

async function seedHotelPolicies() {
  console.log('\n📋 Seeding hotel policies...');
  
  const hotels = await Hotel.findAll();
  
  const policies = [
    {
      hotel_id: hotels[0].id,
      cancellation_policy: '入住前24小时可免费取消',
      payment_policy: '支持现金、信用卡、移动支付',
      children_policy: '12岁以下儿童可免费入住',
      pets_policy: '不允许携带宠物'
    },
    {
      hotel_id: hotels[1].id,
      cancellation_policy: '入住前24小时可免费取消',
      payment_policy: '支持现金、信用卡、移动支付',
      children_policy: '12岁以下儿童可免费入住',
      pets_policy: '不允许携带宠物'
    },
    {
      hotel_id: hotels[2].id,
      cancellation_policy: '入住前24小时可免费取消',
      payment_policy: '支持现金、信用卡、移动支付',
      children_policy: '12岁以下儿童可免费入住',
      pets_policy: '不允许携带宠物'
    }
  ];

  for (const policy of policies) {
    await HotelPolicy.findOrCreate({
      where: { hotel_id: policy.hotel_id },
      defaults: policy
    });
  }

  console.log('✓ Hotel policies seeded');
}

async function seedUserProfiles() {
  console.log('\n👤 Seeding user profiles...');
  
  const users = await User.findAll({ where: { role: 'mobile' } });
  
  const profiles = [
    {
      user_id: users[0].id,
      nickname: '张三',
      gender: '男',
      birthday: '1990-01-01',
      avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20profile%20avatar%20male&image_size=square'
    },
    {
      user_id: users[1].id,
      nickname: '李四',
      gender: '女',
      birthday: '1995-06-15',
      avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20profile%20avatar%20female&image_size=square'
    }
  ];

  for (const profile of profiles) {
    await UserProfile.findOrCreate({
      where: { user_id: profile.user_id },
      defaults: profile
    });
  }

  console.log('✓ User profiles seeded');
}

async function seedHotelReviews() {
  console.log('\n⭐ Seeding hotel reviews...');
  
  const hotels = await Hotel.findAll();
  const users = await User.findAll({ where: { role: 'mobile' } });
  const roomTypes = await RoomType.findAll();
  const bookings = await Booking.findAll();
  const reviews = [
    {
      hotel_id: hotels[0].id,
      user_id: users[0].id,
      room_type_id: roomTypes[0].id,
      booking_id: bookings[0].id,
      rating: 5.0,
      content: '酒店非常好，服务周到，房间干净整洁。地理位置优越，交通便利。下次还会选择这家酒店！',
      images: [
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hotel%20review%20room%20photo&image_size=landscape_4_3',
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hotel%20review%20bathroom%20photo&image_size=landscape_4_3'
      ],
      is_anonymous: false
    },
    {
      hotel_id: hotels[0].id,
      user_id: users[1].id,
      room_type_id: roomTypes[1].id,
      booking_id: bookings[1].id,
      rating: 4.5,
      content: '酒店环境不错，但是早餐种类可以再丰富一些。总体来说还是满意的。',
      images: [
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hotel%20review%20lobby%20photo&image_size=landscape_4_3'
      ],
      is_anonymous: true
    },
    {
      hotel_id: hotels[1].id,
      user_id: users[0].id,
      room_type_id: roomTypes[3].id,
      booking_id: null,
      rating: 4.0,
      content: '性价比很高，房间宽敞明亮。前台服务态度很好，有问必答。',
      images: null,
      is_anonymous: false
    },
    {
      hotel_id: hotels[2].id,
      user_id: users[1].id,
      room_type_id: null,
      booking_id: null,
      rating: 4.8,
      content: '海景房视野开阔，风景优美。酒店设施齐全，服务周到。强烈推荐！',
      images: [
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=seaview%20hotel%20room%20ocean%20view&image_size=landscape_4_3',
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=seaview%20hotel%20pool%20ocean%20view&image_size=landscape_4_3',
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=seaview%20hotel%20bathroom%20ocean%20view&image_size=landscape_4_3'
      ],
      is_anonymous: false
    },
    {
      hotel_id: hotels[0].id,
      user_id: users[0].id,
      room_type_id: roomTypes[2].id,
      booking_id: null,
      rating: 3.5,
      content: '房间有点小，但是设施还算齐全。价格适中，适合短期住宿。',
      images: null,
      is_anonymous: true
    }
  ];

  for (const review of reviews) {
    await HotelReview.findOrCreate({
      where: { 
        hotel_id: review.hotel_id, 
        user_id: review.user_id, 
        booking_id: review.booking_id 
      },
      defaults: review
    });
  }

  console.log('✓ Hotel reviews seeded');
}

seedDatabase();
