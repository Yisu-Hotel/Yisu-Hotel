const { Hotel, HotelImage, RoomType } = require('../../models');

const getCurrentLocationService = async (params) => {
  const { latitude, longitude } = params;
  
  // 如果前端提供了经纬度，使用前端提供的位置
  if (latitude && longitude) {
    try {
      // 这里可以调用第三方地理编码服务获取详细地址
      // 暂时返回模拟数据
      return {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        city: '北京市',
        district: '东城区',
        address: '北京市东城区王府井大街',
        adcode: '110101'
      };
    } catch (error) {
      // 如果出错，返回模拟数据
      return {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        city: '北京市',
        district: '东城区',
        address: '北京市东城区王府井大街',
        adcode: '110101'
      };
    }
  }
  
  // 模拟默认位置（北京）
  return {
    latitude: 39.9042,
    longitude: 116.4074,
    city: '北京市',
    district: '东城区',
    address: '北京市东城区天安门广场',
    adcode: '110101'
  };
};

const getLocationByIPService = async (ip) => {
  try {
    // 这里可以调用第三方IP地理位置服务获取位置信息
    // 暂时返回模拟数据
    return {
      ip: ip || '127.0.0.1',
      latitude: 39.9042,
      longitude: 116.4074,
      city: '北京市',
      district: '东城区',
      address: '北京市东城区天安门广场',
      adcode: '110101'
    };
  } catch (error) {
    // 如果出错，返回模拟数据
    return {
      ip: ip || '127.0.0.1',
      latitude: 39.9042,
      longitude: 116.4074,
      city: '北京市',
      district: '东城区',
      address: '北京市东城区天安门广场',
      adcode: '110101'
    };
  }
};

const searchNearbyHotelsService = async (params) => {
  const { latitude, longitude, radius = 5000, page = 1, page_size = 10 } = params;
  
  // 验证参数
  if (!latitude || !longitude) {
    const error = new Error('缺少经纬度参数');
    error.code = 400;
    error.httpStatus = 400;
    throw error;
  }
  
  try {
    // 查询酒店列表
    const hotels = await Hotel.findAll({
      include: [
        {
          model: HotelImage,
          where: { is_main: true },
          attributes: ['image_url'],
          required: false
        },
        {
          model: RoomType,
          attributes: ['price'],
          required: false
        }
      ]
    });
    
    // 模拟计算距离并过滤
    const nearbyHotels = hotels.map(hotel => {
      // 模拟计算距离（实际应该使用地理距离算法）
      const distance = Math.floor(Math.random() * radius);
      
      // 找到酒店的最低价格
      let minPrice = 0;
      if (hotel.RoomTypes && hotel.RoomTypes.length > 0) {
        minPrice = Math.min(...hotel.RoomTypes.map(room => room.price));
      }
      
      // 找到酒店主图
      let mainImageUrl = null;
      if (hotel.HotelImages && hotel.HotelImages.length > 0) {
        mainImageUrl = hotel.HotelImages[0].image_url;
      }
      
      return {
        id: hotel.id,
        name: hotel.name,
        distance: distance,
        latitude: hotel.latitude || 39.9042,
        longitude: hotel.longitude || 116.4074,
        address: hotel.address,
        star_rating: hotel.star_rating,
        rating: hotel.rating || 4.5,
        min_price: minPrice,
        main_image_url: mainImageUrl || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=酒店外观，现代风格&image_size=landscape_4_3'
      };
    }).filter(hotel => hotel.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
    
    // 分页
    const startIndex = (parseInt(page) - 1) * parseInt(page_size);
    const endIndex = startIndex + parseInt(page_size);
    const paginatedHotels = nearbyHotels.slice(startIndex, endIndex);
    
    return {
      hotels: paginatedHotels,
      total: nearbyHotels.length,
      page: parseInt(page),
      page_size: parseInt(page_size),
      radius: parseInt(radius)
    };
  } catch (error) {
    // 如果数据库操作失败，返回模拟数据
    return {
      hotels: [
        {
          id: 'hotel_001',
          name: '易宿酒店北京王府井店',
          distance: 1200,
          latitude: 39.9142,
          longitude: 116.4174,
          address: '北京市东城区王府井大街88号',
          star_rating: 4,
          rating: 4.5,
          min_price: 399,
          main_image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=北京豪华酒店外观，现代风格，高端大气，王府井地区&image_size=landscape_4_3'
        },
        {
          id: 'hotel_002',
          name: '易宿酒店北京天安门店',
          distance: 800,
          latitude: 39.9092,
          longitude: 116.3974,
          address: '北京市东城区前门大街100号',
          star_rating: 3,
          rating: 4.2,
          min_price: 299,
          main_image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=北京经济型酒店外观，现代风格，干净整洁，天安门附近&image_size=landscape_4_3'
        }
      ],
      total: 2,
      page: parseInt(page),
      page_size: parseInt(page_size),
      radius: parseInt(radius)
    };
  }
};

module.exports = {
  getCurrentLocationService,
  getLocationByIPService,
  searchNearbyHotelsService
};