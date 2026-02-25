const { sequelize, Hotel } = require('./src/models');

async function checkHotelData() {
  try {
    console.log('连接数据库...');
    await sequelize.authenticate();
    
    console.log('查询酒店数据...');
    const hotels = await Hotel.findAll({
      limit: 5,
      attributes: ['id', 'hotel_name_cn', 'hotel_name_en', 'star_rating', 'status']
    });
    
    console.log('酒店数据:');
    hotels.forEach(hotel => {
      console.log({
        id: hotel.id,
        name: hotel.hotel_name_cn,
        englishName: hotel.hotel_name_en,
        stars: hotel.star_rating,
        status: hotel.status
      });
    });
    
    console.log(`共查询到 ${hotels.length} 条酒店数据`);
  } catch (error) {
    console.error('查询失败:', error);
  } finally {
    await sequelize.close();
  }
}

checkHotelData();
