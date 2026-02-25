const {
  sequelize,
  User,
  Hotel,
  RoomType,
  Booking,
  Favorite,
  HotelReview
} = require('../src/models');
const bcrypt = require('bcryptjs');

const TEST_USER_ID = '872b90ec-2458-431f-a5ff-4cbe0a154430';
const TEST_USER_PHONE = '19883202629';
const TEST_USER_PASSWORD = '123456';

const testHotelData = [
  {
    hotel_name_cn: '测试酒店-朝阳店',
    hotel_name_en: 'Test Hotel Chaoyang',
    star_rating: 3,
    rating: 0,
    review_count: 0,
    description: '测试酒店朝阳店，适合接口测试使用。',
    phone: '010-10000001',
    opening_date: '2022-01-01',
    nearby_info: '朝阳公园附近',
    main_image_url: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=test%20hotel%20chaoyang%20branch&image_size=landscape_4_3'
    ],
    tags: ['测试', '商户'],
    location_info: {
      formatted_address: '北京市朝阳区测试路1号',
      country: '中国',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      street: '测试路',
      number: '1号',
      location: '116.500001,39.900001'
    },
    status: 'draft',
    created_by: TEST_USER_ID
  },
  {
    hotel_name_cn: '测试酒店-海淀店',
    hotel_name_en: 'Test Hotel Haidian',
    star_rating: 4,
    rating: 0,
    review_count: 0,
    description: '测试酒店海淀店，适合接口筛选测试。',
    phone: '010-10000002',
    opening_date: '2022-02-01',
    nearby_info: '中关村附近',
    main_image_url: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=test%20hotel%20haidian%20branch&image_size=landscape_4_3'
    ],
    tags: ['测试', '审核中'],
    location_info: {
      formatted_address: '北京市海淀区测试街2号',
      country: '中国',
      province: '北京市',
      city: '北京市',
      district: '海淀区',
      street: '测试街',
      number: '2号',
      location: '116.300002,39.950002'
    },
    status: 'pending',
    created_by: TEST_USER_ID
  },
  {
    hotel_name_cn: '测试酒店-已通过',
    hotel_name_en: 'Test Hotel Approved',
    star_rating: 5,
    rating: 0,
    review_count: 0,
    description: '测试酒店已通过，适合状态筛选。',
    phone: '010-10000003',
    opening_date: '2022-03-01',
    nearby_info: '国贸附近',
    main_image_url: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=test%20hotel%20approved&image_size=landscape_4_3'
    ],
    tags: ['测试', '已通过'],
    location_info: {
      formatted_address: '北京市朝阳区国贸测试路3号',
      country: '中国',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      street: '国贸测试路',
      number: '3号',
      location: '116.450003,39.910003'
    },
    status: 'approved',
    created_by: TEST_USER_ID
  },
  {
    hotel_name_cn: '测试酒店-已拒绝',
    hotel_name_en: 'Test Hotel Rejected',
    star_rating: 2,
    rating: 0,
    review_count: 0,
    description: '测试酒店已拒绝，适合状态筛选。',
    phone: '010-10000004',
    opening_date: '2022-04-01',
    nearby_info: '望京附近',
    main_image_url: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=test%20hotel%20rejected&image_size=landscape_4_3'
    ],
    tags: ['测试', '已拒绝'],
    location_info: {
      formatted_address: '北京市朝阳区望京测试路4号',
      country: '中国',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      street: '望京测试路',
      number: '4号',
      location: '116.470004,39.980004'
    },
    status: 'rejected',
    created_by: TEST_USER_ID
  }
];

const testHotelNames = testHotelData.map((hotel) => hotel.hotel_name_cn);

const getTestHotels = (hotels) => testHotelNames
  .map((name) => hotels.find((hotel) => hotel.hotel_name_cn === name))
  .filter(Boolean);

async function seedTestUser() {
  const testUserPassword = await bcrypt.hash(TEST_USER_PASSWORD, 10);
  const [testUser] = await User.findOrCreate({
    where: { id: TEST_USER_ID },
    defaults: {
      id: TEST_USER_ID,
      phone: TEST_USER_PHONE,
      password: testUserPassword,
      role: 'merchant',
      nickname: '测试商户',
      login_count: 0
    }
  });

  if (testUser.phone !== TEST_USER_PHONE || testUser.role !== 'merchant') {
    await testUser.update({
      phone: TEST_USER_PHONE,
      password: testUserPassword,
      role: 'merchant'
    });
  }
}

async function seedTestHotels() {
  for (const hotel of testHotelData) {
    await Hotel.findOrCreate({
      where: { hotel_name_cn: hotel.hotel_name_cn },
      defaults: hotel
    });
  }
}

async function seedTestRoomTypes() {
  const hotels = await Hotel.findAll();
  const testHotels = getTestHotels(hotels);
  const roomTypes = [];

  for (const testHotel of testHotels) {
    const [roomType] = await RoomType.findOrCreate({
      where: { hotel_id: testHotel.id, room_type_name: '标准间' },
      defaults: {
        hotel_id: testHotel.id,
        room_type_name: '标准间',
        bed_type: 'queen',
        area: 28,
        description: '测试酒店标准间，适合接口测试。',
        room_image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=test%20hotel%20standard%20room&image_size=landscape_4_3'
      }
    });
    roomTypes.push(roomType);
  }

  return roomTypes;
}

