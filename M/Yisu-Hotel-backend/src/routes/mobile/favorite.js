const express = require('express');
const router = express.Router();
const favoriteController = require('../../controllers/mobile/favorite');
const authMiddleware = require('../../middlewares/mobile/auth');

// 添加收藏
router.post('/add', authMiddleware, favoriteController.addFavorite);

// 取消收藏
router.post('/remove', authMiddleware, favoriteController.removeFavorite);

// 获取收藏列表
router.get('/list', authMiddleware, favoriteController.getFavoriteList);

module.exports = router;
