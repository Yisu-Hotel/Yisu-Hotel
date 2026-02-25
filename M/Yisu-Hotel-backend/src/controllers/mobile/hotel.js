const { searchHotelsService, getHotelDetailService, getHotelImagesService, getHotelAvailabilityService, calculatePriceService, getRoomTypesService, getRoomTypeDetailService, getHotelListService, getHotelTagsService } = require('../../services/mobile/hotel');
const { Hotel } = require('../../models');

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

// 搜索酒店
exports.searchHotels = async (req, res) => {
  try {
    const data = await searchHotelsService(req.query);
    return res.json({ code: 0, msg: '搜索成功', data });
  } catch (error) {
    return handleError(res, error, 'Search hotels error:');
  }
};

// 获取酒店列表
exports.getHotelList = async (req, res) => {
  try {
    const data = await getHotelListService(req.query);
    return res.json({ code: 0, msg: '查询成功', data });
  } catch (error) {
    return handleError(res, error, 'Get hotel list error:');
  }
};

// 获取酒店详情
exports.getHotelDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getHotelDetailService(id, req.query);
    return res.json({ code: 0, msg: '查询成功', data });
  } catch (error) {
    return handleError(res, error, 'Get hotel detail error:');
  }
};

// 获取城市热门标签与周边信息
exports.getHotelTags = async (req, res) => {
  try {
    const { city } = req.query;
    const data = await getHotelTagsService(city);
    return res.json({ code: 0, msg: '查询成功', data });
  } catch (error) {
    return handleError(res, error, 'Get hotel tags error:');
  }
};

// 获取酒店图片列表
exports.getHotelImages = async (req, res) => {
  try {
    const { hotel_id } = req.params;
    const { type } = req.query;
    const data = await getHotelImagesService(hotel_id, type);
    return res.json({ code: 0, msg: '获取成功', data });
  } catch (error) {
    return handleError(res, error, 'Get hotel images error:');
  }
};

// 获取可用日期和价格
exports.getHotelAvailability = async (req, res) => {
  try {
    const { hotel_id } = req.params;
    const { start_date, end_date } = req.query;
    const data = await getHotelAvailabilityService(hotel_id, start_date, end_date);
    return res.json({ code: 0, msg: '获取成功', data });
  } catch (error) {
    return handleError(res, error, 'Get hotel availability error:');
  }
};

// 计算价格
exports.calculatePrice = async (req, res) => {
  try {
    const { hotel_id } = req.params;
    const { check_in, check_out, room_type_id, guests } = req.body;
    const data = await calculatePriceService(hotel_id, check_in, check_out, room_type_id, guests);
    return res.json({ code: 0, msg: '计算成功', data });
  } catch (error) {
    return handleError(res, error, 'Calculate price error:');
  }
};

// 获取房型列表
exports.getRoomTypes = async (req, res) => {
  try {
    const { hotel_id } = req.params;
    const { check_in, check_out } = req.query;
    const data = await getRoomTypesService(hotel_id, check_in, check_out);
    return res.json({ code: 0, msg: '获取成功', data });
  } catch (error) {
    return handleError(res, error, 'Get room types error:');
  }
};

// 获取房型详情
exports.getRoomTypeDetail = async (req, res) => {
  try {
    const { hotel_id, room_type_id } = req.params;
    const { check_in, check_out } = req.query;
    const data = await getRoomTypeDetailService(hotel_id, room_type_id, check_in, check_out);
    return res.json({ code: 0, msg: '获取成功', data });
  } catch (error) {
    return handleError(res, error, 'Get room type detail error:');
  }
};

// 获取分享信息
exports.getShareInfo = async (req, res) => {
  try {
    const { hotel_id } = req.params;
    
    // 从数据库获取酒店信息
    const hotel = await Hotel.findOne({
      where: { id: hotel_id },
      attributes: ['id', 'hotel_name_cn', 'star_rating', 'location_info', 'min_price', 'main_image_url']
    });
    
    if (!hotel) {
      return res.status(404).json({ code: 404, msg: '酒店不存在', data: null });
    }
    
    // 生成分享信息
    const shareText = `【易宿酒店】推荐给你：${hotel.hotel_name_cn}，星级：${hotel.star_rating}星，地址：${hotel.location_info?.formatted_address || ''}，最低价格：¥${hotel.min_price || 0}起`;
    const shareUrl = `https://yisu-hotel.com/hotel/${hotel_id}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;
    
    res.json({
      code: 0,
      msg: '获取成功',
      data: {
        hotel_id,
        hotel_name: hotel.hotel_name_cn,
        share_text: shareText,
        share_url: shareUrl,
        qr_code_url: qrCodeUrl,
        image_url: hotel.main_image_url?.[0] || ''
      }
    });
  } catch (error) {
    return handleError(res, error, 'Get share info error:');
  }
};
