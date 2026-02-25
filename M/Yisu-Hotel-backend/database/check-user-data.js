const { User, Favorite, History, Hotel } = require('../src/models');

async function checkUserData() {
  try {
    console.log('🔄 Connecting to database...');
    await require('../src/models').sequelize.authenticate();
    console.log('✅ Connected successfully!');

    const phone = '18595890987';
    console.log(`\n📱 Checking user with phone: ${phone}`);

    // 查找用户
    const user = await User.findOne({ where: { phone } });

    if (!user) {
      console.log('❌ User not found!');
      console.log('\n📋 Available users:');
      const allUsers = await User.findAll({ attributes: ['id', 'phone', 'nickname', 'role'] });
      allUsers.forEach(u => {
        console.log(`  - ${u.phone} (${u.nickname}) - ${u.role}`);
      });
      process.exit(1);
    }

    console.log(`✅ User found: ${user.phone} (${user.nickname}) - ${user.role}`);
    console.log(`   User ID: ${user.id}`);

    // 检查收藏记录
    console.log('\n❤️ Checking favorite records...');
    const favorites = await Favorite.findAll({ where: { user_id: user.id } });

    if (favorites.length === 0) {
      console.log('❌ No favorite records found for this user');
    } else {
      console.log(`✅ Found ${favorites.length} favorite records:`);
      for (const fav of favorites) {
        // 单独查询酒店信息
        const hotel = await Hotel.findByPk(fav.hotel_id, { attributes: ['id', 'hotel_name_cn', 'hotel_name_en', 'star_rating'] });
        console.log(`   - Hotel: ${hotel?.hotel_name_cn || 'Unknown'}`);
        console.log(`     Hotel ID: ${fav.hotel_id}`);
        console.log(`     Favorite ID: ${fav.id}`);
        console.log(`     Created at: ${fav.created_at}`);
      }
    }

    // 检查历史记录
    console.log('\n📜 Checking history records...');
    const histories = await History.findAll({ where: { user_id: user.id } });

    if (histories.length === 0) {
      console.log('❌ No history records found for this user');
    } else {
      console.log(`✅ Found ${histories.length} history records:`);
      for (const history of histories) {
        // 单独查询酒店信息
        const hotel = await Hotel.findByPk(history.hotel_id, { attributes: ['id', 'hotel_name_cn', 'hotel_name_en', 'star_rating'] });
        console.log(`   - Hotel: ${hotel?.hotel_name_cn || 'Unknown'}`);
        console.log(`     History ID: ${history.id}`);
        console.log(`     Created at: ${history.created_at}`);
      }
    }

    console.log('\n✅ Check completed!');

  } catch (error) {
    console.error('❌ Error checking user data:', error);
    process.exit(1);
  } finally {
    await require('../src/models').sequelize.close();
    console.log('\n🔌 Connection closed.');
  }
}

checkUserData();
