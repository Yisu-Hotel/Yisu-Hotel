const http = require('http');

// 测试获取用户信息
const testGetUserInfo = () => {
  console.log('=== 测试获取用户信息 ===');
  const req = http.request({
    hostname: 'localhost',
    port: 5050,
    path: '/mobile/user/info',
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
      console.log('Get User Info Response:', JSON.stringify(response, null, 2));
    });
  });

  req.on('error', (error) => console.error('请求失败:', error.message));
  req.end();
};

// 测试更新用户信息
const testUpdateUserInfo = () => {
  console.log('\n=== 测试更新用户信息 ===');
  const postData = JSON.stringify({
    nickname: '测试用户',
    gender: '男',
    birthday: '1990-01-01'
  });

  const req = http.request({
    hostname: 'localhost',
    port: 5050,
    path: '/mobile/user/update',
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
      console.log('Update User Info Response:', JSON.stringify(response, null, 2));
    });
  });

  req.on('error', (error) => console.error('请求失败:', error.message));
  req.write(postData);
  req.end();
};

// 测试获取用户统计数据
const testGetUserStats = () => {
  console.log('\n=== 测试获取用户统计数据 ===');
  const req = http.request({
    hostname: 'localhost',
    port: 5050,
    path: '/mobile/user/stats',
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
      console.log('Get User Stats Response:', JSON.stringify(response, null, 2));
    });
  });

  req.on('error', (error) => console.error('请求失败:', error.message));
  req.end();
};

// 测试获取个人资料数据
const testGetProfileData = () => {
  console.log('\n=== 测试获取个人资料数据 ===');
  const req = http.request({
    hostname: 'localhost',
    port: 5050,
    path: '/mobile/user/profile',
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
      console.log('Get Profile Data Response:', JSON.stringify(response, null, 2));
    });
  });

  req.on('error', (error) => console.error('请求失败:', error.message));
  req.end();
};

// 执行测试
testGetUserInfo();
testUpdateUserInfo();
testGetUserStats();
testGetProfileData();
