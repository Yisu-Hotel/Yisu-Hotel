const { Hotel, RoomType, RoomPrice } = require('../src/models');

async function checkHotelRooms() {
  try {
    console.log('🔄 Connecting to database...');
    await require('../src/models').sequelize.authenticate();
    console.log('✅ Connected successfully!');

    const hotelName = '阳光酒店';
    console.log(`\n🏨 Checking room types for hotel: ${hotelName}`);

    // 查找酒店
    const hotel = await Hotel.findOne({ where: { hotel_name_cn: hotelName } });

    if (!hotel) {
      console.log('❌ Hotel not found!');
      process.exit(1);
    }

    console.log(`✅ Hotel found: ${hotel.hotel_name_cn}`);
    console.log(`   Hotel ID: ${hotel.id}`);

    // 检查酒店的房型
    console.log('\n🛏️ Checking room types...');
    const roomTypes = await RoomType.findAll({ 
      where: { hotel_id: hotel.id }
    });

    if (roomTypes.length === 0) {
      console.log('❌ No room types found for this hotel');
    } else {
      console.log(`✅ Found ${roomTypes.length} room types:`);
      for (const roomType of roomTypes) {
        console.log(`   - Room Type: ${roomType.room_type_name || 'No name'}`);
        console.log(`     ID: ${roomType.id}`);
        console.log(`     Bed Type: ${roomType.bed_type || 'No bed type'}`);
        console.log(`     Area: ${roomType.area || 'No area'} sqm`);
        console.log(`     Max Guests: ${roomType.max_guests || 'No max guests'}`);
        console.log(`     Base Price: ¥${roomType.base_price || 'No base price'}`);
        console.log(`     Description: ${roomType.description || 'No description'}`);
        console.log(`     Main Image URL: ${roomType.main_image_url || 'No image'}`);
        
        // 单独查询价格信息
        const roomPrices = await RoomPrice.findAll({ 
          where: { room_type_id: roomType.id },
          attributes: ['price_date', 'price'] 
        });
        console.log(`     Number of prices: ${roomPrices.length}`);
        if (roomPrices.length > 0) {
          console.log(`     Sample price: ¥${roomPrices[0].price} (${roomPrices[0].price_date})`);
        }
        console.log('');
      }
    }

    // 检查所有酒店的房型数量
    console.log('\n📊 Checking room types count for all hotels...');
    const allHotels = await Hotel.findAll({ attributes: ['id', 'hotel_name_cn'] });
    for (const hotel of allHotels) {
      const count = await RoomType.count({ where: { hotel_id: hotel.id } });
      console.log(`   ${hotel.hotel_name_cn}: ${count} room types`);
    }

    console.log('\n✅ Check completed!');

  } catch (error) {
    console.error('❌ Error checking hotel rooms:', error);
    process.exit(1);
  } finally {
    await require('../src/models').sequelize.close();
    console.log('\n🔌 Connection closed.');
  }
}

checkHotelRooms();
