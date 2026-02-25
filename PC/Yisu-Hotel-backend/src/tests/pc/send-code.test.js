const http = require('http');

const testSendCode = async (phone, type) => {
  const postData = JSON.stringify({ phone, type });

  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5050,
      path: '/auth/send-code',
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
  const tests = [
    { phone: '13800138000', type: 'register', desc: '注册验证码' },
    { phone: '13912345678', type: 'login', desc: '登录验证码' },
    { phone: '15928077855', type: 'reset', desc: '重置密码验证码' }
  ];

  for (const { phone, type, desc } of tests) {
    console.log(`测试${desc}: ${phone}`);
    const result = await testSendCode(phone, type);
    console.log(JSON.stringify(result, null, 2));
    console.log();
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
})();
