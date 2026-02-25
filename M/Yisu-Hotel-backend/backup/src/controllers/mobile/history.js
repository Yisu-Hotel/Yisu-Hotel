const { getHistoryListService, removeHistoryService, clearHistoryService } = require('../../services/mobile/history');

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

// 获取浏览历史列表
exports.getHistoryList = async (req, res) => {
  try {
    const { user_id } = req.user || { user_id: 'test_user' }; // 临时添加测试用户ID
    const data = await getHistoryListService(user_id, req.query);
    return res.json({ code: 0, msg: '查询成功', data });
  } catch (error) {
    return handleError(res, error, 'Get history list error:');
  }
};

// 删除单条浏览历史
exports.removeHistory = async (req, res) => {
  try {
    const { user_id } = req.user || { user_id: 'test_user' }; // 临时添加测试用户ID
    const history_id = req.params.id;
    const data = await removeHistoryService(user_id, history_id);
    return res.json({ code: 0, msg: '删除成功', data });
  } catch (error) {
    return handleError(res, error, 'Remove history error:');
  }
};

// 清空所有浏览历史
exports.clearHistory = async (req, res) => {
  try {
    const { user_id } = req.user || { user_id: 'test_user' }; // 临时添加测试用户ID
    const data = await clearHistoryService(user_id);
    return res.json({ code: 0, msg: '清空成功', data });
  } catch (error) {
    return handleError(res, error, 'Clear history error:');
  }
};
