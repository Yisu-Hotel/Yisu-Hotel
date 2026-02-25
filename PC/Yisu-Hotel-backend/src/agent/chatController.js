const merchantAgent = require('./core/merchantAgent');

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

const createChatCompletion = async (req, res) => {
  try {
    const { messages } = req.chatPayload || req.body;
    const lastMessage = messages[messages.length - 1];
    const history = messages.slice(0, messages.length - 1);
    const result = await merchantAgent.handleMessage(lastMessage.content, history);
    if (!result.success) {
      throw new Error(result.error || 'Agent handle message failed');
    }
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
    return handleError(res, error, 'Chat completion error:');
  }
};

module.exports = {
  createChatCompletion
};
