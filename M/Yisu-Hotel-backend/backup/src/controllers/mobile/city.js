const { getCityService } = require('../../services/mobile/city');

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

// 获取城市列表、热门城市、搜索城市统一接口
exports.getCities = async (req, res) => {
  try {
    const { type = 'list', keyword = '', limit = 10 } = req.query;
    
    if (type === 'search' && !keyword) {
      return res.status(400).json({ code: 400, msg: '请提供搜索关键词', data: null });
    }
    
    const data = await getCityService({ type, keyword, limit });
    return res.json({ code: 0, msg: '获取成功', data });
  } catch (error) {
    return handleError(res, error, 'Get cities error:');
  }
};
