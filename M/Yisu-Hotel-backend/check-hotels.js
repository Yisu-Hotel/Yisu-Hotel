const { Hotel } = require('./src/models');

async function checkHotels() {
  try {
    console.log('🔄 Connecting to database...');
    await require('./src/models').sequelize.authenticate();
    console.log('✅ Connected successfully!');

    // 查询所有酒店
    const hotels = await Hotel.findAll();
    
    console.log(`\n=== Found ${hotels.length} hotels ===`);
    
    for (const hotel of hotels) {
      console.log(`\nHotel ID: ${hotel.id}`);
      console.log(`Hotel Name: ${hotel.hotel_name_cn}`);
      console.log(`Hotel Name (EN): ${hotel.hotel_name_en}`);
      console.log(`Star Rating: ${hotel.star_rating}`);
      console.log(`Status: ${hotel.status}`);
    }

    console.log('\nCheck completed!');

  } catch (error) {
    console.error('❌ Error checking hotels:', error);
  } finally {
    await require('./src/models').sequelize.close();
    console.log('🔌 Connection closed.');
  }
}

checkHotels();
