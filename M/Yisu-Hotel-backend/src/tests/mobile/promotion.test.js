const http = require('http');

// 测试获取新人优惠
const testGetNewUserPromotion = () => {
  console.log('=== 测试获取新人优惠 ===');
  const req = http.request({
    hostname: 'localhost',
    port: 5050,
    path: '/mobile/promotion/new-user',
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNTQxN2NkM2EtNGVjOS00Zjk0LTgzYzctYjIxNGU5ZGQ3NmRhIiwicGhvbmUiOiIxODU5NTg5MDk4NyIsInJvbGUiOiJtb2JpbGUiLCJpYXQiOjE3NzA5NjQ5NzEsImV4cCI6MTc3MDk3MjE3MX0.LsWP3iuIH9cvREbdKftDRX2R-D3JYiIJA1SGxKgtxvg'
    }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const response = JSON.parse(data);
      console.log('Get New User Promotion Response:', JSON.stringify(response, null, 2));
    });
  });

  req.on('error', (error) => console.error('请求失败:', error.message));
  req.end();
};

// 测试获取优惠券列表
const testGetPromotionList = () => {
  console.log('\n=== 测试获取优惠券列表 ===');
  const req = http.request({
    hostname: 'localhost',
    port: 5050,
    path: '/mobile/promotion/list',
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNTQxN2NkM2EtNGVjOS00Zjk0LTgzYzctYjIxNGU5ZGQ3NmRhIiwicGhvbmUiOiIxODU5NTg5MDk4NyIsInJvbGUiOiJtb2JpbGUiLCJpYXQiOjE3NzA5NjQ5NzEsImV4cCI6MTc3MDk3MjE3MX0.LsWP3iuIH9cvREbdKftDRX2R-D3JYiIJA1SGxKgtxvg'
    }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const response = JSON.parse(data);
      console.log('Get Promotion List Response:', JSON.stringify(response, null, 2));
    });
  });

  req.on('error', (error) => console.error('请求失败:', error.message));
  req.end();
};

// 执行测试
testGetNewUserPromotion();
testGetPromotionList();
