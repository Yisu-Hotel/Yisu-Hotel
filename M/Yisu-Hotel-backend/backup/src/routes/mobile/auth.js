const express = require('express');
const router = express.Router();
const authController = require('../../controllers/mobile/auth');
const { loginValidator, registerValidator } = require('../../middlewares/mobile/validator');

// 发送验证码
router.post('/send-code', authController.sendCode);

// 检查手机号
router.post('/check-phone', authController.checkPhone);

// 用户注册
router.post('/register', registerValidator, authController.register);

// 用户登录
router.post('/login', loginValidator, authController.login);

// 重置密码
router.put('/reset-password', authController.resetPassword);

module.exports = router;
