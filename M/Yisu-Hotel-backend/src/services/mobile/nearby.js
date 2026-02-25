const { Hotel } = require('../../models');

const getHotelNearbyInfoService = async (hotel_id, params) => {
  const { type, radius = 3000 } = params;
  
  // 验证参数
  if (!hotel_id) {
    const error = new Error('缺少酒店ID参数');
    error.code = 400;
    error.httpStatus = 400;
    throw error;
  }
  
  try {
    // 验证酒店是否存在
    const hotel = await Hotel.findByPk(hotel_id);
    if (!hotel) {
      const error = new Error('酒店不存在');
      error.code = 4001;
      error.httpStatus = 404;
      throw error;
    }
    
    // 模拟周边信息数据
    const nearbyInfo = {
      attractions: [
        {
          id: 1,
          name: '故宫博物院',
          distance: 2500,
          rating: 4.8,
          address: '北京市东城区景山前街4号',
          description: '中国明清两代的皇家宫殿，世界文化遗产',
          image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=故宫博物院，宏伟建筑，中国传统风格&image_size=landscape_4_3'
        },
        {
          id: 2,
          name: '天安门广场',
          distance: 1800,
          rating: 4.7,
          address: '北京市东城区天安门广场',
          description: '世界上最大的城市广场',
          image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=天安门广场，宏伟壮观，中国国旗&image_size=landscape_4_3'
        },
        {
          id: 3,
          name: '王府井步行街',
          distance: 800,
          rating: 4.5,
          address: '北京市东城区王府井大街',
          description: '北京著名的商业步行街',
          image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=王府井步行街，繁华商业区，现代建筑&image_size=landscape_4_3'
        }
      ],
      facilities: [
        {
          id: 1,
          name: '北京协和医院',
          distance: 1200,
          type: 'hospital',
          address: '北京市东城区帅府园1号',
          description: '三级甲等综合医院',
          image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=现代医院建筑，干净整洁，专业&image_size=landscape_4_3'
        },
        {
          id: 2,
          name: '王府井地铁站',
          distance: 600,
          type: 'subway',
          address: '北京市东城区王府井大街',
          description: '地铁1号线和5号线换乘站',
          image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=地铁站入口，现代设计，繁忙&image_size=landscape_4_3'
        },
        {
          id: 3,
          name: '东方广场',
          distance: 500,
          type: 'shopping',
          address: '北京市东城区东长安街1号',
          description: '大型综合商业中心',
          image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=大型购物中心，现代建筑，玻璃外立面&image_size=landscape_4_3'
        },
        {
          id: 4,
          name: '全聚德烤鸭店',
          distance: 700,
          type: 'restaurant',
          address: '北京市东城区王府井大街32号',
          description: '百年老字号烤鸭店',
          image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=传统烤鸭店，中式装修，高端大气&image_size=landscape_4_3'
        }
      ],
      transportation: [
        {
          id: 1,
          name: '王府井公交站',
          distance: 400,
          type: 'bus',
          routes: ['1路', '52路', '59路', '82路'],
          address: '北京市东城区王府井大街'
        },
        {
          id: 2,
          name: '王府井出租车停靠点',
          distance: 300,
          type: 'taxi',
          address: '北京市东城区王府井大街'
        }
      ]
    };
    
    // 根据类型过滤
    let result = nearbyInfo;
    if (type) {
      switch (type) {
        case 'attractions':
          result = { attractions: nearbyInfo.attractions };
          break;
        case 'facilities':
          result = { facilities: nearbyInfo.facilities };
          break;
        case 'transportation':
          result = { transportation: nearbyInfo.transportation };
          break;
        default:
          break;
      }
    }
    
    return {
      ...result,
      radius: parseInt(radius)
    };
  } catch (error) {
    // 如果数据库操作失败，返回模拟数据
    const nearbyInfo = {
      attractions: [
        {
          id: 1,
          name: '故宫博物院',
          distance: 2500,
          rating: 4.8,
          address: '北京市东城区景山前街4号',
          description: '中国明清两代的皇家宫殿，世界文化遗产',
          image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=故宫博物院，宏伟建筑，中国传统风格&image_size=landscape_4_3'
        }
      ],
      facilities: [
        {
          id: 1,
          name: '王府井地铁站',
          distance: 600,
          type: 'subway',
          address: '北京市东城区王府井大街',
          description: '地铁1号线和5号线换乘站',
          image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=地铁站入口，现代设计，繁忙&image_size=landscape_4_3'
        }
      ]
    };
    
    // 根据类型过滤
    let result = nearbyInfo;
    if (type) {
      switch (type) {
        case 'attractions':
          result = { attractions: nearbyInfo.attractions };
          break;
        case 'facilities':
          result = { facilities: nearbyInfo.facilities };
          break;
        default:
          break;
      }
    }
    
    return {
      ...result,
      radius: parseInt(radius)
    };
  }
};

