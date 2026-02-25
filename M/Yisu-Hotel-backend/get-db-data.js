const { Hotel, RoomType, Booking, User } = require('./src/models');

async function getDbData() {
  try {
    console.log('Connecting to database...');
    await require('./src/models').sequelize.authenticate();
    console.log('Connected successfully!');

    // 获取酒店数据
    console.log('\n=== Hotels ===');
    const hotels = await Hotel.findAll();
    hotels.forEach(hotel => {
      console.log(`ID: ${hotel.id}, Name: ${hotel.hotel_name_cn}`);
    });

    // 获取房型数据
    console.log('\n=== Room Types ===');
    const roomTypes = await RoomType.findAll();
    roomTypes.forEach(roomType => {
      console.log(`ID: ${roomType.id}, Hotel ID: ${roomType.hotel_id}, Name: ${roomType.room_type_name}`);
    });

    // 获取预订数据
    console.log('\n=== Bookings ===');
    const bookings = await Booking.findAll();
    bookings.forEach(booking => {
      console.log(`ID: ${booking.id}, User ID: ${booking.user_id}, Hotel ID: ${booking.hotel_id}, Status: ${booking.status}`);
    });

    // 获取用户数据
    console.log('\n=== Users ===');
    const users = await User.findAll({ where: { role: 'mobile' } });
    users.forEach(user => {
      console.log(`ID: ${user.id}, Phone: ${user.phone}, Role: ${user.role}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await require('./src/models').sequelize.close();
    console.log('\nConnection closed.');
  }
}

getDbData();