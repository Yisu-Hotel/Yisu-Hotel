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

const buildQuery = (params) => new URLSearchParams(params).toString();

const login = (phone, password) => request({
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: '/auth/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, { phone, password });

const getAuditList = (token, query) => request({
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: `/admin/hotel/audit-list?${buildQuery(query)}`,
  method: 'GET',
  headers: { Authorization: `Bearer ${token}` }
});

const run = async () => {
  try {
    const phone = process.env.ADMIN_PHONE || '15928077855';
    const password = process.env.ADMIN_PASSWORD || '123456';
    const loginResult = await login(phone, password);
    console.log('登录结果:');
    console.log(JSON.stringify(loginResult, null, 2));

    const token = loginResult?.data?.token;
    if (!token) {
      console.log('登录失败，无法继续测试审核列表');
      return;
    }

    const role = loginResult?.data?.user?.role;
    if (role !== 'admin') {
      const noAuthResult = await getAuditList(token, { page: 1, page_size: 10 });
      console.log('非管理员访问结果:');
      console.log(JSON.stringify(noAuthResult, null, 2));
      return;
    }

    const normalResult = await getAuditList(token, { page: 1, page_size: 10 });
    console.log('审核列表结果-默认:');
    console.log(JSON.stringify(normalResult, null, 2));

    const statusResult = await getAuditList(token, { page: 1, page_size: 10, status: 'pending' });
    console.log('审核列表结果-状态pending:');
    console.log(JSON.stringify(statusResult, null, 2));

    const dateResult = await getAuditList(token, { page: 1, page_size: 5, start_date: '2026-02-01', end_date: '2026-02-28' });
    console.log('审核列表结果-日期范围:');
    console.log(JSON.stringify(dateResult, null, 2));

    const keywordResult = await getAuditList(token, { page: 1, page_size: 10, keyword: '酒店' });
    console.log('审核列表结果-关键词:');
    console.log(JSON.stringify(keywordResult, null, 2));

    const invalidPageResult = await getAuditList(token, { page: 0, page_size: 10 });
    console.log('审核列表结果-非法分页:');
    console.log(JSON.stringify(invalidPageResult, null, 2));

    const invalidDateResult = await getAuditList(token, { page: 1, page_size: 10, start_date: '2026-02-30' });
    console.log('审核列表结果-非法日期:');
    console.log(JSON.stringify(invalidDateResult, null, 2));
  } catch (error) {
    console.error('测试失败:', error.message);
  }
};

run();
