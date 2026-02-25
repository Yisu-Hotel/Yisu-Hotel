const { authenticateToken } = require('./user');
const { validateChatInput } = require('../../agent/chatValidator');

module.exports = {
  authenticateToken,
  validateChatInput
};
