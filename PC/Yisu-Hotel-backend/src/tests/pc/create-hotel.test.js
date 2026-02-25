const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const http = require('http');
const fs = require('fs');

const base64Image = fs.readFileSync(
  path.resolve(__dirname, '../../../image/新建 文本文档 (2).txt'),
  'utf8'
).trim();

const request = (options, body) => new Promise((resolve, reject) => {
  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(error);
      }
    });
  });
  req.on('error', reject);
  if (body) {
    req.write(JSON.stringify(body));
  }
  req.end();
});

const login = () => request({
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: '/auth/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, { phone: '19883202629', password: '123456' });

const createHotel = (token, body) => request({
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: '/hotel/create',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }
}, body);

const buildPayload = () => {
  const suffix = Date.now();
  return {
    hotel_name_cn: `测试酒店${suffix}`,
    hotel_name_en: `Test Hotel ${suffix}`,
    star_rating: 4,
    description: '测试酒店描述',
    phone: '010-12345678',
    opening_date: '2020-01-01',
    nearby_info: '距离地铁站500米',
    facilities: [
      { id: 'wifi', name: '免费WiFi' },
      { id: 'parking', name: '免费停车场' },
      { id: 'air_conditioner', name: '空调' },
      { id: 'tv', name: '电视' },
      { id: 'breakfast', name: '早餐' },
      { id: 'gym', name: '健身房' },
      { id: 'pool', name: '游泳池' },
      { id: 'restaurant', name: '餐厅' },
      { id: 'spa', name: 'SPA' },
      { id: 'laundry', name: '洗衣房' }
    ],
    services: [
      { id: 'reception', name: '24小时前台' },
      { id: 'luggage', name: '行李寄存' },
      { id: 'laundry', name: '洗衣服务' },
      { id: 'taxi', name: '叫车服务' },
      { id: 'concierge', name: '礼宾服务' },
      { id: 'room_service', name: '24小时客房服务' },
      { id: 'airport_transfer', name: '机场接送' },
      { id: 'butler', name: '管家服务' }
    ],
    policies: {
      cancellation: '入住前24小时可免费取消',
      payment: '支持现金、信用卡',
      children: '12岁以下儿童可免费入住',
      pets: '不允许携带宠物'
    },
    room_prices: {
      大床房: {
        bed_type: 'king',
        area: 35,
        description: '豪华大床房',
        facilities: [
          { id: 'free_wifi', name: '免费WiFi' },
          { id: 'air_conditioner', name: '空调' },
          { id: 'tv', name: '平板电视' },
          { id: 'minibar', name: '迷你吧' },
          { id: 'workdesk', name: '办公桌' }
        ],
        room_image_base64: base64Image,
        services: [
          { id: 'room_service', name: '24小时客房服务' },
          { id: 'laundry', name: '洗衣服务' }
        ],
        prices: {
          '2026-02-01': 299.00,
          '2026-02-02': 299.00
        }
      },
      双床房: {
        bed_type: 'twin',
        area: 40,
        description: '舒适双床房',
        facilities: [
          { id: 'free_wifi', name: '免费WiFi' },
          { id: 'air_conditioner', name: '空调' },
          { id: 'tv', name: '平板电视' },
          { id: 'minibar', name: '迷你吧' },
          { id: 'workdesk', name: '办公桌' }
        ],
        room_image_base64: base64Image,
        services: [
          { id: 'room_service', name: '24小时客房服务' },
          { id: 'laundry', name: '洗衣服务' }
        ],
        prices: {
          '2026-02-01': 329.00,
          '2026-02-02': 329.00
        }
      },
      套房: {
        bed_type: 'king',
        area: 60,
        description: '豪华套房',
        facilities: [
          { id: 'free_wifi', name: '免费WiFi' },
          { id: 'air_conditioner', name: '空调' },
          { id: 'tv', name: '平板电视' },
          { id: 'minibar', name: '迷你吧' },
          { id: 'bathtub', name: '浴缸' },
          { id: 'sofa', name: '沙发' }
        ],
        room_image_base64: base64Image,
        services: [
          { id: 'butler', name: '管家服务' },
          { id: 'airport_transfer', name: '机场接送' }
        ],
        prices: {
          '2026-02-01': 599.00,
          '2026-02-02': 599.00
        }
      },
      家庭房: {
        bed_type: 'queen',
        area: 50,
        description: '亲子家庭房',
        facilities: [
          { id: 'free_wifi', name: '免费WiFi' },
          { id: 'air_conditioner', name: '空调' },
          { id: 'tv', name: '平板电视' },
          { id: 'kids_bath', name: '儿童洗护用品' },
          { id: 'sofa', name: '沙发' }
        ],
        room_image_base64: base64Image,
        services: [
          { id: 'room_service', name: '24小时客房服务' },
          { id: 'luggage', name: '行李寄存' }
        ],
        prices: {
          '2026-02-01': 429.00,
          '2026-02-02': 429.00
        }
      },
      影音房: {
        bed_type: 'king',
        area: 45,
        description: '高清影音房',
        facilities: [
          { id: 'free_wifi', name: '免费WiFi' },
          { id: 'air_conditioner', name: '空调' },
          { id: 'projector', name: '投影仪' },
          { id: 'sound_system', name: '音响系统' },
          { id: 'minibar', name: '迷你吧' }
        ],
        room_image_base64: base64Image,
        services: [
          { id: 'room_service', name: '24小时客房服务' },
          { id: 'concierge', name: '礼宾服务' }
        ],
        prices: {
          '2026-02-01': 399.00,
          '2026-02-02': 399.00
        }
      }
    },
    main_image_url: [
    ],
    main_image_base64: [
      base64Image,
      base64Image,
      base64Image
    ],
    tags: ['亲子友好', '含早餐'],
    location_info: {
      formatted_address: '北京市朝阳区阜通东大街6号',
      country: '中国',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      street: '阜通东大街',
      number: '6号',
      location: '116.482086,39.990496'
    }
  };
};

const run = async () => {
  try {
    const loginResult = await login();
    console.log('登录结果:');
    console.log(JSON.stringify(loginResult, null, 2));

    if (loginResult.code !== 0 || !loginResult.data || !loginResult.data.token) {
      console.log('登录失败，无法继续创建酒店测试');
      return;
    }

    const payload = buildPayload();
    const createResult = await createHotel(loginResult.data.token, payload);
    console.log('创建酒店结果:');
    console.log(JSON.stringify(createResult, null, 2));

    const invalidResult = await createHotel(loginResult.data.token, { hotel_name_cn: '缺少必填项' });
    console.log('创建酒店结果-必填项缺失:');
    console.log(JSON.stringify(invalidResult, null, 2));
  } catch (error) {
    console.error('测试失败:', error.message);
  }
};

run();
