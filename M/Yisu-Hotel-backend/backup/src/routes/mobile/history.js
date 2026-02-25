const express = require('express');
const router = express.Router();
const historyController = require('../../controllers/mobile/history');
const authMiddleware = require('../../middlewares/mobile/auth');

// 获取浏览历史列表
router.get('/list', historyController.getHistoryList);

// 删除单条浏览历史
router.delete('/:id', historyController.removeHistory);

// 清空所有浏览历史
router.delete('/clear', historyController.clearHistory);

module.exports = router;
