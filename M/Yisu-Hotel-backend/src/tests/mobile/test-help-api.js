// 测试帮助中心API
const http = require('http');

// 发送请求函数
function sendRequest() {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/mobile/help/center',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
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

    req.end();
  });
}

// 测试帮助中心API
async function testHelpAPI() {
  console.log('测试帮助中心API...');
  console.log('=====================================');

  try {
    const response = await sendRequest();
    console.log('API响应状态:', response.code, response.msg);
    console.log('\n帮助中心数据:');
    console.log('分类数量:', response.data.faqItems.length);
    
    // 打印每个分类的信息
    response.data.faqItems.forEach((category, index) => {
      console.log(`\n分类 ${index + 1}: ${category.category}`);
      console.log(`问题数量: ${category.questions.length}`);
      console.log('问题列表:');
      category.questions.forEach((question, qIndex) => {
        console.log(`  ${qIndex + 1}. ${question.q}`);
      });
    });
    
    console.log('\n=====================================');
    console.log('测试完成！');
  } catch (error) {
    console.error('请求错误:', error);
  }
}

// 运行测试
testHelpAPI();
