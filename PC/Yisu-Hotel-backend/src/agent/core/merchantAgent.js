const llmService = require('../services/llmService');
const { SYSTEM_PROMPT } = require('../prompts/merchantPrompt');
const { getToolDefinition, executeToolCall } = require('../services/knowledgeBaseTool');

/**
 * MerchantAgent 核心调度器
 */
class MerchantAgent {
  constructor() {
    this.promptTemplate = SYSTEM_PROMPT;
  }

  async handleMessage(userInput, history = []) {
    try {
      const sanitizedHistory = Array.isArray(history)
        ? history.filter((msg) => msg && ['user', 'assistant'].includes(msg.role) && typeof msg.content === 'string')
        : [];
      const messages = [
        { role: 'system', content: this.promptTemplate },
        ...sanitizedHistory,
        { role: 'user', content: userInput }
      ];

      const tools = [getToolDefinition()];
      const firstResponse = await llmService.chat(messages, {
        temperature: 0.3,
        tools,
        tool_choice: 'auto'
      });
      const firstMessage = firstResponse?.choices?.[0]?.message;
      const toolCalls = Array.isArray(firstMessage?.tool_calls) ? firstMessage.tool_calls : [];

      if (toolCalls.length === 0) {
        return {
          content: firstMessage?.content || '抱歉，我暂时无法回答这个问题。',
          success: true,
          toolCalls: []
        };
      }

      const executedToolCalls = [];
      const toolMessages = [];

      for (const call of toolCalls) {
        if (call?.function?.name !== 'knowledge_base_search') {
          continue;
        }
        let args = {};
        try {
          args = call.function.arguments ? JSON.parse(call.function.arguments) : {};
        } catch (error) {
          args = {};
        }
        const result = await executeToolCall(args);
        executedToolCalls.push({
          name: call.function.name,
          input: args,
          output: {
            matches: result.matches || []
          }
        });
        toolMessages.push({
          role: 'tool',
          tool_call_id: call.id,
          content: JSON.stringify({
            context: result.context,
            matches: result.matches || []
          })
        });
      }

      const secondResponse = await llmService.chat(
        [...messages, firstMessage, ...toolMessages],
        {
          temperature: 0.3,
          tools,
          tool_choice: 'none'
        }
      );
      const finalMessage = secondResponse?.choices?.[0]?.message;

      return {
        content: finalMessage?.content || '抱歉，我暂时无法回答这个问题。',
        success: true,
        toolCalls: executedToolCalls
      };
    } catch (error) {
      console.error('Agent Error:', error);
      return {
        content: '助手目前遇到了一点小问题，请稍后再试。',
        success: false,
        error: error.message,
        toolCalls: []
      };
    }
  }
}

module.exports = new MerchantAgent();
