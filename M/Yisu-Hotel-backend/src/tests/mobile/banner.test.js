const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 5050,
  path: '/mobile/banner/list',
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
}, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const response = JSON.parse(data);
    console.log('Banner List Response:', JSON.stringify(response, null, 2));
  });
});

req.on('error', (error) => console.error('请求失败:', error.message));
req.end();