const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User, VerificationCode, UserProfile } = require('../../models');
const { generateCode } = require('../../utils/code');
const { generateNickname } = require('../../utils/nickname');
const AliyunSMS = require('../../utils/sms');

/**
 * 检查账号是否已被注册服务
 * @param {string} phone - 手机号
 * @returns {Promise<Object>} - 检查结果
 */
const checkAccountService = async (phone) => {
  const user = await User.findOne({
    where: { phone }
  });

  if (user) {
    return {
      available: false,
      msg: '该账号已被注册'
    };
  }

  return {
    available: true,
    msg: '账号可用'
  };
};

/**
 * 发送验证码服务
 * @param {string} phone - 手机号
 * @param {string} type - 验证码类型
 * @returns {Promise<Object>} - 发送结果
 */
const sendCodeService = async (phone, type) => {
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const recentCode = await VerificationCode.findOne({
    where: {
      phone,
      type,
      created_at: {
        [Op.gte]: oneMinuteAgo
      }
    }
  });

  if (recentCode) {
    const error = new Error('验证码发送频率限制（60秒内只能发送一次）');
    error.code = 3002;
    error.httpStatus = 400;
    throw error;
  }

  const code = generateCode(6);
  const expiresAt = new Date(Date.now() + 60 * 1000);

  await VerificationCode.create({
    phone,
    code,
    type,
    expires_at: expiresAt,
    used: false
  });

  await AliyunSMS.sendVerifyCode(phone, code);

  return {
    expires_in: 60
  };
};

/**
 * 注册新用户服务
 * @param {Object} payload - 注册信息
 * @param {string} payload.phone - 手机号
 * @param {string} payload.password - 密码
 * @param {string} payload.code - 验证码
 * @param {string} payload.role - 角色
 * @returns {Promise<Object>} - 注册结果
 */
const registerService = async ({ phone, password, code, role }) => {
  const verificationCode = await VerificationCode.findOne({
    where: {
      phone,
      type: 'register',
      code,
      used: false,
      expires_at: {
        [Op.gt]: new Date()
      }
    }
  });

  if (!verificationCode) {
    const error = new Error('验证码不正确或已过期');
    error.code = 3001;
    error.httpStatus = 400;
    throw error;
  }

  const existingUser = await User.findOne({
    where: { phone }
  });

  if (existingUser) {
    const error = new Error('该手机号已被注册');
    error.code = 3001;
    error.httpStatus = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userRole = role || 'merchant';
  const nickname = generateNickname(userRole);

  const user = await User.create({
    phone,
    password: hashedPassword,
    role: userRole,
    nickname: nickname,
    login_count: 0
  });

  await verificationCode.update({ used: true });

  await UserProfile.create({
    user_id: user.id,
    nickname: nickname
  });

  const token = jwt.sign(
    { userId: user.id, phone: user.phone, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );

  return {
    token,
    user: {
      id: user.id,
      account: user.phone,
      role: user.role,
      nickname: nickname
    }
  };
};

/**
 * 用户登录服务
 * @param {string} phone - 手机号
 * @param {string} password - 密码
 * @param {number} [tokenExpiresIn] - Token 过期时间(秒)
 * @returns {Promise<Object>} - 登录结果
 */
const loginService = async (phone, password, tokenExpiresIn) => {
  const user = await User.findOne({
    where: { phone }
  });

  if (!user) {
    const error = new Error('手机号不存在');
    error.code = 3007;
    error.httpStatus = 400;
    throw error;
  }

  if (!user.password) {
    const error = new Error('密码错误');
    error.code = 3008;
    error.httpStatus = 400;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    const error = new Error('密码错误');
    error.code = 3008;
    error.httpStatus = 400;
    throw error;
  }

  let expiresIn = '2h';
  const expiresInSeconds = Number(tokenExpiresIn);
  if (Number.isFinite(expiresInSeconds) && expiresInSeconds > 0) {
    expiresIn = Math.floor(expiresInSeconds);
  }

  const token = jwt.sign(
    { userId: user.id, phone: user.phone, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn }
  );

  await user.update({
    last_login_at: new Date(),
    login_count: user.login_count + 1
  });

  const profile = await UserProfile.findOne({
    where: { user_id: user.id }
  });

  const responseData = {
    token,
    user: {
      id: user.id,
      account: user.phone,
      role: user.role
    }
  };

  if (profile) {
    responseData.user.profile = {
      nickname: profile.nickname
    };
  }

  return responseData;
};

/**
 * 忘记密码服务
 * @param {string} phone - 手机号
 * @returns {Promise<Object>} - 发送结果
 */
const forgotPasswordService = async (phone) => {
  const user = await User.findOne({
    where: { phone }
  });

  if (!user) {
    const error = new Error('手机号不存在');
    error.code = 3007;
    error.httpStatus = 400;
    throw error;
  }

  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const recentCode = await VerificationCode.findOne({
    where: {
      phone,
      type: 'reset',
      created_at: {
        [Op.gte]: oneMinuteAgo
      }
    }
  });

  if (recentCode) {
    const error = new Error('验证码发送频率限制（60秒内只能发送一次）');
    error.code = 3002;
    error.httpStatus = 400;
    throw error;
  }

  const code = generateCode(6);
  const expiresAt = new Date(Date.now() + 60 * 1000);

  await VerificationCode.create({
    phone,
    code,
    type: 'reset',
    expires_at: expiresAt,
    used: false
  });

  await AliyunSMS.sendVerifyCode(phone, code);

  return {
    expires_in: 60
  };
};

/**
 * 重置密码服务
 * @param {string} phone - 手机号
 * @param {string} code - 验证码
 * @param {string} newPassword - 新密码
 * @returns {Promise<void>} - 无返回值
 */
const resetPasswordService = async (phone, code, newPassword) => {
  const user = await User.findOne({
    where: { phone }
  });

  if (!user) {
    const error = new Error('手机号不存在');
    error.code = 3007;
    error.httpStatus = 400;
    throw error;
  }

  const verificationCode = await VerificationCode.findOne({
    where: {
      phone,
      type: 'reset',
      code,
      used: false,
      expires_at: {
        [Op.gt]: new Date()
      }
    }
  });

  if (!verificationCode) {
    const error = new Error('验证码错误或已过期');
    error.code = 3003;
    error.httpStatus = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await user.update({ password: hashedPassword });

  await verificationCode.update({ used: true });
};

module.exports = {
  checkAccountService,
  sendCodeService,
  registerService,
  loginService,
  forgotPasswordService,
  resetPasswordService
};
