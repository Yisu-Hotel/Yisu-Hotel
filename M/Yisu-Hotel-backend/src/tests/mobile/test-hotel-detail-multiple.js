const axios = require('axios');

async function testHotelDetailAPI() {
  try {
    // 测试多个酒店ID
    const hotelIds = [
      '80f9edf1-9a7a-4f29-8d43-8735ad83fa16', // 易宿酒店
      '8fb6e499-8c4f-48d1-88b2-9a039a43cdac', // 阳光酒店
      '12b88220-e12e-4cfb-9d9f-fd962775ac73'  // 海景酒店
    ];

    for (const hotelId of hotelIds) {
      console.log(`\n=== Testing hotel ID: ${hotelId} ===`);
      try {
        const response = await axios.get(`http://localhost:3001/mobile/hotel/${hotelId}`);
        console.log('Hotel name:', response.data.data.hotel_name_cn);
        console.log('API Response Status:', response.status);
      } catch (error) {
        console.error('Error testing API for hotel ID', hotelId, ':', error.message);
        if (error.response) {
          console.error('Response data:', error.response.data);
        }
      }
    }

    console.log('\nTest completed!');
  } catch (error) {
    console.error('Error running test:', error.message);
  }
}

testHotelDetailAPI();
