const { checkPhoneService, sendCodeService, registerService, loginService, resetPasswordService } = require('../../services/mobile/auth');

const handleError = (res, error, logLabel) => {
  if (error && error.code) {
    return res.status(error.httpStatus || 400).json({
      code: error.code,
      msg: error.message,
      data: null
    });
  }
  console.error(logLabel, error);
  return res.status(500).json({
    code: 500,
    msg: '服务器错误',
    data: null
  });
};

exports.sendCode = async (req, res) => {
  try {
    const { phone, type = 'register' } = req.body;
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ code: 3001, msg: '手机号格式不正确', data: null });
    }
    const data = await sendCodeService(phone, type);
    return res.json({ code: 0, msg: '验证码已发送', data });
  } catch (error) {
    return handleError(res, error, 'Send code error:');
  }
};

exports.checkPhone = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ code: 3001, msg: '手机号格式不正确', data: null });
    }
    const data = await checkPhoneService(phone);
    return res.json({ code: 0, msg: data.msg, data: { available: data.available } });
  } catch (error) {
    return handleError(res, error, 'Check phone error:');
  }
};

exports.login = async (req, res) => {
  try {
    const { phone, password, token_expires_in } = req.body;
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ code: 3001, msg: '手机号格式不正确', data: null });
    }
    const data = await loginService(phone, password, token_expires_in);
    return res.json({ code: 0, msg: '登录成功', data });
  } catch (error) {
    return handleError(res, error, 'Login error:');
  }
};

exports.register = async (req, res) => {
  try {
    const { phone, code, password, agreed } = req.body;
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ code: 3001, msg: '手机号格式不正确', data: null });
    }
    if (!agreed) {
      return res.status(400).json({ code: 3004, msg: '未同意用户协议', data: null });
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,16}$/.test(password)) {
      return res.status(400).json({ code: 3006, msg: '密码格式不正确', data: null });
    }
    const data = await registerService({ phone, password, code });
    return res.json({ code: 0, msg: '注册成功', data });
  } catch (error) {
    return handleError(res, error, 'Register error:');
  }
};

// 重置密码
exports.resetPassword = async (req, res) => {
  try {
    const { phone, code, password } = req.body;
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ code: 3001, msg: '手机号格式不正确', data: null });
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,16}$/.test(password)) {
      return res.status(400).json({ code: 3006, msg: '密码格式不正确', data: null });
    }
    await resetPasswordService({ phone, code, password });
    return res.json({ code: 0, msg: '密码重置成功', data: null });
  } catch (error) {
    return handleError(res, error, 'Reset password error:');
  }
};
