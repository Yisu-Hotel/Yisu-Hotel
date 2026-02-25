const http = require('http');

const testResetPassword = async (phone, code, new_password) => {
  const postData = JSON.stringify({ phone, code, new_password });

  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5050,
      path: '/auth/reset-password',
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
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const code = await new Promise((resolve) => {
    rl.question('验证码: ', resolve);
  });
  rl.close();

  const new_password = '123456';
  console.log('测试重置密码:');
  console.log('手机号:', phone);
  console.log('验证码:', code);
  console.log('新密码:', new_password);
  console.log();

  const result = await testResetPassword(phone, code, new_password);
  console.log(JSON.stringify(result, null, 2));
})();
