const http = require('http');

// 测试获取城市列表
const testCityList = () => {
  console.log('=== 测试获取城市列表 ===');
  const req = http.request({
    hostname: 'localhost',
    port: 5050,
    path: '/mobile/city/list',
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const response = JSON.parse(data);
      console.log('City List Response:', JSON.stringify(response, null, 2));
    });
  });

  req.on('error', (error) => console.error('请求失败:', error.message));
  req.end();
};

// 测试获取热门城市
const testHotCities = () => {
  console.log('\n=== 测试获取热门城市 ===');
  const req = http.request({
    hostname: 'localhost',
    port: 5050,
    path: '/mobile/city/list?type=hot',
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const response = JSON.parse(data);
      console.log('Hot Cities Response:', JSON.stringify(response, null, 2));
    });
  });

  req.on('error', (error) => console.error('请求失败:', error.message));
  req.end();
};

// 测试搜索城市
const testSearchCity = () => {
  console.log('\n=== 测试搜索城市 ===');
  const encodedKeyword = encodeURIComponent('北京');
  const req = http.request({
    hostname: 'localhost',
    port: 5050,
    path: `/mobile/city/list?type=search&keyword=${encodedKeyword}`,
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const response = JSON.parse(data);
      console.log('Search City Response:', JSON.stringify(response, null, 2));
    });
  });

  req.on('error', (error) => console.error('请求失败:', error.message));
  req.end();
};

// 执行测试
testCityList();
testHotCities();
testSearchCity();