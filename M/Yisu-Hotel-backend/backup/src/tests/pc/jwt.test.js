const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const jwt = require('jsonwebtoken');
const http = require('http');

function requestLoginToken() {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: process.env.PORT || 3000,
      path: '/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => reject(error));
    req.write(JSON.stringify({
      phone: '19883202629',
      password: '12345678',
      token_expires_in: 60 * 60 * 24 * 30
    }));
    req.end();
  });
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        console.log('❌ Token 已过期');
      } else {
        console.log('❌ Token 无效:', err.message);
      }
      return null;
    }
    return decoded;
  });
}

(async () => {
  try {
    const response = await requestLoginToken();
    console.log(JSON.stringify(response, null, 2));
    const token = response?.data?.token;
    if (!token) {
      console.log('❌ 未获取到 Token');
      return;
    }

    const decoded = verifyToken(token);
    if (decoded) {
      console.log('✅ Token 有效');
      console.log('用户ID:', decoded.userId);
      console.log('手机号:', decoded.phone);
      console.log('角色:', decoded.role);
      if (decoded.exp) {
        const expiresAt = new Date(decoded.exp * 1000);
        console.log('失效时间:', expiresAt.toISOString());
      }
    }
  } catch (error) {
    console.error('验证失败:', error.message);
  }
})();
