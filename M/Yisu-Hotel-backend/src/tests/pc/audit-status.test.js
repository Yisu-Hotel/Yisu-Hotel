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
}, { phone: '19883202629', password: '123456' });

const getAuditStatus = (token, hotelId) => request({
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: `/hotel/audit-status/${hotelId}`,
  method: 'GET',
  headers: token ? { Authorization: `Bearer ${token}` } : undefined
});

const verifyDescOrder = (items) => {
  const times = items
    .map((item) => item.audited_at)
    .filter(Boolean)
    .map((value) => new Date(value).getTime());
  if (times.length < 2) return true;
  for (let i = 1; i < times.length; i += 1) {
    if (times[i] > times[i - 1]) {
      return false;
    }
  }
  return true;
};

const run = async () => {
  const testHotelId = '046a49a8-cefd-4a27-b3d4-96b1388a7efd';
  
  try {
    const loginResult = await login();
    console.log('登录结果:');
    console.log(JSON.stringify(loginResult, null, 2));

    if (loginResult.code !== 0 || !loginResult.data || !loginResult.data.token) {
      console.log('登录失败，无法继续测试审核状态');
      return;
    }

    const auditResult = await getAuditStatus(loginResult.data.token, testHotelId);
    console.log('审核状态结果:');
    console.log(JSON.stringify(auditResult, null, 2));
    if (!Array.isArray(auditResult.data)) {
      console.error('审核状态结果 data 不是数组');
      process.exitCode = 1;
    } else if (!verifyDescOrder(auditResult.data)) {
      console.error('审核状态结果未按审核时间倒序排列');
      process.exitCode = 1;
    }

    const invalidResult = await getAuditStatus(loginResult.data.token, 'invalid-id');
    console.log('审核状态结果-非法ID:');
    console.log(JSON.stringify(invalidResult, null, 2));
    if (invalidResult.code !== 4009) {
      process.exitCode = 1;
    }

    const missingResult = await getAuditStatus(loginResult.data.token, '00000000-0000-0000-0000-000000000000');
    console.log('审核状态结果-不存在酒店:');
    console.log(JSON.stringify(missingResult, null, 2));
    if (![4010, 4011].includes(missingResult.code)) {
      process.exitCode = 1;
    }

    const noTokenResult = await getAuditStatus('', testHotelId);
    console.log('审核状态结果-无Token:');
    console.log(JSON.stringify(noTokenResult, null, 2));
    if (noTokenResult.code !== 4008) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error('测试失败:', error.message);
    process.exitCode = 1;
  }
};

run();
