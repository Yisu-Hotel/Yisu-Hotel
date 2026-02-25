const { getRecommendedHotelsService, getHotActivitiesService, getHomeDataService } = require('../../services/mobile/home');

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

exports.getRecommendedHotels = async (req, res) => {
  try {
    const data = await getRecommendedHotelsService();
    return res.json({ code: 0, msg: '获取推荐酒店成功', data });
  } catch (error) {
    return handleError(res, error, 'Get recommended hotels error:');
  }
};

exports.getHotActivities = async (req, res) => {
  try {
    const data = await getHotActivitiesService();
    return res.json({ code: 0, msg: '获取热门活动成功', data });
  } catch (error) {
    return handleError(res, error, 'Get hot activities error:');
  }
};

exports.getHomeData = async (req, res) => {
  try {
    const data = await getHomeDataService();
    return res.json({ code: 0, msg: '获取首页数据成功', data });
  } catch (error) {
    return handleError(res, error, 'Get home data error:');
  }
};