const express = require('express');
const router = express.Router();
const chatController = require('../../agent/controllers/chatController');

/**
 * AI助手聊天路由
 */

// 获取AI助手信息
router.get('/info', chatController.getAssistantInfo);

// 创建聊天完成
router.post('/completion', chatController.createChatCompletion);

// 健康检查
router.get('/health', (req, res) => {
  return res.json({
    code: 0,
    msg: 'AI助手服务正常',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString()
    }
  });
});

module.exports = router;