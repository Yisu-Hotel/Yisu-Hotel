const axios = require('axios');

// 测试的酒店ID
const hotelId = '80f9edf1-9a7a-4f29-8d43-8735ad83fa16'; // 易宿酒店

async function testFavoriteAPINoAuth() {
  try {
    console.log('🔄 Testing favorite API without authentication...');

    // 1. 测试添加收藏（无认证）
    console.log('\n1. Testing add favorite (no auth)...');
    const addFavoriteResponse = await axios.post('http://localhost:3001/mobile/favorite/add', {
      hotel_id: hotelId
    });

    console.log('Add favorite response:', addFavoriteResponse.data);

    // 2. 测试获取收藏列表（无认证）
    console.log('\n2. Testing get favorite list (no auth)...');
    const getFavoriteListResponse = await axios.get('http://localhost:3001/mobile/favorite/list');

    console.log('Get favorite list response:', getFavoriteListResponse.data);

    // 3. 测试取消收藏（无认证）
    console.log('\n3. Testing remove favorite (no auth)...');
    const removeFavoriteResponse = await axios.post('http://localhost:3001/mobile/favorite/remove', {
      hotel_id: hotelId
    });

    console.log('Remove favorite response:', removeFavoriteResponse.data);

    // 4. 再次测试获取收藏列表（无认证）
    console.log('\n4. Testing get favorite list again (no auth)...');
    const getFavoriteListResponseAgain = await axios.get('http://localhost:3001/mobile/favorite/list');

    console.log('Get favorite list response again:', getFavoriteListResponseAgain.data);

    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.error('❌ Error testing favorite API:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testFavoriteAPINoAuth();
