/**
 * 验证手机号格式
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 * @returns {Promise<void>} - 无返回值
 */
const validatePhone = (req, res, next) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({
      code: 3001,
      msg: '手机号格式不正确',
      data: null
    });
  }

  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      code: 3001,
      msg: '手机号格式不正确',
      data: null
    });
  }

  next();
};

/**
 * 验证发送验证码参数
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 * @returns {Promise<void>} - 无返回值
 */
const validateSendCode = (req, res, next) => {
  const { phone, type } = req.body;

  if (!phone) {
    return res.status(400).json({
      code: 3001,
      msg: '手机号格式不正确',
      data: null
    });
  }

  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      code: 3001,
      msg: '手机号格式不正确',
      data: null
    });
  }

  if (!type || !['register', 'login', 'reset'].includes(type)) {
    return res.status(400).json({
      code: 3001,
      msg: '验证码类型不正确',
      data: null
    });
  }

  next();
};

/**
 * 验证注册参数
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 * @returns {Promise<void>} - 无返回值
 */
const validateRegister = (req, res, next) => {
  const { phone, password, code, role, agreed } = req.body;

  if (!phone) {
    return res.status(400).json({
      code: 3001,
      msg: '手机号格式不正确',
      data: null
    });
  }

  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      code: 3001,
      msg: '手机号格式不正确',
      data: null
    });
  }

  if (!password || password.length < 6 || password.length > 20) {
    return res.status(400).json({
      code: 3001,
      msg: '密码长度应为6-20位',
      data: null
    });
  }

  if (!code || !/^\d{6}$/.test(code)) {
    return res.status(400).json({
      code: 3001,
      msg: '验证码格式不正确',
      data: null
    });
  }

  if (!role || !['merchant', 'admin'].includes(role)) {
    return res.status(400).json({
      code: 3001,
      msg: '角色不正确',
      data: null
    });
  }

  if (agreed !== true) {
    return res.status(400).json({
      code: 3001,
      msg: '请同意用户协议与隐私政策',
      data: null
    });
  }

  next();
};

/**
 * 验证登录参数
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 * @returns {Promise<void>} - 无返回值
 */
const validateLogin = (req, res, next) => {
  const { phone, password } = req.body;

  if (!phone) {
    return res.status(400).json({
      code: 3001,
      msg: '手机号格式不正确',
      data: null
    });
  }

  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      code: 3001,
      msg: '手机号格式不正确',
      data: null
    });
  }

  if (!password || password.length < 6 || password.length > 20) {
    return res.status(400).json({
      code: 3001,
      msg: '密码长度应为6-20位',
      data: null
    });
  }

  next();
};

/**
 * 验证忘记密码参数
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 * @returns {Promise<void>} - 无返回值
 */
const validateForgotPassword = (req, res, next) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({
      code: 3001,
      msg: '手机号格式不正确',
      data: null
    });
  }

  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      code: 3001,
      msg: '手机号格式不正确',
      data: null
    });
  }

  next();
};

/**
 * 验证重置密码参数
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 * @returns {Promise<void>} - 无返回值
 */
const validateResetPassword = (req, res, next) => {
  const { phone, code, new_password } = req.body;

  if (!phone) {
    return res.status(400).json({
      code: 3001,
      msg: '手机号格式不正确',
      data: null
    });
  }

  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      code: 3001,
      msg: '手机号格式不正确',
      data: null
    });
  }

  if (!code || !/^\d{6}$/.test(code)) {
    return res.status(400).json({
      code: 3001,
      msg: '验证码格式不正确',
      data: null
    });
  }

  if (!new_password || new_password.length < 6 || new_password.length > 20) {
    return res.status(400).json({
      code: 3006,
      msg: '密码格式不正确',
      data: null
    });
  }

  next();
};

module.exports = {
  validatePhone,
  validateSendCode,
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword
};
