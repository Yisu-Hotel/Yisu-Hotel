const http = require('http');

// 测试获取推荐酒店
const testGetRecommendedHotels = () => {
  console.log('=== 测试获取推荐酒店 ===');
  const req = http.request({
    hostname: 'localhost',
    port: 5050,
    path: '/mobile/home/recommended-hotels',
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const response = JSON.parse(data);
      console.log('Get Recommended Hotels Response:', JSON.stringify(response, null, 2));
    });
  });

  req.on('error', (error) => console.error('请求失败:', error.message));
  req.end();
};

// 测试获取热门活动
const testGetHotActivities = () => {
  console.log('\n=== 测试获取热门活动 ===');
  const req = http.request({
    hostname: 'localhost',
    port: 5050,
    path: '/mobile/home/hot-activities',
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const response = JSON.parse(data);
      console.log('Get Hot Activities Response:', JSON.stringify(response, null, 2));
    });
  });

  req.on('error', (error) => console.error('请求失败:', error.message));
  req.end();
};

// 测试获取首页数据
const testGetHomeData = () => {
  console.log('\n=== 测试获取首页数据 ===');
  const req = http.request({
    hostname: 'localhost',
    port: 5050,
    path: '/mobile/home/data',
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const response = JSON.parse(data);
      console.log('Get Home Data Response:', JSON.stringify(response, null, 2));
    });
  });

  req.on('error', (error) => console.error('请求失败:', error.message));
  req.end();
};

// 执行测试
testGetRecommendedHotels();
testGetHotActivities();
testGetHomeData();
