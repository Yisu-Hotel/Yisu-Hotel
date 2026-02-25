const { getProfileService, updateProfileService } = require('../../services/pc/user');

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
 * 获取用户个人资料
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Promise<void>} - 无返回值
 */
const getProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const data = await getProfileService(userId);
    return res.json({
      code: 0,
      msg: '查询成功',
      data
    });
  } catch (error) {
    return handleError(res, error, 'Get profile error:');
  }
};

/**
 * 更新用户个人资料
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Promise<void>} - 无返回值
 */
const updateProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const updateData = {};
    const { nickname, gender, birthday, avatar, avatar_base64 } = req.body;

    if (Object.prototype.hasOwnProperty.call(req.body, 'nickname')) updateData.nickname = nickname;
    if (Object.prototype.hasOwnProperty.call(req.body, 'gender')) updateData.gender = gender;
    if (Object.prototype.hasOwnProperty.call(req.body, 'birthday')) updateData.birthday = birthday;
    if (Object.prototype.hasOwnProperty.call(req.body, 'avatar')) updateData.avatar = avatar;
    if (Object.prototype.hasOwnProperty.call(req.body, 'avatar_base64')) updateData.avatar_base64 = avatar_base64;

    const data = await updateProfileService(userId, updateData);

    return res.json({
      code: 0,
      msg: '更新成功',
      data
    });
  } catch (error) {
    return handleError(res, error, 'Update profile error:');
  }
};

module.exports = {
  getProfile,
  updateProfile
};
