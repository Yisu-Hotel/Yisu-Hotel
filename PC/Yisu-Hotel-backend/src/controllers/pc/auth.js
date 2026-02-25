const {
  checkAccountService,
  sendCodeService,
  registerService,
  loginService,
  forgotPasswordService,
  resetPasswordService
} = require('../../services/pc/auth');

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

/**
 * 检查账号是否已被注册
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Promise<void>} - 无返回值
 */
const checkAccount = async (req, res) => {
  try {
    const { phone } = req.body;
    const data = await checkAccountService(phone);
    return res.json({
      code: 0,
      msg: data.msg,
      data: {
        available: data.available
      }
    });
  } catch (error) {
    return handleError(res, error, 'Check account error:');
  }
};

/**
 * 发送验证码
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Promise<void>} - 无返回值
 */
const sendCode = async (req, res) => {
  try {
    const { phone, type } = req.body;
    const data = await sendCodeService(phone, type);
    return res.json({
      code: 0,
      msg: '验证码已发送',
      data
    });
  } catch (error) {
    return handleError(res, error, 'Send code error:');
  }
};

/**
 * 注册新用户
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Promise<void>} - 无返回值
 */
const register = async (req, res) => {
  try {
    const { phone, password, code, role } = req.body;
    const data = await registerService({ phone, password, code, role });
    return res.json({
      code: 0,
      msg: '注册成功',
      data
    });
  } catch (error) {
    return handleError(res, error, 'Register error:');
  }
};

/**
 * 用户登录
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Promise<void>} - 无返回值
 */
const login = async (req, res) => {
  try {
    const { phone, password, token_expires_in } = req.body;
    const data = await loginService(phone, password, token_expires_in);
    return res.json({
      code: 0,
      msg: '登录成功',
      data
    });
  } catch (error) {
    return handleError(res, error, 'Login error:');
  }
};

/**
 * 忘记密码
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Promise<void>} - 无返回值
 */
const forgotPassword = async (req, res) => {
  try {
    const { phone } = req.body;
    const data = await forgotPasswordService(phone);
    return res.json({
      code: 0,
      msg: '验证码已发送',
      data
    });
  } catch (error) {
    return handleError(res, error, 'Forgot password error:');
  }
};

/**
 * 重置密码
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Promise<void>} - 无返回值
 */
const resetPassword = async (req, res) => {
  try {
    const { phone, code, new_password } = req.body;
    await resetPasswordService(phone, code, new_password);
    return res.json({
      code: 0,
      msg: '密码重置成功',
      data: null
    });
  } catch (error) {
    return handleError(res, error, 'Reset password error:');
  }
};

module.exports = {
  checkAccount,
  sendCode,
  register,
  login,
  forgotPassword,
  resetPassword
};
