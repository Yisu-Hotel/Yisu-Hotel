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
  path: '/admin/hotel/audit-list?page=1&page_size=2&status=pending',
  method: 'GET',
  headers: { Authorization: `Bearer ${token}` }
});

const batchAudit = (token, payload) => request({
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: '/admin/hotel/batch-audit',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }
}, payload);

const run = async () => {
  try {
    const phone = process.env.ADMIN_PHONE || '15928077855';
    const password = process.env.ADMIN_PASSWORD || '123456';
    const loginResult = await login(phone, password);
    console.log('登录结果:');
    console.log(JSON.stringify(loginResult, null, 2));

    const token = loginResult?.data?.token;
    if (!token) {
      console.log('登录失败，无法继续测试批量审批');
      return;
    }

    const role = loginResult?.data?.user?.role;
    if (role !== 'admin') {
      const noAuthResult = await batchAudit(token, { hotel_ids: [], status: 'approved' });
      console.log('非管理员访问结果:');
      console.log(JSON.stringify(noAuthResult, null, 2));
      return;
    }

    const listResult = await getAuditList(token);
    console.log('审核列表结果:');
    console.log(JSON.stringify(listResult, null, 2));

    const hotelIds = listResult?.data?.list?.map((item) => item.hotel_id).filter(Boolean) || [];
    if (hotelIds.length === 0) {
      console.log('无待审核酒店，跳过成功用例');
    } else {
      const approveResult = await batchAudit(token, { hotel_ids: hotelIds, status: 'approved' });
      console.log('批量审批通过结果:');
      console.log(JSON.stringify(approveResult, null, 2));
    }

    const invalidIdResult = await batchAudit(token, { hotel_ids: ['invalid-id'], status: 'approved' });
    console.log('批量审批结果-非法ID:');
    console.log(JSON.stringify(invalidIdResult, null, 2));

    const rejectNoReasonResult = await batchAudit(token, { hotel_ids: hotelIds.slice(0, 1), status: 'rejected' });
    console.log('批量审批结果-驳回无原因:');
    console.log(JSON.stringify(rejectNoReasonResult, null, 2));
  } catch (error) {
    console.error('测试失败:', error.message);
  }
};

run();
