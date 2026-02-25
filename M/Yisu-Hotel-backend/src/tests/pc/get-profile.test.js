const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const http = require('http');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('请输入 Token: ', (testToken) => {
  if (!testToken.trim()) {
    console.log('Token 不能为空');
    rl.close();
    return;
  }

  const req = http.request({
    hostname: 'localhost',
    port: process.env.PORT || 3000,
    path: '/user/profile',
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${testToken.trim()}`
    }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log('响应状态码:', res.statusCode);
      console.log('响应头:', JSON.stringify(res.headers, null, 2));
      console.log('响应数据:');
      console.log(data);
      
      try {
        const response = JSON.parse(data);
        console.log('解析后的JSON:');
        console.log(JSON.stringify(response, null, 2));
      } catch (error) {
        console.log('无法解析为JSON:', error.message);
      }
      rl.close();
    });
  });

  req.on('error', (error) => {
    console.error('请求失败:', error.message);
    rl.close();
  });
  req.end();
});