async function seedTestBookings() {
  const users = await User.findAll({ where: { role: 'mobile' } });
  const hotels = await Hotel.findAll();
  const roomTypes = await RoomType.findAll();
  const testHotels = getTestHotels(hotels);
  const roomTypeByHotelId = (hotelId) => roomTypes.find((roomType) => roomType.hotel_id === hotelId);

  const bookings = [];

  if (users[0] && testHotels[0]) {
    const roomType = roomTypeByHotelId(testHotels[0].id);
    if (roomType) {
      bookings.push({
        user_id: users[0].id,
        hotel_id: testHotels[0].id,
        hotel_name: testHotels[0].hotel_name_cn,
        room_type_id: roomType.id,
        room_type_name: roomType.room_type_name,
        check_in_date: '2026-03-01',
        check_out_date: '2026-03-03',
        total_price: 588.00,
        original_total_price: 688.00,
        discount_amount: 100.00,
        currency: 'CNY',
        status: 'paid',
        contact_name: '测试用户',
        contact_phone: '13800138001',
        special_requests: null,
        booking_token: 'token_test_001',
        order_number: 'ORD20260301001',
        location_info: testHotels[0].location_info,
        booked_at: new Date(),
        paid_at: new Date()
      });
    }
  }

  if (users[1] && testHotels[1]) {
    const roomType = roomTypeByHotelId(testHotels[1].id);
    if (roomType) {
      bookings.push({
        user_id: users[1].id,
        hotel_id: testHotels[1].id,
        hotel_name: testHotels[1].hotel_name_cn,
        room_type_id: roomType.id,
        room_type_name: roomType.room_type_name,
        check_in_date: '2026-03-05',
        check_out_date: '2026-03-06',
        total_price: 268.00,
        original_total_price: 268.00,
        discount_amount: null,
        currency: 'CNY',
        status: 'completed',
        contact_name: '测试用户2',
        contact_phone: '13800138002',
        special_requests: '高楼层',
        booking_token: 'token_test_002',
        order_number: 'ORD20260305002',
        location_info: testHotels[1].location_info,
        booked_at: new Date(),
        paid_at: new Date()
      });
    }
  }

  if (users[0] && testHotels[2]) {
    const roomType = roomTypeByHotelId(testHotels[2].id);
    if (roomType) {
      bookings.push({
        user_id: users[0].id,
        hotel_id: testHotels[2].id,
        hotel_name: testHotels[2].hotel_name_cn,
        room_type_id: roomType.id,
        room_type_name: roomType.room_type_name,
        check_in_date: '2026-03-10',
        check_out_date: '2026-03-12',
        total_price: 888.00,
        original_total_price: 988.00,
        discount_amount: 100.00,
        currency: 'CNY',
        status: 'paid',
        contact_name: '测试用户',
        contact_phone: '13800138001',
        special_requests: '靠窗',
        booking_token: 'token_test_003',
        order_number: 'ORD20260310003',
        location_info: testHotels[2].location_info,
        booked_at: new Date(),
        paid_at: new Date()
      });
    }
  }

  for (const booking of bookings) {
    await Booking.findOrCreate({
      where: { order_number: booking.order_number },
      defaults: booking
    });
  }
}

async function seedTestFavorites() {
  const users = await User.findAll({ where: { role: 'mobile' } });
  const hotels = await Hotel.findAll();
  const testHotels = getTestHotels(hotels);
  const favorites = [];

  if (users[0] && testHotels[0]) {
    favorites.push({ user_id: users[0].id, hotel_id: testHotels[0].id });
  }

  if (users[1] && testHotels[1]) {
    favorites.push({ user_id: users[1].id, hotel_id: testHotels[1].id });
  }

  if (users[0] && testHotels[2]) {
    favorites.push({ user_id: users[0].id, hotel_id: testHotels[2].id });
  }

  for (const favorite of favorites) {
    await Favorite.findOrCreate({
      where: { user_id: favorite.user_id, hotel_id: favorite.hotel_id },
      defaults: favorite
    });
  }
}

async function seedTestReviews() {
  const users = await User.findAll({ where: { role: 'mobile' } });
  const hotels = await Hotel.findAll();
  const testHotels = getTestHotels(hotels);
  const reviews = [];

  if (users[0] && testHotels[0]) {
    reviews.push({
      hotel_id: testHotels[0].id,
      user_id: users[0].id,
      room_type_id: null,
      booking_id: null,
      rating: 4.2,
      content: '测试酒店朝阳店体验不错，位置便利。',
      images: null,
      is_anonymous: false
    });
  }

  if (users[1] && testHotels[1]) {
    reviews.push({
      hotel_id: testHotels[1].id,
      user_id: users[1].id,
      room_type_id: null,
      booking_id: null,
      rating: 3.8,
      content: '测试酒店海淀店环境安静，适合商务出行。',
      images: null,
      is_anonymous: true
    });
  }

  if (users[0] && testHotels[2]) {
    reviews.push({
      hotel_id: testHotels[2].id,
      user_id: users[0].id,
      room_type_id: null,
      booking_id: null,
      rating: 4.6,
      content: '已通过酒店设施完善，服务响应快。',
      images: null,
      is_anonymous: false
    });
  }

  if (users[1] && testHotels[3]) {
    reviews.push({
      hotel_id: testHotels[3].id,
      user_id: users[1].id,
      room_type_id: null,
      booking_id: null,
      rating: 2.9,
      content: '已拒绝酒店需要改进服务细节。',
      images: null,
      is_anonymous: true
    });
  }

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
}

async function seedTestHotelData() {
  await seedTestUser();
  await seedTestHotels();
  await seedTestRoomTypes();
  await seedTestBookings();
  await seedTestFavorites();
  await seedTestReviews();
}

async function run() {
  try {
    await sequelize.authenticate();
    await seedTestHotelData();
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  run();
}

module.exports = {
  seedTestHotelData,
  TEST_USER_ID,
  TEST_USER_PHONE
};
