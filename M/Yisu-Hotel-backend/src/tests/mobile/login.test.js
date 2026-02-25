const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 5050,
  path: '/mobile/auth/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const response = JSON.parse(data);
    console.log(JSON.stringify(response, null, 2));
  });
});

req.on('error', (error) => console.error('请求失败:', error.message));
req.write(JSON.stringify({ phone: '18595890987', password: 'abc123456' }));
req.end();
