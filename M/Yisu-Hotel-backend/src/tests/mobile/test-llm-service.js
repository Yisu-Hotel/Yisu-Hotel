const llmService = require('./src/agent/services/llmService');

async function testLLMService() {
  try {
    console.log('Testing LLM Service...');
    
    const messages = [
      {
        role: 'system',
        content: '你是一个专业的酒店AI助手。'
      },
      {
        role: 'user',
        content: '酒店入住时间是几点'
      }
    ];
    
    const response = await llmService.chat(messages);
    console.log('LLM Service Response:', JSON.stringify(response, null, 2));
    
    const content = response?.choices?.[0]?.message?.content;
    console.log('Generated Content:', content);
    
  } catch (error) {
    console.error('Error testing LLM Service:', error);
  }
}

testLLMService();