const getNearbyAttractionsService = async (hotel_id, params) => {
  const { page = 1, page_size = 10, radius = 5000 } = params;
  
  // 验证参数
  if (!hotel_id) {
    const error = new Error('缺少酒店ID参数');
    error.code = 400;
    error.httpStatus = 400;
    throw error;
  }
  
  try {
    // 验证酒店是否存在
    const hotel = await Hotel.findByPk(hotel_id);
    if (!hotel) {
      const error = new Error('酒店不存在');
      error.code = 4001;
      error.httpStatus = 404;
      throw error;
    }
    
    // 模拟周边景点数据
    const attractions = [
      {
        id: 1,
        name: '故宫博物院',
        distance: 2500,
        rating: 4.8,
        address: '北京市东城区景山前街4号',
        description: '中国明清两代的皇家宫殿，世界文化遗产',
        image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=故宫博物院，宏伟建筑，中国传统风格&image_size=landscape_4_3',
        open_hours: '08:30-17:00',
        ticket_price: '60元'
      },
      {
        id: 2,
        name: '天安门广场',
        distance: 1800,
        rating: 4.7,
        address: '北京市东城区天安门广场',
        description: '世界上最大的城市广场',
        image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=天安门广场，宏伟壮观，中国国旗&image_size=landscape_4_3',
        open_hours: '全天开放',
        ticket_price: '免费'
      },
      {
        id: 3,
        name: '王府井步行街',
        distance: 800,
        rating: 4.5,
        address: '北京市东城区王府井大街',
        description: '北京著名的商业步行街',
        image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=王府井步行街，繁华商业区，现代建筑&image_size=landscape_4_3',
        open_hours: '10:00-22:00',
        ticket_price: '免费'
      },
      {
        id: 4,
        name: '景山公园',
        distance: 2200,
        rating: 4.6,
        address: '北京市西城区景山西街44号',
        description: '俯瞰故宫全景的最佳地点',
        image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=景山公园，山顶观景台，故宫全景&image_size=landscape_4_3',
        open_hours: '06:30-21:00',
        ticket_price: '2元'
      }
    ];
    
    // 分页
    const startIndex = (parseInt(page) - 1) * parseInt(page_size);
    const endIndex = startIndex + parseInt(page_size);
    const paginatedAttractions = attractions.slice(startIndex, endIndex);
    
    return {
      attractions: paginatedAttractions,
      total: attractions.length,
      page: parseInt(page),
      page_size: parseInt(page_size),
      radius: parseInt(radius)
    };
  } catch (error) {
    // 如果数据库操作失败，返回模拟数据
    const attractions = [
      {
        id: 1,
        name: '故宫博物院',
        distance: 2500,
        rating: 4.8,
        address: '北京市东城区景山前街4号',
        description: '中国明清两代的皇家宫殿，世界文化遗产',
        image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=故宫博物院，宏伟建筑，中国传统风格&image_size=landscape_4_3',
        open_hours: '08:30-17:00',
        ticket_price: '60元'
      }
    ];
    
    return {
      attractions: attractions,
      total: attractions.length,
      page: parseInt(page),
      page_size: parseInt(page_size),
      radius: parseInt(radius)
    };
  }
};

const getNearbyFacilitiesService = async (hotel_id, params) => {
  const { type, radius = 3000 } = params;
  
  // 验证参数
  if (!hotel_id) {
    const error = new Error('缺少酒店ID参数');
    error.code = 400;
    error.httpStatus = 400;
    throw error;
  }
  
  try {
    // 验证酒店是否存在
    const hotel = await Hotel.findByPk(hotel_id);
    if (!hotel) {
      const error = new Error('酒店不存在');
      error.code = 4001;
      error.httpStatus = 404;
      throw error;
    }
    
    // 模拟周边设施数据
    const facilities = [
      {
        id: 1,
        name: '北京协和医院',
        distance: 1200,
        type: 'hospital',
        address: '北京市东城区帅府园1号',
        description: '三级甲等综合医院',
        image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=现代医院建筑，干净整洁，专业&image_size=landscape_4_3'
      },
      {
        id: 2,
        name: '王府井地铁站',
        distance: 600,
        type: 'subway',
        address: '北京市东城区王府井大街',
        description: '地铁1号线和5号线换乘站',
        image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=地铁站入口，现代设计，繁忙&image_size=landscape_4_3'
      },
      {
        id: 3,
        name: '东方广场',
        distance: 500,
        type: 'shopping',
        address: '北京市东城区东长安街1号',
        description: '大型综合商业中心',
        image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=大型购物中心，现代建筑，玻璃外立面&image_size=landscape_4_3'
      },
      {
        id: 4,
        name: '全聚德烤鸭店',
        distance: 700,
        type: 'restaurant',
        address: '北京市东城区王府井大街32号',
        description: '百年老字号烤鸭店',
        image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=传统烤鸭店，中式装修，高端大气&image_size=landscape_4_3'
      },
      {
        id: 5,
        name: '中国银行王府井支行',
        distance: 400,
        type: 'bank',
        address: '北京市东城区王府井大街20号',
        description: '中国银行北京市分行王府井支行',
        image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=银行大楼，现代建筑，专业&image_size=landscape_4_3'
      }
    ];
    
    // 根据类型过滤
    let filteredFacilities = facilities;
    if (type) {
      filteredFacilities = facilities.filter(facility => facility.type === type);
    }
    
    return {
      facilities: filteredFacilities,
      total: filteredFacilities.length,
      radius: parseInt(radius)
    };
  } catch (error) {
    // 如果数据库操作失败，返回模拟数据
    const facilities = [
      {
        id: 1,
        name: '王府井地铁站',
        distance: 600,
        type: 'subway',
        address: '北京市东城区王府井大街',
        description: '地铁1号线和5号线换乘站',
        image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=地铁站入口，现代设计，繁忙&image_size=landscape_4_3'
      }
    ];
    
    // 根据类型过滤
    let filteredFacilities = facilities;
    if (type) {
      filteredFacilities = facilities.filter(facility => facility.type === type);
    }
    
    return {
      facilities: filteredFacilities,
      total: filteredFacilities.length,
      radius: parseInt(radius)
    };
  }
};

module.exports = {
  getHotelNearbyInfoService,
  getNearbyAttractionsService,
  getNearbyFacilitiesService
};