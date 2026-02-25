const { Favorite, User } = require('./src/models');

// 测试用户ID
const testUserId = '00000000-0000-4000-8000-000000000000';

// 测试的酒店ID
const hotelId = '80f9edf1-9a7a-4f29-8d43-8735ad83fa16'; // 易宿酒店

async function testFavoriteService() {
  try {
    console.log('🔄 Testing favorite service...');
    await require('./src/models').sequelize.authenticate();
    console.log('✅ Connected successfully!');

    // 导入收藏服务
    const { addFavoriteService, removeFavoriteService, getFavoriteListService } = require('./src/services/mobile/favorite');

    // 1. 测试添加收藏
    console.log('\n1. Testing add favorite...');
    const addResult = await addFavoriteService(testUserId, hotelId);
    console.log('Add favorite result:', addResult);

    // 2. 测试获取收藏列表
    console.log('\n2. Testing get favorite list...');
    const listResult = await getFavoriteListService(testUserId);
    console.log('Get favorite list result:', listResult);

    // 3. 测试取消收藏
    console.log('\n3. Testing remove favorite...');
    const removeResult = await removeFavoriteService(testUserId, hotelId);
    console.log('Remove favorite result:', removeResult);

    // 4. 再次测试获取收藏列表
    console.log('\n4. Testing get favorite list again...');
    const listResultAgain = await getFavoriteListService(testUserId);
    console.log('Get favorite list result again:', listResultAgain);

    console.log('\n✅ All tests completed!');

  } catch (error) {
    console.error('❌ Error testing favorite service:', error);
  } finally {
    await require('./src/models').sequelize.close();
    console.log('🔌 Connection closed.');
  }
}

testFavoriteService();
