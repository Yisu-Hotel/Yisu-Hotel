const { User, Favorite, History, Hotel } = require('../src/models');

async function addUserData() {
  try {
    console.log('🔄 Connecting to database...');
    await require('../src/models').sequelize.authenticate();
    console.log('✅ Connected successfully!');

    const phone = '18595890987';
    console.log(`\n📱 Adding data for user with phone: ${phone}`);

    // 查找用户
    const user = await User.findOne({ where: { phone } });

    if (!user) {
      console.log('❌ User not found!');
      process.exit(1);
    }

    console.log(`✅ User found: ${user.phone} (${user.nickname}) - ${user.role}`);
    console.log(`   User ID: ${user.id}`);

    // 获取所有酒店
    const hotels = await Hotel.findAll();
    console.log(`\nFound ${hotels.length} hotels`);

    // 为用户添加收藏记录
    console.log('\n❤️ Adding favorite records...');
    const favoriteCount = 3; // 添加3个收藏记录
    const favorites = [];

    for (let i = 0; i < Math.min(favoriteCount, hotels.length); i++) {
      try {
        const [favorite, created] = await Favorite.findOrCreate({
          where: {
            user_id: user.id,
            hotel_id: hotels[i].id
          },
          defaults: {
            user_id: user.id,
            hotel_id: hotels[i].id
          }
        });

        if (created) {
          console.log(`✓ Added favorite for hotel: ${hotels[i].hotel_name_cn}`);
          favorites.push(favorite);
        } else {
          console.log(`⚠️  Favorite already exists for hotel: ${hotels[i].hotel_name_cn}`);
        }
      } catch (error) {
        console.error(`❌ Error adding favorite for hotel ${hotels[i].hotel_name_cn}:`, error.message);
      }
    }

    // 为用户添加历史记录
    console.log('\n📜 Adding history records...');
    const historyCount = 5; // 添加5个历史记录
    const histories = [];

    for (let i = 0; i < Math.min(historyCount, hotels.length); i++) {
      try {
        const history = await History.create({
          user_id: user.id,
          hotel_id: hotels[i].id,
          action: 'view',
          viewed_at: new Date()
        });

        console.log(`✓ Added history record for hotel: ${hotels[i].hotel_name_cn}`);
        histories.push(history);
      } catch (error) {
        console.error(`❌ Error adding history record for hotel ${hotels[i].hotel_name_cn}:`, error.message);
      }
    }

    console.log('\n✅ All data added successfully!');
    console.log(`   Added ${favorites.length} favorite records`);
    console.log(`   Added ${histories.length} history records`);

  } catch (error) {
    console.error('❌ Error adding user data:', error);
    process.exit(1);
  } finally {
    await require('../src/models').sequelize.close();
    console.log('\n🔌 Connection closed.');
  }
}

addUserData();
