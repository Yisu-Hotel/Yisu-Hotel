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

const login = (phone, password) => request({
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: '/auth/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, { phone, password });

const getAuditList = (token) => request({
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: '/admin/hotel/audit-list?page=1&page_size=1',
  method: 'GET',
  headers: { Authorization: `Bearer ${token}` }
});

const getAdminHotelDetail = (token, hotelId) => request({
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: `/admin/hotel/detail/${hotelId}`,
  method: 'GET',
  headers: { Authorization: `Bearer ${token}` }
});

const run = async () => {
  try {
    const phone = process.env.ADMIN_PHONE || '19883202629';
    const password = process.env.ADMIN_PASSWORD || '123456';
    const loginResult = await login(phone, password);
    console.log('登录结果:');
    console.log(JSON.stringify(loginResult, null, 2));

    const token = loginResult?.data?.token;
    if (!token) {
      console.log('登录失败，无法继续测试管理员酒店详情');
      return;
    }

    const role = loginResult?.data?.user?.role;
    if (role !== 'admin') {
      const noAuthResult = await getAdminHotelDetail(token, '550e8400-e29b-41d4-a716-446655440001');
      console.log('非管理员访问结果:');
      console.log(JSON.stringify(noAuthResult, null, 2));
      return;
    }

    const listResult = await getAuditList(token);
    console.log('审核列表结果:');
    console.log(JSON.stringify(listResult, null, 2));

    const hotelId = listResult?.data?.list?.[0]?.hotel_id;
    if (!hotelId) {
      console.log('未找到可用酒店ID，无法继续测试管理员酒店详情');
      return;
    }

    const detailResult = await getAdminHotelDetail(token, hotelId);
    console.log('管理员酒店详情结果:');
    console.log(JSON.stringify(detailResult, null, 2));

    const invalidResult = await getAdminHotelDetail(token, 'invalid-id');
    console.log('管理员酒店详情结果-非法ID:');
    console.log(JSON.stringify(invalidResult, null, 2));
  } catch (error) {
    console.error('测试失败:', error.message);
  }
};

run();
