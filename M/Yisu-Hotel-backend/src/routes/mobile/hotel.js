const express = require('express');
const router = express.Router();
const hotelController = require('../../controllers/mobile/hotel');
const authMiddleware = require('../../middlewares/mobile/auth');
const { hotelSearchValidator } = require('../../middlewares/mobile/validator');

// 获取酒店列表
router.get('/list', hotelController.getHotelList);

// 搜索酒店
router.get('/search', hotelController.searchHotels);

// 获取酒店详情
router.get('/detail/:id', hotelController.getHotelDetail);

// 获取城市热门标签与周边信息
router.get('/tags', hotelController.getHotelTags);

// 兼容前端API请求路径 - 获取城市热门标签与周边信息
router.get('/popular-tags', async (req, res) => {
  try {
    const { location } = req.query;
    const data = await require('../../services/mobile/hotel').getHotelTagsService(location);
    return res.json({ code: 0, msg: '查询成功', data });
  } catch (error) {
    return require('../../controllers/mobile/hotel').handleError(res, error, 'Get hotel tags error:');
  }
});

// 兼容前端API请求路径 - 获取酒店详情
router.get('/:hotel_id', (req, res, next) => {
  req.params.id = req.params.hotel_id;
  next();
}, hotelController.getHotelDetail);

// 获取酒店图片列表
router.get('/:hotel_id/images', authMiddleware, hotelController.getHotelImages);

// 获取可用日期和价格
router.get('/:hotel_id/availability', authMiddleware, hotelController.getHotelAvailability);

// 计算价格
router.post('/:hotel_id/calculate-price', authMiddleware, hotelController.calculatePrice);

// 获取房型列表
router.get('/:hotel_id/room-types', authMiddleware, hotelController.getRoomTypes);

// 获取房型详情
router.get('/:hotel_id/room-types/:room_type_id', authMiddleware, hotelController.getRoomTypeDetail);

// 获取分享信息
router.get('/:hotel_id/share', authMiddleware, hotelController.getShareInfo);

module.exports = router;
