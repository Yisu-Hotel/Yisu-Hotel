const express = require('express');
const router = express.Router();
const { createChatCompletion } = require('../../controllers/pc/chat');
const { authenticateToken, validateChatInput } = require('../../middlewares/pc/chat');

router.post('/completions', authenticateToken, validateChatInput, createChatCompletion);

module.exports = router;
