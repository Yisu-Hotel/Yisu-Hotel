const http = require('http');

const testCheckPhone = async (phone) => {
  const postData = JSON.stringify({ phone });

  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5050,
      path: '/mobile/auth/check-phone',
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
    { phone: '15928077855', desc: '指定手机号' },
    { phone: '13912345678', desc: '未注册' },
    { phone: '12345', desc: '无效手机号' }
  ];

  for (const { phone, desc } of tests) {
    console.log(`测试手机号: ${phone} (${desc})`);
    const result = await testCheckPhone(phone);
    console.log(JSON.stringify(result, null, 2));
    console.log();
  }
})();
