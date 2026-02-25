// 测试聊天API
const http = require('http');

// 测试问题
const testQuestions = [
  '酒店的入住时间是几点？',
  '酒店有停车场吗？',
  '如何预订酒店？',
  '酒店提供早餐吗？'
];

// 发送请求函数
function sendRequest(question) {
  const postData = JSON.stringify({
    messages: [{
      role: 'user',
      content: question
    }]
  });

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/mobile/chat/completion',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(JSON.parse(data));
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

// 测试每个问题
async function testChatAPI() {
  console.log('测试聊天API...');
  console.log('=====================================');

  for (let i = 0; i < testQuestions.length; i++) {
    const question = testQuestions[i];
    console.log(`\n测试问题 ${i + 1}: ${question}`);
    console.log('-------------------------------------');

    try {
      const response = await sendRequest(question);
      console.log('API响应:', response);
      console.log('回答:', response.data.message.content);
    } catch (error) {
      console.error('请求错误:', error);
    }
  }

  console.log('\n=====================================');
  console.log('测试完成！');
}

// 运行测试
testChatAPI();
