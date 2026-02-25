const express = require('express');
const router = express.Router();
const favoriteController = require('../../controllers/mobile/favorite');
const authMiddleware = require('../../middlewares/mobile/auth');

// 添加收藏
router.post('/add', favoriteController.addFavorite);

// 取消收藏
router.post('/remove', favoriteController.removeFavorite);

// 获取收藏列表
router.get('/list', favoriteController.getFavoriteList);

module.exports = router;
