const http = require('http');

// 测试获取当前位置
const testGetCurrentLocation = () => {
  console.log('=== 测试获取当前位置 ===');
  const req = http.request({
    hostname: 'localhost',
    port: 5050,
    path: '/mobile/location/current',
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const response = JSON.parse(data);
      console.log('Get Current Location Response:', JSON.stringify(response, null, 2));
    });
  });

  req.on('error', (error) => console.error('请求失败:', error.message));
  req.end();
};

// 测试根据IP获取位置
const testGetLocationByIP = () => {
  console.log('\n=== 测试根据IP获取位置 ===');
  const req = http.request({
    hostname: 'localhost',
    port: 5050,
    path: '/mobile/location/ip',
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const response = JSON.parse(data);
      console.log('Get Location By IP Response:', JSON.stringify(response, null, 2));
    });
  });

  req.on('error', (error) => console.error('请求失败:', error.message));
  req.end();
};

// 测试获取附近酒店
const testGetNearbyHotels = () => {
  console.log('\n=== 测试获取附近酒店 ===');
  const postData = JSON.stringify({
    latitude: 39.9042,
    longitude: 116.4074,
    radius: 5000,
    page: 1,
    size: 10
  });

  const req = http.request({
    hostname: 'localhost',
    port: 5050,
    path: '/mobile/location/nearby-hotels',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const response = JSON.parse(data);
      console.log('Get Nearby Hotels Response:', JSON.stringify(response, null, 2));
    });
  });

  req.on('error', (error) => console.error('请求失败:', error.message));
  req.write(postData);
  req.end();
};

// 执行测试
testGetCurrentLocation();
testGetLocationByIP();
testGetNearbyHotels();
