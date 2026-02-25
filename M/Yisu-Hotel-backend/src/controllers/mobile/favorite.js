const { getFavoriteListService, removeFavoriteService, addFavoriteService } = require('../../services/mobile/favorite');

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

// 添加收藏
exports.addFavorite = async (req, res) => {
  try {
    const { user_id } = req.user || { user_id: 'test_user' }; // 临时添加测试用户ID
    const { hotel_id } = req.body;
    const data = await addFavoriteService(user_id, hotel_id);
    return res.json({ code: 0, msg: '收藏成功', data });
  } catch (error) {
    return handleError(res, error, 'Add favorite error:');
  }
};

// 移除收藏
exports.removeFavorite = async (req, res) => {
  try {
    const { user_id } = req.user || { user_id: 'test_user' }; // 临时添加测试用户ID
    const { hotel_id } = req.body;
    const data = await removeFavoriteService(user_id, hotel_id);
    return res.json({ code: 0, msg: '取消收藏成功', data });
  } catch (error) {
    return handleError(res, error, 'Remove favorite error:');
  }
};

// 获取收藏列表
exports.getFavoriteList = async (req, res) => {
  try {
    const { user_id } = req.user || { user_id: 'test_user' }; // 临时添加测试用户ID
    const { page = 1, pageSize = 10 } = req.query;
    const data = await getFavoriteListService(user_id, { page, pageSize });
    return res.json({ code: 0, msg: '查询成功', data });
  } catch (error) {
    return handleError(res, error, 'Get favorite list error:');
  }
};
