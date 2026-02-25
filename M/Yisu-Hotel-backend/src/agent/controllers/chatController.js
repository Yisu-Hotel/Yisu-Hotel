const customerAgent = require('../core/customerAgent');
// 检查知识库文件是否存在
const fs = require('fs');
const path = require('path');
const knowledgeBasePath = path.join(__dirname, '../knowledge/knowledgeBase.js');
console.log('Knowledge base file exists:', fs.existsSync(knowledgeBasePath));
const { searchKnowledgeBase } = require('../knowledge/knowledgeBase');

/**
 * 错误处理函数
 * @param {Object} res - Express响应对象
 * @param {Error} error - 错误对象
 * @param {string} logLabel - 日志标签
 * @returns {Object} - 错误响应
 */
const handleError = (res, error, logLabel) => {
  if (error && error.code) {
    return res.status(error.httpStatus || 400).json({
      code: error.code,
      msg: error.message,
      data: null
    });
  }
  console.error(logLabel, error);
  return res.status(500).json({
    code: 500,
    msg: '服务器错误',
    data: null
  });
};

/**
 * 创建聊天完成
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Promise<Object>} - 聊天响应
 */
const createChatCompletion = async (req, res) => {
  try {
    console.log('Received request:', req.method, req.url);
    console.log('Request body:', req.body);
    
    // 从请求体中获取消息
    const { messages, history } = req.body || {};

    // 验证参数
    if (!messages || !Array.isArray(messages)) {
      // 即使参数无效，也返回友好的错误信息，而不是400错误
      return res.json({
        code: 0,
        msg: '请求成功',
        data: {
          message: {
            role: 'assistant',
            content: '抱歉，我暂时无法理解您的问题，请尝试重新表述。'
          },
          tool_calls: []
        }
      });
    }

    // 获取最后一条用户消息
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user' || !lastMessage.content) {
      // 即使消息无效，也返回友好的错误信息，而不是400错误
      return res.json({
        code: 0,
        msg: '请求成功',
        data: {
          message: {
            role: 'assistant',
            content: '抱歉，我暂时无法理解您的问题，请尝试重新表述。'
          },
          tool_calls: []
        }
      });
    }

    // 先在本地知识库中搜索
    console.log('Searching knowledge base for:', lastMessage.content);
    try {
      const knowledgeResults = searchKnowledgeBase(lastMessage.content);
      console.log('Knowledge base search results:', knowledgeResults);
      console.log('Number of results:', knowledgeResults.length);
      
      // 如果找到匹配的答案，直接返回知识库中的答案
      if (knowledgeResults.length > 0) {
        console.log('Found knowledge base results:', knowledgeResults[0]);
        return res.json({
          code: 0,
          msg: '请求成功',
          data: {
            message: {
              role: 'assistant',
              content: knowledgeResults[0].answer
            },
            tool_calls: []
          }
        });
      }
      console.log('No knowledge base results found, using AI agent.');
    } catch (error) {
      console.error('Knowledge base search error:', error);
      console.log('Using AI agent instead.');
    }

    // 调用customerAgent处理消息
    const result = await customerAgent.handleMessage(
      lastMessage.content,
      history || []
    );

    // 返回响应
    return res.json({
      code: 0,
      msg: '请求成功',
      data: {
        message: {
          role: 'assistant',
          content: result.content
        },
        tool_calls: result.toolCalls || []
      }
    });
  } catch (error) {
    console.error('Create chat completion error:', error);
    // 即使内部错误，也返回友好的错误信息，而不是500错误
    return res.json({
      code: 0,
      msg: '请求成功',
      data: {
        message: {
          role: 'assistant',
          content: '抱歉，我暂时无法回答这个问题，请稍后再试。'
        },
        tool_calls: []
      }
    });
  }
};

/**
 * 获取AI助手信息
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Promise<Object>} - 助手信息响应
 */
const getAssistantInfo = async (req, res) => {
  try {
    return res.json({
      code: 0,
      msg: '请求成功',
      data: {
        name: '易宿智能助手',
        description: '专业、友好、高效地回答您关于酒店预订的各种问题',
        capabilities: [
          '回答酒店基本信息查询',
          '帮助了解预订流程和政策',
          '提供酒店推荐和比较',
          '解答常见问题和疑虑',
          '引导完成预订过程'
        ],
        availability: '24/7'
      }
    });
  } catch (error) {
    return handleError(res, error, 'Get assistant info error:');
  }
};

module.exports = {
  createChatCompletion,
  getAssistantInfo
};