const http = require('http');

// 测试获取酒店周边信息
const testGetHotelNearbyInfo = () => {
  console.log('=== 测试获取酒店周边信息 ===');
  const req = http.request({
    hostname: 'localhost',
    port: 5050,
    path: '/mobile/nearby/hotel/1',
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const response = JSON.parse(data);
      console.log('Get Hotel Nearby Info Response:', JSON.stringify(response, null, 2));
    });
  });

  req.on('error', (error) => console.error('请求失败:', error.message));
  req.end();
};

// 测试获取周边景点
const testGetNearbyAttractions = () => {
  console.log('\n=== 测试获取周边景点 ===');
  const req = http.request({
    hostname: 'localhost',
    port: 5050,
    path: '/mobile/nearby/hotel/1/attractions',
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const response = JSON.parse(data);
      console.log('Get Nearby Attractions Response:', JSON.stringify(response, null, 2));
    });
  });

  req.on('error', (error) => console.error('请求失败:', error.message));
  req.end();
};

// 测试获取周边设施
const testGetNearbyFacilities = () => {
  console.log('\n=== 测试获取周边设施 ===');
  const req = http.request({
    hostname: 'localhost',
    port: 5050,
    path: '/mobile/nearby/hotel/1/facilities',
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const response = JSON.parse(data);
      console.log('Get Nearby Facilities Response:', JSON.stringify(response, null, 2));
    });
  });

  req.on('error', (error) => console.error('请求失败:', error.message));
  req.end();
};

// 测试获取周边交通
const testGetNearbyTransportation = () => {
  console.log('\n=== 测试获取周边交通 ===');
  const req = http.request({
    hostname: 'localhost',
    port: 5050,
    path: '/mobile/nearby/hotel/1/transportation',
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const response = JSON.parse(data);
      console.log('Get Nearby Transportation Response:', JSON.stringify(response, null, 2));
    });
  });

  req.on('error', (error) => console.error('请求失败:', error.message));
  req.end();
};

// 执行测试
testGetHotelNearbyInfo();
testGetNearbyAttractions();
testGetNearbyFacilities();
testGetNearbyTransportation();
