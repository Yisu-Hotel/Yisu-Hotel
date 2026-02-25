const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const http = require('http');

const loginPayload = {
  phone: '19883202629',
  password: '123456'
};

const updatePayload = {
  nickname: '李四',
  gender: '男',
  birthday: '1995-05-20',
  avatar: 'http://localhost:3000/main_image/example1.jpg'
};

const loginReq = http.request({
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: '/auth/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    let response;
    try {
      response = JSON.parse(data);
    } catch (error) {
      console.log('登录响应无法解析:', data);
      return;
    }

    const token = response?.data?.token;
    if (!token) {
      console.log('登录失败:', response);
      return;
    }

    const updateReq = http.request({
      hostname: 'localhost',
      port: process.env.PORT || 3000,
      path: '/user/profile',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, (updateRes) => {
      let updateData = '';
      updateRes.on('data', (chunk) => updateData += chunk);
      updateRes.on('end', () => {
        console.log('响应状态码:', updateRes.statusCode);
        console.log('响应数据:');
        console.log(updateData);
        try {
          const parsed = JSON.parse(updateData);
          console.log('解析后的JSON:');
          console.log(JSON.stringify(parsed, null, 2));
        } catch (error) {
          console.log('无法解析为JSON:', error.message);
        }
      });
    });

    updateReq.on('error', (error) => {
      console.error('请求失败:', error.message);
    });
    updateReq.write(JSON.stringify(updatePayload));
    updateReq.end();
  });
});

loginReq.on('error', (error) => console.error('请求失败:', error.message));
loginReq.write(JSON.stringify(loginPayload));
loginReq.end();
