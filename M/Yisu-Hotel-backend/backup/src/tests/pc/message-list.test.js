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

const getMessages = (token, page = 1) => request({
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: `/user/messages?page=${page}`,
  method: 'GET',
  headers: { Authorization: `Bearer ${token}` }
});

const run = async () => {
  try {
    const phone = process.env.MERCHANT_PHONE || '15928077855';
    const password = process.env.MERCHANT_PASSWORD || '123456';
    const loginResult = await login(phone, password);
    console.log('登录结果:');
    console.log(JSON.stringify(loginResult, null, 2));

    const token = loginResult?.data?.token;
    if (!token) {
      console.log('登录失败，无法继续测试消息列表');
      return;
    }

    const result = await getMessages(token, 1);
    console.log('消息列表结果:');
    console.log(JSON.stringify(result, null, 2));

    const invalidPageResult = await getMessages(token, 0);
    console.log('消息列表结果-非法分页:');
    console.log(JSON.stringify(invalidPageResult, null, 2));
  } catch (error) {
    console.error('测试失败:', error.message);
  }
};

run();
