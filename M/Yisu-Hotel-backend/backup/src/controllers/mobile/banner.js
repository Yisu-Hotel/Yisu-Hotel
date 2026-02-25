const { getBannerListService } = require('../../services/mobile/banner');

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

exports.getBannerList = async (req, res) => {
  try {
    const data = await getBannerListService();
    return res.json({ code: 0, msg: '获取成功', data });
  } catch (error) {
    return handleError(res, error, 'Get banner list error:');
  }
};