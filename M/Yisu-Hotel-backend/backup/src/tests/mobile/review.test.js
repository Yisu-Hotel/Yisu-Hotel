const http = require('http');

// 测试获取酒店评价列表
const testGetHotelReviews = () => {
  console.log('=== 测试获取酒店评价列表 ===');
  const req = http.request({
    hostname: 'localhost',
    port: 5050,
    path: '/mobile/review/hotel/1/list',
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const response = JSON.parse(data);
      console.log('Get Hotel Reviews Response:', JSON.stringify(response, null, 2));
    });
  });

  req.on('error', (error) => console.error('请求失败:', error.message));
  req.end();
};

// 测试提交酒店评价
const testSubmitHotelReview = () => {
  console.log('\n=== 测试提交酒店评价 ===');
  const postData = JSON.stringify({
    hotel_id: '1',
    rating: 5,
    content: '酒店非常好，服务周到，房间干净整洁。地理位置优越，交通便利。下次还会选择这家酒店！',
    images: [
      'https://example.com/review1.jpg',
      'https://example.com/review2.jpg'
    ],
    is_anonymous: false
  });

  const req = http.request({
    hostname: 'localhost',
    port: 5050,
    path: '/mobile/review/submit',
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNTQxN2NkM2EtNGVjOS00Zjk0LTgzYzctYjIxNGU5ZGQ3NmRhIiwicGhvbmUiOiIxODU5NTg5MDk4NyIsInJvbGUiOiJtb2JpbGUiLCJpYXQiOjE3NzA5NjQ5NzEsImV4cCI6MTc3MDk3MjE3MX0.LsWP3iuIH9cvREbdKftDRX2R-D3JYiIJA1SGxKgtxvg'
    }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const response = JSON.parse(data);
      console.log('Submit Hotel Review Response:', JSON.stringify(response, null, 2));
    });
  });

  req.on('error', (error) => console.error('请求失败:', error.message));
  req.write(postData);
  req.end();
};

// 测试获取评价统计
const testGetReviewStats = () => {
  console.log('\n=== 测试获取评价统计 ===');
  const req = http.request({
    hostname: 'localhost',
    port: 5050,
    path: '/mobile/review/hotel/1/stats',
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const response = JSON.parse(data);
      console.log('Get Review Stats Response:', JSON.stringify(response, null, 2));
    });
  });

  req.on('error', (error) => console.error('请求失败:', error.message));
  req.end();
};

// 执行测试
testGetHotelReviews();
testSubmitHotelReview();
testGetReviewStats();
