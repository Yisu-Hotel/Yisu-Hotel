const express = require('express');
const router = express.Router();
const userController = require('../../controllers/mobile/user');
const authMiddleware = require('../../middlewares/mobile/auth');

// 获取用户信息
router.get('/info', authMiddleware, userController.getUserInfo);

// 更新用户信息
router.put('/update', authMiddleware, userController.updateUserInfo);

// 获取用户统计信息
router.get('/stats', authMiddleware, userController.getUserStats);

// 获取个人中心数据
router.get('/profile', authMiddleware, userController.getProfileData);

module.exports = router;
