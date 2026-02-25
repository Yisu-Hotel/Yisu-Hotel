const validateChatInput = (req, res, next) => {
  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      code: 4009,
      msg: '参数格式不正确',
      data: null
    });
  }

  const normalizedMessages = [];
  for (const message of messages) {
    if (!message || typeof message !== 'object') {
      return res.status(400).json({
        code: 4009,
        msg: '参数格式不正确',
        data: null
      });
    }
    const { role, content } = message;
    if (!['user', 'assistant', 'system'].includes(role) || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({
        code: 4009,
        msg: '参数格式不正确',
        data: null
      });
    }
    normalizedMessages.push({
      role,
      content: content.trim()
    });
  }

  req.chatPayload = {
    messages: normalizedMessages
  };
  next();
};

module.exports = {
  validateChatInput
};
