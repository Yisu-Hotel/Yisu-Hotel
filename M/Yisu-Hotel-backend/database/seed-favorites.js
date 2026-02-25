const { User, Hotel, Favorite, History } = require('../src/models');

async function seedFavorites() {
  try {
    console.log('🔄 Connecting to database...');
    await require('../src/models').sequelize.authenticate();
    console.log('✅ Connected successfully!');

    console.log('\n🌱 Seeding favorites data...');

    // 获取手机号为18595890987的用户
    const targetUser = await User.findOne({ where: { phone: '18595890987' } });
    const hotels = await Hotel.findAll();

    console.log(`\nFound user: ${targetUser ? targetUser.phone : 'Not found'}`);
    console.log(`Found ${hotels.length} hotels`);

    // 为手机号18595890987的用户创建收藏记录
    const favorites = [];

    // 为目标用户收藏前3个酒店
    if (targetUser && hotels.length >= 3) {
      favorites.push({
        user_id: targetUser.id,
        hotel_id: hotels[0].id
      });
      favorites.push({
        user_id: targetUser.id,
        hotel_id: hotels[1].id
      });
      favorites.push({
        user_id: targetUser.id,
        hotel_id: hotels[2].id
      });
    }

    console.log(`\nCreating ${favorites.length} favorite records...`);

    // 插入收藏记录
    for (const favorite of favorites) {
      try {
        const [createdFavorite, created] = await Favorite.findOrCreate({
          where: {
            user_id: favorite.user_id,
            hotel_id: favorite.hotel_id
          },
          defaults: favorite
        });

        if (created) {
          console.log(`✓ Created favorite for user ${favorite.user_id} and hotel ${favorite.hotel_id}`);
        } else {
          console.log(`⚠️  Favorite already exists for user ${favorite.user_id} and hotel ${favorite.hotel_id}`);
        }
      } catch (error) {
        console.error(`❌ Error creating favorite for user ${favorite.user_id} and hotel ${favorite.hotel_id}:`, error.message);
      }
    }

    console.log('\n✅ All favorite data seeded successfully!');

    // 为手机号18595890987的用户添加历史记录
    console.log('\n🌱 Seeding history data...');

    const histories = [];

    // 为目标用户添加前2个酒店的历史记录
    if (targetUser && hotels.length >= 2) {
      histories.push({
        user_id: targetUser.id,
        hotel_id: hotels[0].id,
        viewed_at: new Date()
      });
      histories.push({
        user_id: targetUser.id,
        hotel_id: hotels[1].id,
        viewed_at: new Date(Date.now() - 86400000) // 1天前
      });
    }

    console.log(`\nCreating ${histories.length} history records...`);

    // 插入历史记录
    for (const history of histories) {
      try {
        const [createdHistory, created] = await History.findOrCreate({
          where: {
            user_id: history.user_id,
            hotel_id: history.hotel_id
          },
          defaults: history
        });

        if (created) {
          console.log(`✓ Created history for user ${history.user_id} and hotel ${history.hotel_id}`);
        } else {
          console.log(`⚠️  History already exists for user ${history.user_id} and hotel ${history.hotel_id}`);
        }
      } catch (error) {
        console.error(`❌ Error creating history for user ${history.user_id} and hotel ${history.hotel_id}:`, error.message);
      }
    }

    console.log('\n✅ All history data seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding favorites and histories:', error);
    process.exit(1);
  } finally {
    await require('../src/models').sequelize.close();
    console.log('\n🔌 Connection closed.');
  }
}

seedFavorites();
