// 测试本地知识库搜索函数
const { searchKnowledgeBase } = require('./src/agent/knowledge/knowledgeBase');

// 测试问题
const testQuestions = [
  '如何预订酒店？',
  '取消订单如何操作？',
  '会员积分规则',
  '酒店设施详情'
];

// 测试每个问题
console.log('测试本地知识库搜索函数...');
console.log('=====================================');

testQuestions.forEach((question, index) => {
  console.log(`\n测试问题 ${index + 1}: ${question}`);
  console.log('-------------------------------------');
  
  try {
    const results = searchKnowledgeBase(question);
    console.log(`搜索结果数量: ${results.length}`);
    
    if (results.length > 0) {
      console.log('最佳匹配结果:');
      console.log(`  问题: ${results[0].question}`);
      console.log(`  答案: ${results[0].answer}`);
      console.log(`  匹配度: ${results[0].score}`);
    } else {
      console.log('未找到匹配结果');
    }
  } catch (error) {
    console.error('搜索错误:', error);
  }
});

console.log('\n=====================================');
console.log('测试完成！');
