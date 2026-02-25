const OpenAI = require('openai');

/**
 * 封装智谱 AI (GLM) 调用服务
 */
class LLMService {
  constructor(apiKey, model = 'glm-5') {
    this.apiKey = apiKey || process.env.AI_API_KEY;
    this.model = model;
    this.client = new OpenAI({
      apiKey: this.apiKey,
      baseURL: 'https://open.bigmodel.cn/api/paas/v4'
    });
  }

  async chat(messages, options = {}) {
    if (!this.apiKey) {
      throw new Error('AI API Key is not configured');
    }

    const payload = {
      model: this.model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 2048,
      top_p: options.top_p ?? 0.9,
      thinking: options.thinking ?? { type: 'disabled' },
      ...options
    };

    return this.client.chat.completions.create(payload);
  }
}

module.exports = new LLMService();
