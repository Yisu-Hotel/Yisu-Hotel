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

const buildQuery = (query) => {
  if (!query) {
    return 'page=1&size=20';
  }
  if (typeof query === 'string') {
    return query;
  }
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, value);
    }
  });
  return params.toString();
};

const getHotelList = (token, query) => request({
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: `/hotel/list?${buildQuery(query)}`,
  method: 'GET',
  headers: { Authorization: `Bearer ${token}` }
});

const run = async () => {
  try {
    const loginResult = await login();
    console.log('登录结果:');
    console.log(JSON.stringify(loginResult, null, 2));

    if (loginResult.code !== 0 || !loginResult.data || !loginResult.data.token) {
      console.log('登录失败，无法继续测试酒店列表');
      return;
    }

    const listResult = await getHotelList(loginResult.data.token);
    console.log('酒店列表结果:');
    console.log(JSON.stringify(listResult, null, 2));

    const approvedResult = await getHotelList(loginResult.data.token, {
      page: 1,
      size: 20,
      status: 'approved'
    });
    console.log('酒店列表结果-状态approved:');
    console.log(JSON.stringify(approvedResult, null, 2));

    const draftResult = await getHotelList(loginResult.data.token, {
      page: 1,
      size: 20,
      status: 'draft'
    });
    console.log('酒店列表结果-状态draft:');
    console.log(JSON.stringify(draftResult, null, 2));

    const keywordResult = await getHotelList(loginResult.data.token, {
      page: 1,
      size: 20,
      keyword: '朝阳'
    });
    console.log('酒店列表结果-关键词朝阳:');
    console.log(JSON.stringify(keywordResult, null, 2));

    const keywordNameResult = await getHotelList(loginResult.data.token, {
      page: 1,
      size: 20,
      keyword: '测试酒店'
    });
    console.log('酒店列表结果-关键词测试酒店:');
    console.log(JSON.stringify(keywordNameResult, null, 2));

    const statusKeywordResult = await getHotelList(loginResult.data.token, {
      page: 1,
      size: 20,
      status: 'approved',
      keyword: '测试酒店'
    });
    console.log('酒店列表结果-状态approved且关键词测试酒店:');
    console.log(JSON.stringify(statusKeywordResult, null, 2));
  } catch (error) {
    console.error('测试失败:', error.message);
  }
};

run();
