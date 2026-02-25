const { Banner } = require('../../models');
const { Op } = require('sequelize');

const getBannerListService = async () => {
  const now = new Date();
  
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
    attributes: ['id', 'title', 'description', 'image_url', 'target_type', 'target_id', 'url', 'sort']
  });

  // 转换为前端需要的格式
  return banners.map(banner => ({
    image_url: banner.image_url,
    title: banner.title,
    description: banner.description || '',
    target_type: banner.target_type || 'hotel',
    target_id: banner.target_id || '',
    url: banner.url || ''
  }));
};

module.exports = {
  getBannerListService
};