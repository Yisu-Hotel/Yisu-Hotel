const { City } = require('../../models');
const { Op } = require('sequelize');

const getCityService = async (params = {}) => {
  const { type = 'list', keyword = '', limit = 10 } = params;
  
  let query = {};
  let order = [['sort', 'ASC']];
  
  // 根据类型构建查询
  if (type === 'hot') {
    // 热门城市可以通过sort字段排序，取前几个
    order = [['sort', 'ASC']];
  } else if (type === 'search' && keyword) {
    // 搜索城市
    query = {
      city_name: {
        [Op.like]: `%${keyword}%`
      }
    };
  }
  
  const cities = await City.findAll({
    where: query,
    order: order,
    limit: type === 'hot' ? 5 : parseInt(limit),
    attributes: ['id', 'city_name', 'province', 'latitude', 'longitude', 'sort']
  });

  // 转换为前端需要的格式
  return cities.map(city => ({
    id: city.id,
    city_name: city.city_name,
    province: city.province,
    latitude: city.latitude || 0,
    longitude: city.longitude || 0,
    sort: city.sort || 0
  }));
};

module.exports = {
  getCityService
};