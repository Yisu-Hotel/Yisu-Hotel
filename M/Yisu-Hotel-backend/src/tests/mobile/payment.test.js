const http = require('http');

// 测试创建支付
const testCreatePayment = () => {
  console.log('=== 测试创建支付 ===');
  const postData = JSON.stringify({
    booking_id: '1',
    amount: 399,
    payment_method: 'wechat'
  });

  const req = http.request({
    hostname: 'localhost',
    port: 5050,
    path: '/mobile/payment/create',
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
      console.log('Create Payment Response:', JSON.stringify(response, null, 2));
    });
  });

  req.on('error', (error) => console.error('请求失败:', error.message));
  req.write(postData);
  req.end();
};

// 测试初始化支付
const testInitiatePayment = () => {
  console.log('\n=== 测试初始化支付 ===');
  const postData = JSON.stringify({
    payment_id: '1',
    payment_method: 'wechat'
  });

  const req = http.request({
    hostname: 'localhost',
    port: 5050,
    path: '/mobile/payment/initiate',
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
      console.log('Initiate Payment Response:', JSON.stringify(response, null, 2));
    });
  });

  req.on('error', (error) => console.error('请求失败:', error.message));
  req.write(postData);
  req.end();
};

// 测试查询支付状态
const testQueryPaymentStatus = () => {
  console.log('\n=== 测试查询支付状态 ===');
  const req = http.request({
    hostname: 'localhost',
    port: 5050,
    path: '/mobile/payment/status/1',
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
      console.log('Query Payment Status Response:', JSON.stringify(response, null, 2));
    });
  });

  req.on('error', (error) => console.error('请求失败:', error.message));
  req.end();
};

// 测试获取支付历史
const testGetPaymentHistory = () => {
  console.log('\n=== 测试获取支付历史 ===');
  const req = http.request({
    hostname: 'localhost',
    port: 5050,
    path: '/mobile/payment/history',
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
      console.log('Get Payment History Response:', JSON.stringify(response, null, 2));
    });
  });

  req.on('error', (error) => console.error('请求失败:', error.message));
  req.end();
};

// 执行测试
testCreatePayment();
testInitiatePayment();
testQueryPaymentStatus();
testGetPaymentHistory();
