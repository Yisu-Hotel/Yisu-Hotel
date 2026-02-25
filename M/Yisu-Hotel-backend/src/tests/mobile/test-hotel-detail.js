const axios = require('axios');

async function testHotelDetailAPI() {
  try {
    // 使用一个有效的酒店ID进行测试
    const hotelId = 'b918694d-61f7-4f94-8b19-930729b8a5be';
    const response = await axios.get(`http://localhost:3001/mobile/hotel/${hotelId}`);
    
    console.log('API Response:', JSON.stringify(response.data, null, 2));
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error testing API:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testHotelDetailAPI();
