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

const deleteHotel = (token, hotelId) => request({
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: `/hotel/delete/${hotelId}`,
  method: 'DELETE',
  headers: { Authorization: `Bearer ${token}` }
});

const buildPayload = () => {
  const suffix = Date.now();
  return {
    hotel_name_cn: `删除测试酒店${suffix}`,
    hotel_name_en: `Delete Test Hotel ${suffix}`,
    star_rating: 4,
    description: '删除酒店测试描述',
    phone: '010-12345678',
    opening_date: '2020-01-01',
    nearby_info: '距离地铁站500米',
    save_as_draft: true,
    facilities: [
      { id: 'wifi', name: '免费WiFi' },
      { id: 'parking', name: '免费停车场' }
    ],
    services: [
      { id: 'reception', name: '24小时前台' }
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
          { id: 'air_conditioner', name: '空调' }
        ],
        room_image_base64: base64Image,
        services: [
          { id: 'room_service', name: '24小时客房服务' }
        ],
        prices: {
          '2026-02-01': 299.00,
          '2026-02-02': 299.00
        }
      }
    },
    main_image_base64: [
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
      console.log('登录失败，无法继续删除酒店测试');
      return;
    }

    const payload = buildPayload();
    const createResult = await createHotel(loginResult.data.token, payload);
    console.log('创建酒店结果:');
    console.log(JSON.stringify(createResult, null, 2));

    const hotelId = createResult?.data?.hotel_id;
    if (!hotelId) {
      console.log('未获取到酒店ID，无法继续删除测试');
      return;
    }

    const deleteResult = await deleteHotel(loginResult.data.token, hotelId);
    console.log('删除酒店结果:');
    console.log(JSON.stringify(deleteResult, null, 2));

    const deleteAgainResult = await deleteHotel(loginResult.data.token, hotelId);
    console.log('删除酒店结果-重复删除:');
    console.log(JSON.stringify(deleteAgainResult, null, 2));
  } catch (error) {
    console.error('测试失败:', error.message);
  }
};

run();
