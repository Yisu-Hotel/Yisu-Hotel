const http = require('http');

// 测试问题数组
const testQuestions = [
  '阳光酒店的信息',
  '阳光酒店怎么样',
  '阳光酒店的设施',
  '阳光酒店的价格'
];

// 发送请求的函数
function sendRequest(question) {
  return new Promise((resolve, reject) => {
    const requestData = {
      messages: [{
        role: 'user',
        content: question
      }]
    };
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/mobile/chat/completion',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(requestData))
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
          console.log('完整响应:', JSON.stringify(response, null, 2));
          resolve({ question, response });
        } catch (error) {
          console.error('解析响应失败:', error);
          reject(error);
        }
      });
    });

    req.on('error', (e) => {
      console.error('请求失败:', e);
      reject(e);
    });

    // 发送请求体
    req.write(JSON.stringify(requestData));
    req.end();
  });
}

// 测试函数
async function testAI() {
  console.log('测试AI助手回答具体酒店问题的能力...');
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
