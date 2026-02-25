const { Hotel, Banner } = require('../../models');
const { Op } = require('sequelize');

const getRecommendedHotelsService = async () => {
  const hotels = await Hotel.findAll({
    where: {
      status: 'approved',
      is_recommended: true
    },
    attributes: [
      'id',
      'hotel_name_cn',
      'hotel_name_en',
      'star_rating',
      'rating',
      'address',
      'description',
      'main_image_url',
      'min_price'
    ],
    order: [
      ['rating', 'DESC'],
      ['booking_count', 'DESC']
    ],
    limit: 10,
    raw: true
  });

  return {
    total: hotels.length,
    list: hotels
  };
};

const getHotActivitiesService = async () => {
  // 这里可以根据实际情况从数据库获取活动数据
  // 暂时返回空数组，后续可以添加活动表
  return {
    total: 0,
    list: []
  };
};

const getHomeDataService = async () => {
  const now = new Date();
  
  // 获取banner列表
  const banners = await Banner.findAll({
    where: {
      is_active: true,
      start_time: {
        [Op.lte]: now
      },
      end_time: {
        [Op.gte]: now
      }
    },
    order: [['sort', 'ASC']],
    attributes: ['id', 'title', 'image_url', 'target_type', 'target_id', 'url', 'sort']
  });

  // 转换banner格式
  const formattedBanners = banners.map(banner => {
    let link_url = '';
    
    switch (banner.target_type) {
      case 'hotel':
        link_url = `/mobile/hotel/${banner.target_id}`;
        break;
      case 'promotion':
        link_url = `/mobile/promotion/${banner.target_id}`;
        break;
      case 'url':
        link_url = banner.url;
        break;
      default:
        link_url = '';
    }

    return {
      id: banner.id,
      title: banner.title,
      image_url: banner.image_url,
      link_url: link_url,
      order: banner.sort,
      status: banner.is_active ? 'active' : 'inactive'
    };
  });

  // 获取推荐酒店
  const recommendedHotels = await getRecommendedHotelsService();

  // 获取热门活动
  const hotActivities = await getHotActivitiesService();

  return {
    banners: formattedBanners,
    recommended_hotels: recommendedHotels,
    hot_activities: hotActivities
  };
};

module.exports = {
  getRecommendedHotelsService,
  getHotActivitiesService,
  getHomeDataService
};