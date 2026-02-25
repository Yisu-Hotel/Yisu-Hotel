const http = require('http');

const testForgotPassword = async (phone) => {
  const postData = JSON.stringify({ phone });

  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5050,
      path: '/auth/forgot-password',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
};

(async () => {
  const phone = '19883202629';
  console.log('测试忘记密码:', phone);
  const result = await testForgotPassword(phone);
  console.log(JSON.stringify(result, null, 2));
})();
