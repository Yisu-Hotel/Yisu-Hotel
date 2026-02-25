const { getHotelNearbyInfoService, getNearbyAttractionsService, getNearbyFacilitiesService } = require('../../services/mobile/nearby');

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

const nearbyController = {
  // 获取酒店周边信息
  getHotelNearbyInfo: async (req, res) => {
    try {
      const { hotel_id } = req.params;
      const data = await getHotelNearbyInfoService(hotel_id, req.query);
      return res.json({ code: 0, msg: '获取成功', data });
    } catch (error) {
      return handleError(res, error, 'Get hotel nearby info error:');
    }
  },

  // 获取酒店周边景点
  getNearbyAttractions: async (req, res) => {
    try {
      const { hotel_id } = req.params;
      const data = await getNearbyAttractionsService(hotel_id, req.query);
      return res.json({ code: 0, msg: '获取成功', data });
    } catch (error) {
      return handleError(res, error, 'Get nearby attractions error:');
    }
  },

  // 获取酒店周边设施
  getNearbyFacilities: async (req, res) => {
    try {
      const { hotel_id } = req.params;
      const data = await getNearbyFacilitiesService(hotel_id, req.query);
      return res.json({ code: 0, msg: '获取成功', data });
    } catch (error) {
      return handleError(res, error, 'Get nearby facilities error:');
    }
  }
};

module.exports = nearbyController;