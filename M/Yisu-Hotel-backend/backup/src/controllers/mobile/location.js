const { getCurrentLocationService, getLocationByIPService, searchNearbyHotelsService } = require('../../services/mobile/location');

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

const locationController = {
  // 获取用户当前位置
  getCurrentLocation: async (req, res) => {
    try {
      const data = await getCurrentLocationService(req.query);
      return res.json({ code: 0, msg: '获取成功', data });
    } catch (error) {
      return handleError(res, error, 'Get current location error:');
    }
  },

  // 根据IP获取用户位置
  getLocationByIP: async (req, res) => {
    try {
      const userIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
      const data = await getLocationByIPService(userIP);
      return res.json({ code: 0, msg: '获取成功', data });
    } catch (error) {
      return handleError(res, error, 'Get location by IP error:');
    }
  },

  // 搜索附近的酒店
  searchNearbyHotels: async (req, res) => {
    try {
      const data = await searchNearbyHotelsService(req.query);
      return res.json({ code: 0, msg: '搜索成功', data });
    } catch (error) {
      return handleError(res, error, 'Search nearby hotels error:');
    }
  }
};

module.exports = locationController;