const http = require('http');

// 测试获取收藏列表
const testGetFavoriteList = () => {
  console.log('=== 测试获取收藏列表 ===');
  const req = http.request({
    hostname: 'localhost',
    port: 5050,
    path: '/mobile/favorite/list',
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
      console.log('Get Favorite List Response:', JSON.stringify(response, null, 2));
    });
  });

  req.on('error', (error) => console.error('请求失败:', error.message));
  req.end();
};

// 测试添加收藏
const testAddFavorite = () => {
  console.log('\n=== 测试添加收藏 ===');
  const postData = JSON.stringify({
    hotel_id: '1'
  });

  const req = http.request({
    hostname: 'localhost',
    port: 5050,
    path: '/mobile/favorite/add',
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
      console.log('Add Favorite Response:', JSON.stringify(response, null, 2));
    });
  });

  req.on('error', (error) => console.error('请求失败:', error.message));
  req.write(postData);
  req.end();
};

// 测试删除收藏
const testRemoveFavorite = () => {
  console.log('\n=== 测试删除收藏 ===');
  const postData = JSON.stringify({
    hotel_id: '1'
  });

  const req = http.request({
    hostname: 'localhost',
    port: 5050,
    path: '/mobile/favorite/remove',
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
      console.log('Remove Favorite Response:', JSON.stringify(response, null, 2));
    });
  });

  req.on('error', (error) => console.error('请求失败:', error.message));
  req.write(postData);
  req.end();
};

// 执行测试
testGetFavoriteList();
testAddFavorite();
testRemoveFavorite();
