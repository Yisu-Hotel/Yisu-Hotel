const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/mobile/chat/completion',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(JSON.stringify({
      messages: [{
        role: 'user',
        content: '酒店入住时间是几点'
      }]
    }))
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response:', JSON.stringify(JSON.parse(data), null, 2));
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

// 发送请求体
req.write(JSON.stringify({
  messages: [{
    role: 'user',
    content: '酒店入住时间是几点'
  }]
}));
req.end();
