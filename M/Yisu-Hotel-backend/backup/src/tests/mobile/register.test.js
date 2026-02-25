const http = require('http');

const testRegister = async (phone, password, code, agreed) => {
  const postData = JSON.stringify({ phone, password, code, agreed });

  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5050,
      path: '/mobile/auth/register',
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

const testSendCode = async (phone, type) => {
  const postData = JSON.stringify({ phone, type });

  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5050,
      path: '/mobile/auth/send-code',
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
  try {
    const phone = '18595890987';
    const password = 'abc123456';
    const agreed = true;

    console.log('发送验证码到:', phone);
    const sendCodeResult = await testSendCode(phone, 'register');
    console.log(JSON.stringify(sendCodeResult, null, 2));

    if (sendCodeResult.code !== 0) {
      console.log('发送验证码失败:', sendCodeResult.msg);
      process.exit(1);
    }

    console.log('请查看手机短信，输入收到的验证码');
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const code = await new Promise((resolve) => {
      rl.question('验证码: ', resolve);
    });
    rl.close();

    console.log('测试注册:');
    console.log('手机号:', phone);
    console.log('密码:', password);
    console.log('验证码:', code);
    console.log('同意协议:', agreed);
    console.log();

    const result = await testRegister(phone, password, code, agreed);

    console.log(JSON.stringify(result, null, 2));

    if (result.code === 0) {
      console.log('注册成功！');
      console.log('Token:', result.data.token);
      console.log('用户信息:', result.data.user);
    } else {
      console.log('注册失败:', result.msg);
    }
  } catch (error) {
    console.error('测试失败:', error.message);
  }
})();
