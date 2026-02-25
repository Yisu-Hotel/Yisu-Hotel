const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const http = require('http');

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
}, { phone: '15928077855', password: '123456' });

const getHotelList = (token) => request({
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: '/hotel/list?page=1&size=1',
  method: 'GET',
  headers: { Authorization: `Bearer ${token}` }
});

const getHotelDetail = (token, hotelId) => request({
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: `/hotel/detail/${hotelId}`,
  method: 'GET',
  headers: { Authorization: `Bearer ${token}` }
});

const run = async () => {
  try {
    const loginResult = await login();
    console.log('登录结果:');
    console.log(JSON.stringify(loginResult, null, 2));

    if (loginResult.code !== 0 || !loginResult.data || !loginResult.data.token) {
      console.log('登录失败，无法继续测试酒店详情');
      return;
    }

    const listResult = await getHotelList(loginResult.data.token);
    console.log('酒店列表结果:');
    console.log(JSON.stringify(listResult, null, 2));

    const hotelId = listResult?.data?.list?.[0]?.hotel_id;
    if (!hotelId) {
      console.log('未找到可用酒店ID，无法继续测试酒店详情');
      return;
    }

    const detailResult = await getHotelDetail(loginResult.data.token, hotelId);
    console.log('酒店详情结果:');
    console.log(JSON.stringify(detailResult, null, 2));

    const invalidResult = await getHotelDetail(loginResult.data.token, 'invalid-id');
    console.log('酒店详情结果-非法ID:');
    console.log(JSON.stringify(invalidResult, null, 2));
  } catch (error) {
    console.error('测试失败:', error.message);
  }
};

run();
