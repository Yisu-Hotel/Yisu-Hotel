const fs = require('fs');
const path = require('path');
const envPath = path.resolve(__dirname, '../../../.env');
require('dotenv').config({ path: envPath });
const axios = require('axios');

class LLMService {
  constructor(apiKey, model = 'glm-4-plus') {
    // console.log("apiKey:", apiKey);
    this.apiKey = process.env.AI_API_KEY;
    this.model = model;
    this.apiUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
  }

  async chat(messages, options = {}) {
    if (!this.apiKey) {
      throw new Error('AI API Key is not configured');
    }

    const payload = {
      model: this.model,
      messages,
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 0.9,
      thinking: { type: 'disabled' },
      ...options
    };

    const response = await axios.post(this.apiUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`
      }
    });

    return response.data;
  }
}

module.exports = new LLMService();
