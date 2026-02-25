const express = require('express');
const router = express.Router();
const { checkAccount, sendCode, register, login, forgotPassword, resetPassword } = require('../../controllers/pc/auth');
const { validatePhone, validateSendCode, validateRegister, validateLogin, validateForgotPassword, validateResetPassword } = require('../../middlewares/pc/auth');

router.post('/check-account', validatePhone, checkAccount);
router.post('/send-code', validateSendCode, sendCode);
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/reset-password', validateResetPassword, resetPassword);

module.exports = router;
