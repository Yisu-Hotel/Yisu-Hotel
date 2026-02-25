const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User, VerificationCode, UserProfile } = require('../../models');
const { generateCode } = require('../../utils/code');
const { generateNickname } = require('../../utils/nickname');
const AliyunSMS = require('../../utils/sms');

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

const checkPhoneService = async (phone) => {
  const user = await User.findOne({
    where: { phone }
  });

  if (user) {
    return {
      available: false,
      msg: '该手机号已注册，请直接登录'
    };
  }

  return {
    available: true,
    msg: '手机号可用'
  };
};

const registerService = async ({ phone, password, code }) => {
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
    const error = new Error('验证码错误或已过期');
    error.code = 3003;
    error.httpStatus = 400;
    throw error;
  }

  const existingUser = await User.findOne({
    where: { phone }
  });

  if (existingUser) {
    const error = new Error('手机号已注册');
    error.code = 3005;
    error.httpStatus = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const nickname = generateNickname('mobile');

  const user = await User.create({
    phone,
    password: hashedPassword,
    role: 'mobile',
    nickname: nickname,
    login_count: 0
  });

  await verificationCode.update({ used: true });

  await UserProfile.create({
    user_id: user.id,
    nickname: nickname
  });

  const expiresIn = process.env.JWT_EXPIRES_IN || '2h';
  const token = jwt.sign(
    { user_id: user.id, phone: user.phone, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn }
  );

  return {
    token,
    user: {
      id: user.id,
      phone: user.phone,
      role: user.role,
      is_new_user: true,
      profile: {
        nickname: nickname
      }
    }
  };
};

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

  let expiresIn = process.env.JWT_EXPIRES_IN || '2h';
  const expiresInSeconds = Number(tokenExpiresIn);
  if (Number.isFinite(expiresInSeconds) && expiresInSeconds > 0) {
    expiresIn = Math.floor(expiresInSeconds);
  }

  const token = jwt.sign(
    { user_id: user.id, phone: user.phone, role: user.role },
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
      phone: user.phone,
      role: user.role
    }
  };

  if (profile) {
    responseData.user.profile = {
      nickname: profile.nickname,
      avatar: profile.avatar
    };
  }

  return responseData;
};

const resetPasswordService = async ({ phone, code, password }) => {
  // 验证验证码
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

  // 检查用户是否存在
  const user = await User.findOne({
    where: { phone }
  });

  if (!user) {
    const error = new Error('手机号不存在');
    error.code = 3007;
    error.httpStatus = 400;
    throw error;
  }

  // 更新密码
  const hashedPassword = await bcrypt.hash(password, 10);
  await user.update({ password: hashedPassword });

  // 标记验证码为已使用
  await verificationCode.update({ used: true });
};

module.exports = {
  sendCodeService,
  checkPhoneService,
  registerService,
  loginService,
  resetPasswordService
};
