const http = require('http');

// 测试搜索酒店
const testSearchHotels = () => {
  console.log('=== 测试搜索酒店 ===');
  const postData = JSON.stringify({
    city: '北京市',
    check_in: '2026-02-15',
    check_out: '2026-02-16',
    guests: 2,
    page: 1,
    size: 10
  });

  const req = http.request({
    hostname: 'localhost',
    port: 5050,
    path: '/mobile/hotel/search',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const response = JSON.parse(data);
      console.log('Search Hotels Response:', JSON.stringify(response, null, 2));
    });
  });

  req.on('error', (error) => console.error('请求失败:', error.message));
  req.write(postData);
  req.end();
};

// 测试获取酒店详情
const testGetHotelDetail = () => {
  console.log('\n=== 测试获取酒店详情 ===');
  const req = http.request({
    hostname: 'localhost',
    port: 5050,
    path: '/mobile/hotel/1',
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const response = JSON.parse(data);
      console.log('Get Hotel Detail Response:', JSON.stringify(response, null, 2));
    });
  });

  req.on('error', (error) => console.error('请求失败:', error.message));
  req.end();
};

// 测试获取酒店图片
const testGetHotelImages = () => {
  console.log('\n=== 测试获取酒店图片 ===');
  const req = http.request({
    hostname: 'localhost',
    port: 5050,
    path: '/mobile/hotel/1/images',
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const response = JSON.parse(data);
      console.log('Get Hotel Images Response:', JSON.stringify(response, null, 2));
    });
  });

  req.on('error', (error) => console.error('请求失败:', error.message));
  req.end();
};

// 测试获取可用日期和价格
const testGetHotelAvailability = () => {
  console.log('\n=== 测试获取可用日期和价格 ===');
  const req = http.request({
    hostname: 'localhost',
    port: 5050,
    path: '/mobile/hotel/1/availability?start_date=2026-02-15&end_date=2026-02-20',
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const response = JSON.parse(data);
      console.log('Get Hotel Availability Response:', JSON.stringify(response, null, 2));
    });
  });

  req.on('error', (error) => console.error('请求失败:', error.message));
  req.end();
};

// 测试计算价格
const testCalculatePrice = () => {
  console.log('\n=== 测试计算价格 ===');
  const postData = JSON.stringify({
    check_in: '2026-02-15',
    check_out: '2026-02-16',
    room_type_id: '1',
    guests: 2
  });

  const req = http.request({
    hostname: 'localhost',
    port: 5050,
    path: '/mobile/hotel/1/calculate-price',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const response = JSON.parse(data);
      console.log('Calculate Price Response:', JSON.stringify(response, null, 2));
    });
  });

  req.on('error', (error) => console.error('请求失败:', error.message));
  req.write(postData);
  req.end();
};

// 测试获取房型列表
const testGetRoomTypes = () => {
  console.log('\n=== 测试获取房型列表 ===');
  const req = http.request({
    hostname: 'localhost',
    port: 5050,
    path: '/mobile/hotel/1/room-types',
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const response = JSON.parse(data);
      console.log('Get Room Types Response:', JSON.stringify(response, null, 2));
    });
  });

  req.on('error', (error) => console.error('请求失败:', error.message));
  req.end();
};

// 测试获取房型详情
const testGetRoomTypeDetail = () => {
  console.log('\n=== 测试获取房型详情 ===');
  const req = http.request({
    hostname: 'localhost',
    port: 5050,
    path: '/mobile/hotel/1/room-types/1',
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const response = JSON.parse(data);
      console.log('Get Room Type Detail Response:', JSON.stringify(response, null, 2));
    });
  });

  req.on('error', (error) => console.error('请求失败:', error.message));
  req.end();
};

// 测试获取分享信息
const testGetShareInfo = () => {
  console.log('\n=== 测试获取分享信息 ===');
  const req = http.request({
    hostname: 'localhost',
    port: 5050,
    path: '/mobile/hotel/1/share',
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const response = JSON.parse(data);
      console.log('Get Share Info Response:', JSON.stringify(response, null, 2));
    });
  });

  req.on('error', (error) => console.error('请求失败:', error.message));
  req.end();
};

// 执行测试
testSearchHotels();
testGetHotelDetail();
testGetHotelImages();
testGetHotelAvailability();
testCalculatePrice();
testGetRoomTypes();
testGetRoomTypeDetail();
testGetShareInfo();
