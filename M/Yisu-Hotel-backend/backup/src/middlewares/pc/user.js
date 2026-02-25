const jwt = require('jsonwebtoken');

/**
 * 验证用户 Token 中间件
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 * @returns {Promise<void>} - 无返回值
 */
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({
        code: 4008,
        msg: 'Token 无效或已过期',
        data: null
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        code: 4008,
        msg: 'Token 无效或已过期',
        data: null
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      code: 4008,
      msg: 'Token 无效或已过期',
      data: null
    });
  }
};

/**
 * 验证更新个人资料参数
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 * @returns {Promise<void>} - 无返回值
 */
const validateUpdateProfile = (req, res, next) => {
  const hasNickname = Object.prototype.hasOwnProperty.call(req.body, 'nickname');
  const hasGender = Object.prototype.hasOwnProperty.call(req.body, 'gender');
  const hasBirthday = Object.prototype.hasOwnProperty.call(req.body, 'birthday');
  const hasAvatar = Object.prototype.hasOwnProperty.call(req.body, 'avatar');
  const hasAvatarBase64 = Object.prototype.hasOwnProperty.call(req.body, 'avatar_base64');

  if (!hasNickname && !hasGender && !hasBirthday && !hasAvatar && !hasAvatarBase64) {
    return res.status(400).json({
      code: 4017,
      msg: '资料格式不正确',
      data: null
    });
  }

  if (hasNickname) {
    const { nickname } = req.body;
    if (nickname !== null) {
      if (typeof nickname !== 'string') {
        return res.status(400).json({
          code: 4017,
          msg: '昵称格式不正确',
          data: null
        });
      }
      const trimmedNickname = nickname.trim();
      if (trimmedNickname.length < 2 || trimmedNickname.length > 50) {
        return res.status(400).json({
          code: 4017,
          msg: '昵称格式不正确',
          data: null
        });
      }
    }
  }

  if (hasGender) {
    const { gender } = req.body;
    if (gender !== null && !['男', '女', '保密'].includes(gender)) {
      return res.status(400).json({
        code: 4017,
        msg: '性别格式不正确',
        data: null
      });
    }
  }

  if (hasBirthday) {
    const { birthday } = req.body;
    if (birthday !== null) {
      if (typeof birthday !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
        return res.status(400).json({
          code: 4017,
          msg: '生日格式不正确',
          data: null
        });
      }
      const parsedDate = new Date(`${birthday}T00:00:00Z`);
      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          code: 4017,
          msg: '生日格式不正确',
          data: null
        });
      }
    }
  }

  if (hasAvatar) {
    const { avatar } = req.body;
    if (avatar !== null) {
      if (typeof avatar !== 'string') {
        return res.status(400).json({
          code: 4017,
          msg: '头像格式不正确',
          data: null
        });
      }
      const trimmedAvatar = avatar.trim();
      if (!trimmedAvatar || trimmedAvatar.length > 500) {
        return res.status(400).json({
          code: 4017,
          msg: '头像格式不正确',
          data: null
        });
      }
    }
  }

  if (hasAvatarBase64) {
    const { avatar_base64: avatarBase64 } = req.body;
    if (avatarBase64 !== null) {
      if (typeof avatarBase64 !== 'string') {
        return res.status(400).json({
          code: 4017,
          msg: '头像格式不正确',
          data: null
        });
      }
      const trimmedBase64 = avatarBase64.trim();
      if (!trimmedBase64 || trimmedBase64.length > 2000000) {
        return res.status(400).json({
          code: 4017,
          msg: '头像格式不正确',
          data: null
        });
      }
    }
  }

  next();
};

module.exports = {
  authenticateToken,
  validateUpdateProfile,
  validateMessageListQuery: (req, res, next) => {
    const { page } = req.query;
    let pageNumber = 1;
    let sizeNumber = 5;

    if (page !== undefined) {
      pageNumber = Number(page);
      if (!Number.isFinite(pageNumber) || pageNumber < 1 || !Number.isInteger(pageNumber)) {
        return res.status(400).json({
          code: 4009,
          msg: '参数格式不正确',
          data: null
        });
      }
    }

    req.messageQuery = {
      page: pageNumber,
      pageSize: sizeNumber
    };

    next();
  }
};
