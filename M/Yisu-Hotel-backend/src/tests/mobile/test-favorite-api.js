const axios = require('axios');

// 测试用户的手机号和密码
const phone = '18595890988'; // 新手机号
const password = 'Test123456';

// 测试的酒店ID
const hotelId = '80f9edf1-9a7a-4f29-8d43-8735ad83fa16'; // 易宿酒店

async function testFavoriteAPI() {
  try {
    console.log('🔄 Testing favorite API...');

    // 1. 发送验证码
    console.log('\n1. Sending verification code...');
    const sendCodeResponse = await axios.post('http://localhost:3001/mobile/auth/send-code', {
      phone,
      type: 'register'
    });

    if (sendCodeResponse.data.code !== 0) {
      console.error('❌ Send code failed:', sendCodeResponse.data.msg);
      return;
    }

    console.log('✅ Verification code sent successfully!');
    console.log('Please check your phone for the verification code.');
    
    // 2. 注册新用户
    console.log('\n2. Registering new user...');
    const registerResponse = await axios.post('http://localhost:3001/mobile/auth/register', {
      phone,
      code: '123456', // 模拟验证码
      password,
      agreed: true
    });

    if (registerResponse.data.code !== 0) {
      console.error('❌ Register failed:', registerResponse.data.msg);
      return;
    }

    console.log('✅ Register successful!');

    // 3. 登录获取token
    console.log('\n3. Logging in...');
    const loginResponse = await axios.post('http://localhost:3001/mobile/auth/login', {
      phone,
      password
    });

    if (loginResponse.data.code !== 0) {
      console.error('❌ Login failed:', loginResponse.data.msg);
      return;
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful!');

    // 4. 测试添加收藏
    console.log('\n4. Testing add favorite...');
    const addFavoriteResponse = await axios.post('http://localhost:3001/mobile/favorite/add', {
      hotel_id: hotelId
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Add favorite response:', addFavoriteResponse.data);

    // 5. 测试获取收藏列表
    console.log('\n5. Testing get favorite list...');
    const getFavoriteListResponse = await axios.get('http://localhost:3001/mobile/favorite/list', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Get favorite list response:', getFavoriteListResponse.data);

    // 6. 测试取消收藏
    console.log('\n6. Testing remove favorite...');
    const removeFavoriteResponse = await axios.post('http://localhost:3001/mobile/favorite/remove', {
      hotel_id: hotelId
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Remove favorite response:', removeFavoriteResponse.data);

    // 7. 再次测试获取收藏列表
    console.log('\n7. Testing get favorite list again...');
    const getFavoriteListResponseAgain = await axios.get('http://localhost:3001/mobile/favorite/list', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Get favorite list response again:', getFavoriteListResponseAgain.data);

    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.error('❌ Error testing favorite API:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testFavoriteAPI();
