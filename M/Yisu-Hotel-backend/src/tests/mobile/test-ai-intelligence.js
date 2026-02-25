const http = require('http');

// 测试问题数组
const testQuestions = [
  '酒店入住时间是几点',
  '酒店有停车场吗',
  '如何预订酒店',
  '酒店价格是多少',
  '酒店有早餐吗',
  '酒店有WiFi吗',
  '如何取消预订'
];

// 发送请求的函数
function sendRequest(question) {
  return new Promise((resolve, reject) => {
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
            content: question
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
        try {
          const response = JSON.parse(data);
          resolve({ question, response });
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    // 发送请求体
    req.write(JSON.stringify({
      messages: [{
        role: 'user',
        content: question
      }]
    }));
    req.end();
  });
}

// 测试函数
async function testAI() {
  console.log('测试AI助手的智能程度...');
  console.log('====================================');
  
  for (const question of testQuestions) {
    try {
      console.log(`测试问题: ${question}`);
      const result = await sendRequest(question);
      const answer = result.response.data.message.content;
      console.log(`AI回答: ${answer}`);
      console.log('------------------------------------');
    } catch (error) {
      console.error(`测试问题 "${question}" 失败:`, error.message);
      console.log('------------------------------------');
    }
  }
  
  console.log('测试完成！');
}

// 运行测试
testAI();
