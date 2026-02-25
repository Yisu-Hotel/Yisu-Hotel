const { getUserInfoService, updateUserInfoService, getUserStatsService, getProfileDataService } = require('../../services/mobile/user');

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

// 获取用户信息
exports.getUserInfo = async (req, res) => {
  try {
    const { user_id } = req.user || { user_id: 'test_user' }; // 临时添加测试用户ID
    const data = await getUserInfoService(user_id);
    return res.json({ code: 0, msg: '获取成功', data });
  } catch (error) {
    return handleError(res, error, 'Get user info error:');
  }
};

// 更新用户信息
exports.updateUserInfo = async (req, res) => {
  try {
    const { user_id } = req.user || { user_id: 'test_user' }; // 临时添加测试用户ID
    const data = await updateUserInfoService(user_id, req.body);
    return res.json({ code: 0, msg: '更新成功', data });
  } catch (error) {
    return handleError(res, error, 'Update user info error:');
  }
};

// 获取用户统计信息
exports.getUserStats = async (req, res) => {
  try {
    const { user_id } = req.user || { user_id: 'test_user' }; // 临时添加测试用户ID
    const data = await getUserStatsService(user_id);
    return res.json({ code: 0, msg: '获取成功', data });
  } catch (error) {
    return handleError(res, error, 'Get user stats error:');
  }
};

// 获取个人中心数据
exports.getProfileData = async (req, res) => {
  try {
    const { user_id } = req.user || { user_id: 'test_user' }; // 临时添加测试用户ID
    const data = await getProfileDataService(user_id);
    return res.json({ code: 0, msg: '获取成功', data });
  } catch (error) {
    return handleError(res, error, 'Get profile data error:');
  }
};
